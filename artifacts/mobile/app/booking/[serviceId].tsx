import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBookings } from '@/context/BookingContext';
import { useColors } from '@/hooks/useColors';
import {
  SERVICES,
  STAFF,
  TIME_SLOTS,
  formatPrice,
  getAvailableDates,
  formatDateKey,
} from '@/constants/data';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AVAILABLE_DATES = getAvailableDates();
const TOTAL_STEPS = 4;

const API_BASE = process.env['EXPO_PUBLIC_DOMAIN']
  ? `https://${process.env['EXPO_PUBLIC_DOMAIN']}/api`
  : '/api';

function formatCardNumber(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useBookings();

  const service = SERVICES.find((s) => s.id === serviceId);
  const specialists = service ? STAFF.filter((s) => service.staffIds.includes(s.id)) : [];

  const [step, setStep] = useState(0);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Payment state
  const [payMethod, setPayMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const weekDates = AVAILABLE_DATES.slice(weekOffset * 7, weekOffset * 7 + 7);
  const hasNextWeek = (weekOffset + 1) * 7 < AVAILABLE_DATES.length;
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const selectedStaff = STAFF.find((s) => s.id === selectedStaffId);

  const payReady =
    payMethod === 'mpesa'
      ? mpesaPhone.replace(/\D/g, '').length >= 9
      : cardNumber.replace(/\s/g, '').length === 16 &&
        cardExpiry.length === 5 &&
        cardCvv.length >= 3 &&
        cardName.trim().length > 0;

  const canNext = [
    !!selectedStaffId,
    !!(selectedDate && selectedTime),
    true,
    payReady,
  ][step];

  async function completeBooking(method: string) {
    if (!service || !selectedStaffId || !selectedDate || !selectedTime) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addBooking({
      serviceId: service.id,
      staffId: selectedStaffId,
      date: formatDateKey(selectedDate),
      timeSlot: selectedTime,
      notes,
      status: 'upcoming',
    });
    Alert.alert(
      'Booking Confirmed!',
      `Your ${service.name} appointment has been confirmed.\n\nPayment: ${method === 'mpesa' ? 'M-Pesa' : 'Card'} · ${formatPrice(service.price)}`,
      [{ text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') }],
    );
  }

  async function confirmPayment() {
    if (!service) return;
    setLoading(true);
    try {
      if (payMethod === 'mpesa') {
        const res = await fetch(`${API_BASE}/payments/mpesa/stkpush`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: mpesaPhone,
            amount: service.price,
            description: `${service.name} booking`,
          }),
        });
        const data = (await res.json()) as {
          success: boolean;
          demo?: boolean;
          checkoutRequestId?: string;
          customerMessage?: string;
          error?: string;
        };
        if (!data.success) throw new Error(data.error ?? 'Payment failed');
        if (data.demo) {
          await completeBooking('mpesa');
        } else {
          Alert.alert(
            'Check Your Phone',
            `${data.customerMessage ?? 'An M-Pesa prompt has been sent to your phone.'}\n\nApprove the payment to complete your booking.`,
            [{ text: 'Done', onPress: () => completeBooking('mpesa') }],
          );
        }
      } else {
        const res = await fetch(`${API_BASE}/payments/card/charge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: service.price,
            description: `${service.name} booking`,
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiry: cardExpiry,
            cvv: cardCvv,
            name: cardName,
          }),
        });
        const data = (await res.json()) as {
          success: boolean;
          demo?: boolean;
          transactionId?: string;
          error?: string;
        };
        if (!data.success) throw new Error(data.error ?? 'Card payment failed');
        await completeBooking('card');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      Alert.alert('Payment Failed', message);
    } finally {
      setLoading(false);
    }
  }

  const monthLabel =
    weekDates.length > 0
      ? `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`
      : '';

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: topInset + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.secondary,
      alignItems: 'center', justifyContent: 'center',
    },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: colors.foreground },
    headerSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    progress: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 20, paddingVertical: 16 },
    dot: { height: 4, borderRadius: 2 },
    stepTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.foreground, paddingHorizontal: 20, marginBottom: 16 },
    staffCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.card, borderRadius: 14,
      padding: 14, marginHorizontal: 20, marginBottom: 10,
      gap: 12, borderWidth: 2,
    },
    staffAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    staffInitials: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
    staffInfo: { flex: 1 },
    staffName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    staffSpec: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    staffMeta: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    weekNav: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12,
    },
    weekLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    weekNavBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center',
    },
    datesRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
    dateBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
    dateDayText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
    dateNumText: { fontSize: 17, fontFamily: 'Inter_700Bold', marginTop: 2 },
    timeSlotsTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground, paddingHorizontal: 20, marginBottom: 10 },
    timeSlotsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
    timeSlot: { width: '30%', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
    timeSlotText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
    reviewCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      marginHorizontal: 20, padding: 16, marginBottom: 16,
      elevation: 1, shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    reviewRow: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    reviewLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    reviewValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    reviewTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
    reviewTotalLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    reviewTotalValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.primary },
    notesInput: {
      backgroundColor: colors.card, borderRadius: 14,
      marginHorizontal: 20, padding: 14, height: 80,
      borderWidth: 1, borderColor: colors.border,
      color: colors.foreground, fontFamily: 'Inter_400Regular',
      fontSize: 14, textAlignVertical: 'top',
    },
    notesLabel: {
      fontSize: 15, fontFamily: 'Inter_600SemiBold',
      color: colors.foreground, paddingHorizontal: 20, marginBottom: 8,
    },
    fieldInput: {
      backgroundColor: colors.card, borderRadius: 14,
      marginHorizontal: 20, padding: 14, height: 52,
      borderWidth: 1, borderColor: colors.border,
      color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15,
      marginBottom: 14,
    },
    footer: {
      flexDirection: 'row', gap: 10, paddingHorizontal: 20,
      paddingVertical: 14,
      paddingBottom: Math.max(bottomInset + 14, 24),
      backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
    },
    nextBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
    nextBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
    methodRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
    methodCard: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingVertical: 18, borderRadius: 16, borderWidth: 2,
      gap: 6,
    },
    methodLabel: { fontSize: 14, fontFamily: 'Inter_700Bold' },
    infoText: {
      paddingHorizontal: 20, fontSize: 12.5,
      color: colors.mutedForeground, fontFamily: 'Inter_400Regular',
      marginTop: -6, marginBottom: 18, lineHeight: 19,
    },
    dualRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 14 },
    dualLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginBottom: 8 },
    dualInput: {
      backgroundColor: colors.card, borderRadius: 14, padding: 14, height: 52,
      borderWidth: 1, borderColor: colors.border,
      color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15,
    },
  });

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => (step === 0 ? router.back() : setStep(step - 1))}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>{service?.name ?? 'Book Appointment'}</Text>
          <Text style={s.headerSub}>Step {step + 1} of {TOTAL_STEPS}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={s.progress}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[s.dot, { flex: 1, backgroundColor: i <= step ? colors.primary : colors.border }]}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Step 0 — Choose specialist */}
        {step === 0 && (
          <>
            <Text style={s.stepTitle}>Choose your specialist</Text>
            {specialists.map((member) => {
              const active = selectedStaffId === member.id;
              return (
                <Pressable
                  key={member.id}
                  style={[s.staffCard, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.secondary : colors.card }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedStaffId(member.id); }}
                >
                  <View style={[s.staffAvatar, { backgroundColor: member.avatarColor }]}>
                    <Text style={s.staffInitials}>{member.initials}</Text>
                  </View>
                  <View style={s.staffInfo}>
                    <Text style={s.staffName}>{member.name}</Text>
                    <Text style={s.staffSpec}>{member.specialty}</Text>
                    <Text style={s.staffMeta}>{member.experience} experience</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Feather name="star" size={13} color={colors.accent} />
                      <Text style={[s.staffMeta, { fontFamily: 'Inter_600SemiBold' }]}>{member.rating}</Text>
                    </View>
                    {active && <Feather name="check-circle" size={18} color={colors.primary} />}
                  </View>
                </Pressable>
              );
            })}
          </>
        )}

        {/* Step 1 — Choose date & time */}
        {step === 1 && (
          <>
            <Text style={s.stepTitle}>Choose a date</Text>
            <View style={s.weekNav}>
              <Text style={s.weekLabel}>{monthLabel}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  style={[s.weekNavBtn, { opacity: weekOffset === 0 ? 0.3 : 1 }]}
                  onPress={() => weekOffset > 0 && setWeekOffset(weekOffset - 1)}
                  disabled={weekOffset === 0}
                >
                  <Feather name="chevron-left" size={16} color={colors.foreground} />
                </Pressable>
                <Pressable
                  style={[s.weekNavBtn, { opacity: hasNextWeek ? 1 : 0.3 }]}
                  onPress={() => hasNextWeek && setWeekOffset(weekOffset + 1)}
                  disabled={!hasNextWeek}
                >
                  <Feather name="chevron-right" size={16} color={colors.foreground} />
                </Pressable>
              </View>
            </View>
            <View style={s.datesRow}>
              {weekDates.map((date, i) => {
                const key = formatDateKey(date);
                const selected = selectedDate ? formatDateKey(selectedDate) === key : false;
                return (
                  <Pressable
                    key={i}
                    style={[s.dateBtn, { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border }]}
                    onPress={() => { Haptics.selectionAsync(); setSelectedDate(date); setSelectedTime(null); }}
                  >
                    <Text style={[s.dateDayText, { color: selected ? 'rgba(255,255,255,0.8)' : colors.mutedForeground }]}>
                      {DAYS[date.getDay()]}
                    </Text>
                    <Text style={[s.dateNumText, { color: selected ? '#fff' : colors.foreground }]}>
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedDate && (
              <>
                <Text style={s.timeSlotsTitle}>Available times</Text>
                <View style={s.timeSlotsGrid}>
                  {TIME_SLOTS.map((slot) => {
                    const active = selectedTime === slot;
                    return (
                      <Pressable
                        key={slot}
                        style={[s.timeSlot, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}
                        onPress={() => { Haptics.selectionAsync(); setSelectedTime(slot); }}
                      >
                        <Text style={[s.timeSlotText, { color: active ? '#fff' : colors.foreground }]}>{slot}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

        {/* Step 2 — Review & notes */}
        {step === 2 && service && (
          <>
            <Text style={s.stepTitle}>Review booking</Text>
            <View style={s.reviewCard}>
              {[
                { label: 'Service', value: service.name },
                { label: 'Specialist', value: selectedStaff?.name ?? '' },
                { label: 'Date', value: selectedDate?.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' }) ?? '' },
                { label: 'Time', value: selectedTime ?? '' },
                { label: 'Duration', value: `${service.duration} minutes` },
              ].map(({ label, value }, i, arr) => (
                <View key={label} style={[s.reviewRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}>
                  <Text style={s.reviewLabel}>{label}</Text>
                  <Text style={s.reviewValue}>{value}</Text>
                </View>
              ))}
              <View style={s.reviewTotal}>
                <Text style={s.reviewTotalLabel}>Total</Text>
                <Text style={s.reviewTotalValue}>{formatPrice(service.price)}</Text>
              </View>
            </View>
            <Text style={s.notesLabel}>Notes (optional)</Text>
            <TextInput
              style={s.notesInput}
              placeholder="Any special requests or preferences..."
              placeholderTextColor={colors.mutedForeground}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && service && (
          <>
            <Text style={s.stepTitle}>Payment</Text>

            {/* Method pills */}
            <View style={s.methodRow}>
              <Pressable
                style={[s.methodCard, {
                  borderColor: payMethod === 'mpesa' ? '#00A651' : colors.border,
                  backgroundColor: payMethod === 'mpesa' ? '#E8F8EF' : colors.card,
                }]}
                onPress={() => { Haptics.selectionAsync(); setPayMethod('mpesa'); }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#00A651', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 17 }}>M</Text>
                </View>
                <Text style={[s.methodLabel, { color: payMethod === 'mpesa' ? '#00A651' : colors.foreground }]}>M-Pesa</Text>
                {payMethod === 'mpesa' && <Feather name="check-circle" size={16} color="#00A651" />}
              </Pressable>

              <Pressable
                style={[s.methodCard, {
                  borderColor: payMethod === 'card' ? colors.primary : colors.border,
                  backgroundColor: payMethod === 'card' ? colors.secondary : colors.card,
                }]}
                onPress={() => { Haptics.selectionAsync(); setPayMethod('card'); }}
              >
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <View style={{ width: 30, height: 20, backgroundColor: '#1A1F71', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Inter_700Bold' }}>VISA</Text>
                  </View>
                  <View style={{ width: 30, height: 20, backgroundColor: '#006FCF', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 6, fontFamily: 'Inter_700Bold' }}>AMEX</Text>
                  </View>
                </View>
                <Text style={[s.methodLabel, { color: payMethod === 'card' ? colors.primary : colors.foreground }]}>Card</Text>
                {payMethod === 'card' && <Feather name="check-circle" size={16} color={colors.primary} />}
              </Pressable>
            </View>

            {/* M-Pesa form */}
            {payMethod === 'mpesa' && (
              <>
                <Text style={s.notesLabel}>M-Pesa Phone Number</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="e.g. 0712 345 678"
                  placeholderTextColor={colors.mutedForeground}
                  value={mpesaPhone}
                  onChangeText={setMpesaPhone}
                  keyboardType="phone-pad"
                />
                <Text style={s.infoText}>
                  You'll receive a payment prompt on your phone. Approve it within 60 seconds to complete your booking.
                </Text>
              </>
            )}

            {/* Card form */}
            {payMethod === 'card' && (
              <>
                <Text style={s.notesLabel}>Card Number</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.mutedForeground}
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  keyboardType="number-pad"
                  maxLength={19}
                />
                <View style={s.dualRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dualLabel}>Expiry</Text>
                    <TextInput
                      style={s.dualInput}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.mutedForeground}
                      value={cardExpiry}
                      onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.dualLabel}>CVV</Text>
                    <TextInput
                      style={s.dualInput}
                      placeholder="123"
                      placeholderTextColor={colors.mutedForeground}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
                <Text style={s.notesLabel}>Cardholder Name</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="Full name on card"
                  placeholderTextColor={colors.mutedForeground}
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="words"
                />
              </>
            )}

            {/* Amount summary */}
            <View style={[s.reviewCard, { marginTop: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.reviewLabel}>Service</Text>
                <Text style={s.reviewValue}>{service.name}</Text>
              </View>
              <View style={[s.reviewTotal, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10 }]}>
                <Text style={s.reviewTotalLabel}>Amount Due</Text>
                <Text style={s.reviewTotalValue}>{formatPrice(service.price)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <Pressable
          style={[s.nextBtn, { backgroundColor: canNext ? colors.primary : colors.border, opacity: loading ? 0.7 : 1 }]}
          disabled={!canNext || loading}
          onPress={() => {
            if (step < 3) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStep(step + 1);
            } else {
              confirmPayment();
            }
          }}
        >
          <Text style={s.nextBtnText}>
            {step < 2
              ? 'Continue'
              : step === 2
              ? 'Choose Payment'
              : loading
              ? 'Processing...'
              : `Pay ${formatPrice(service?.price ?? 0)}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
