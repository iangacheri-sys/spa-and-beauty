import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBookings } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import {
  TIME_SLOTS,
  formatPrice,
  getAvailableDates,
  formatDateKey,
} from '@/constants/data';
import { apiFetch } from '@/lib/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AVAILABLE_DATES = getAvailableDates();
const TOTAL_STEPS = 5;


function formatCardNumber(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  spaId: string;
}

interface Therapist {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  avatarColor?: string;
  initials?: string;
}

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useBookings();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace({
        pathname: '/login',
        params: { returnUrl: `/booking/${serviceId}` }
      });
    }
  }, [user, authLoading, serviceId]);

  const [service, setService] = useState<Service | null>(null);
  const [specialists, setSpecialists] = useState<Therapist[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, therapistsRes] = await Promise.all([
          apiFetch<Service[]>('/services'),
          apiFetch<Therapist[]>('/therapists')
        ]);
        const s = servicesRes.find(x => x.id === serviceId);
        setService(s || null);
        if (s) {
          const spaTherapists = therapistsRes.filter(t => (t as any).spaId === s.spaId);
          setSpecialists(spaTherapists.map(t => ({
            ...t,
            initials: t.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            avatarColor: '#2563EB'
          })));
          
          const [policyRes, settingsRes] = await Promise.all([
            apiFetch<any>(`/messages/policy?spaId=${s.spaId}`).catch(() => null),
            apiFetch<any>(`/settings/payment/${s.spaId}/public`).catch(() => null),
          ]);
          setPolicy(policyRes);
          setPaymentSettings(settingsRes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingExtras(false);
      }
    }
    loadData();
  }, [serviceId]);

  const [step, setStep] = useState(0);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [mpesaStep, setMpesaStep] = useState<'idle' | 'sending' | 'waiting' | 'approved'>('idle');
  const [weekOffset, setWeekOffset] = useState(0);

  // Payment state
  const [payMethod, setPayMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Dynamic deposit calc
  const getDepositAmount = () => {
    if (!service) return 0;
    if (!policy) return service.price * 0.5; // fallback
    if (policy.depositType === 'none') return 0;
    if (policy.depositMinBookingValue > 0 && service.price < policy.depositMinBookingValue) return 0;
    if (policy.depositType === 'fixed') return policy.depositFixed;
    if (policy.depositType === 'percentage') return (service.price * policy.depositPercent) / 100;
    return 0;
  };

  const depositAmount = getDepositAmount();
  const balanceDue = (service?.price || 0) - depositAmount;

  const weekDates = AVAILABLE_DATES.slice(weekOffset * 7, weekOffset * 7 + 7);
  const hasNextWeek = (weekOffset + 1) * 7 < AVAILABLE_DATES.length;
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const selectedStaff = specialists.find((s) => s.id === selectedStaffId);

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
    true, // Review step
    policyAccepted, // Policy step
    payReady, // Payment step
  ][step];

  async function completeBooking(method: string) {
    if (!service || !selectedStaffId || !selectedDate || !selectedTime) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addBooking({
      serviceId: service.id,
      therapistId: selectedStaffId,
      date: formatDateKey(selectedDate),
      timeSlot: selectedTime,
      notes,
      status: 'upcoming',
      depositAmount,
      depositPaid: true,
      balanceDue,
      policyAcknowledged: policyAccepted
    });
    Alert.alert(
      'Booking Confirmed!',
      `Your ${service.name} appointment has been confirmed.\n\nDeposit Paid: ${method === 'mpesa' ? 'M-Pesa' : 'Card'} · ${formatPrice(depositAmount)}\nBalance Due: ${formatPrice(balanceDue)}`,
      [{ text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') }],
    );
  }

  async function confirmPayment() {
    if (!service) return;
    setLoading(true);
    try {
      if (payMethod === 'mpesa') {
        setMpesaStep('sending');

        // Create the booking first to get a bookingId for correlation
        let bookingId: string | undefined;
        try {
          const bookingRes: any = await apiFetch('/bookings', {
            method: 'POST',
            body: JSON.stringify({
              serviceId: service.id,
              therapistId: selectedStaffId,
              date: formatDateKey(selectedDate!),
              timeSlot: selectedTime,
              depositAmount,
              depositPaid: false,
              balanceDue,
              policyAcknowledged: policyAccepted,
            }),
          });
          bookingId = bookingRes?.id;
        } catch (e) {
          console.warn('Could not pre-create booking:', e);
        }

        const stkRes: any = await apiFetch('/payments/mpesa/stkpush', {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: mpesaPhone,
            amount: Math.ceil(depositAmount > 0 ? depositAmount : service.price),
            reference: bookingId || service.id,
            description: `${service.name} deposit`,
            bookingId,
            spaId: service.spaId,
          }),
        });

        if (stkRes.ResponseCode === '0' || stkRes._mock) {
          setMpesaStep('waiting');
          // Show prompt to user
          Alert.alert(
            '📱 Check Your Phone',
            stkRes.CustomerMessage || 'An M-Pesa STK push has been sent to your phone. Enter your PIN to complete payment.',
            [
              {
                text: 'Payment Approved ✓',
                onPress: async () => {
                  setMpesaStep('approved');
                  await new Promise(r => setTimeout(r, 500));
                  setMpesaStep('idle');
                  await completeBooking('mpesa');
                }
              },
            ],
          );
        } else {
          throw new Error(stkRes.errorMessage || stkRes.ResponseDescription || 'M-Pesa request failed');
        }
      } else {
        const data = await apiFetch<{
          success: boolean;
          demo?: boolean;
          transactionId?: string;
          error?: string;
        }>('/payments/card/charge', {
          method: 'POST',
          body: JSON.stringify({
            amount: Math.ceil(depositAmount),
            description: `${service.name} booking deposit`,
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiry: cardExpiry,
            cvv: cardCvv,
            name: cardName,
          }),
        });
        if (!data.success) throw new Error(data.error ?? 'Card payment failed');
        await completeBooking('card');
      }
    } catch (err) {
      setMpesaStep('idle');
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
    nextBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
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
        {[0, 1, 2, 3, 4].map((i) => (
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
              <View style={[s.reviewTotal, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 12, paddingTop: 12 }]}>
                <Text style={s.reviewTotalLabel}>Full Price</Text>
                <Text style={[s.reviewTotalValue, { color: colors.foreground }]}>{formatPrice(service.price)}</Text>
              </View>
              {depositAmount > 0 && (
                <>
                  <View style={[s.reviewTotal, { paddingTop: 4 }]}>
                    <Text style={s.reviewTotalLabel}>Required Deposit</Text>
                    <Text style={s.reviewTotalValue}>{formatPrice(depositAmount)}</Text>
                  </View>
                  <View style={[s.reviewTotal, { paddingTop: 4 }]}>
                    <Text style={[s.reviewTotalLabel, { color: colors.mutedForeground, fontSize: 13 }]}>Balance due at venue</Text>
                    <Text style={[s.reviewTotalValue, { color: colors.mutedForeground, fontSize: 13 }]}>{formatPrice(balanceDue)}</Text>
                  </View>
                </>
              )}
              <View style={[s.reviewTotal, { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12 }]}>
                <Text style={[s.reviewTotalLabel, { color: colors.primary }]}>Loyalty Points to Earn</Text>
                <Text style={[s.reviewTotalValue, { color: colors.primary, fontSize: 16 }]}>+{Math.floor(service.price / 100)} pts</Text>
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

        {/* Step 3 — Policies */}
        {step === 3 && service && (
          <>
            <Text style={s.stepTitle}>Policies & Acknowledgement</Text>
            
            <View style={[s.reviewCard, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Feather name="credit-card" size={16} color={colors.primary} />
                <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground }}>Payment & Deposit</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>
                {policy?.depositPolicyText || 'A deposit is required to secure your booking.'}
              </Text>
            </View>

            <View style={[s.reviewCard, { backgroundColor: colors.destructive + '10', borderColor: colors.destructive + '30', borderWidth: 1, marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Feather name="clock" size={16} color={colors.destructive} />
                <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.destructive }}>Cancellation Policy</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                {policy?.cancellationPolicyText || 'Please cancel at least 24 hours before your appointment.'}
              </Text>
            </View>

            <View style={[s.reviewCard, { backgroundColor: colors.destructive + '10', borderColor: colors.destructive + '30', borderWidth: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Feather name="alert-circle" size={16} color={colors.destructive} />
                <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.destructive }}>No-Show Policy</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                {policy?.noShowPolicyText || 'No-shows will forfeit their deposit.'}
              </Text>
            </View>

            <Pressable 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginTop: 12 }}
              onPress={() => { Haptics.selectionAsync(); setPolicyAccepted(!policyAccepted); }}
            >
              <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: policyAccepted ? colors.primary : colors.border, backgroundColor: policyAccepted ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {policyAccepted && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.foreground }}>
                I have read and agree to the spa's deposit, cancellation, and no-show policies.
              </Text>
            </Pressable>
          </>
        )}

        {/* Step 4 — Payment */}
        {step === 4 && service && (
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
                {/* Show setup warning if spa has no payment settings */}
                {!paymentSettings && (
                  <View style={{ marginHorizontal: 20, marginBottom: 16, padding: 14, borderRadius: 12, backgroundColor: '#FFF3CD', borderWidth: 1, borderColor: '#FBBF24' }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: '#92400E' }}>
                      ⚠️ This spa has not configured payment details yet. Please contact them to proceed.
                    </Text>
                  </View>
                )}

                {/* Dynamic M-Pesa provider badge */}
                {paymentSettings && (
                  <View style={{ marginHorizontal: 20, marginBottom: 14, padding: 14, borderRadius: 14, backgroundColor: '#E8F8EF', borderWidth: 1.5, borderColor: '#00A651' }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: '#00A651', marginBottom: 4 }}>
                      {paymentSettings.activeProvider === 'MPESA_PAYBILL' && '🏢 Lipa na M-Pesa — Paybill'}
                      {paymentSettings.activeProvider === 'MPESA_TILL' && '🛒 Lipa na M-Pesa — Buy Goods (Till)'}
                      {paymentSettings.activeProvider === 'MPESA_POCHI' && '📲 M-Pesa — Pochi la Biashara'}
                    </Text>
                    {paymentSettings.activeProvider === 'MPESA_PAYBILL' && (
                      <>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#065F46' }}>Business No: <Text style={{ fontFamily: 'Inter_700Bold' }}>{paymentSettings.mpesaPaybillNumber}</Text></Text>
                        {paymentSettings.mpesaAccountRef && <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#065F46' }}>Account No: <Text style={{ fontFamily: 'Inter_700Bold' }}>{paymentSettings.mpesaAccountRef}</Text></Text>}
                      </>
                    )}
                    {paymentSettings.activeProvider === 'MPESA_TILL' && (
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#065F46' }}>Till No: <Text style={{ fontFamily: 'Inter_700Bold' }}>{paymentSettings.mpesaTillNumber}</Text></Text>
                    )}
                    {paymentSettings.activeProvider === 'MPESA_POCHI' && (
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#065F46' }}>Phone: <Text style={{ fontFamily: 'Inter_700Bold' }}>{paymentSettings.mpesaPochiNumber}</Text></Text>
                    )}
                    {paymentSettings.instructions && (
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6B7280', marginTop: 6 }}>{paymentSettings.instructions}</Text>
                    )}
                  </View>
                )}

                <Text style={s.notesLabel}>Your M-Pesa Phone Number</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="e.g. 0712 345 678"
                  placeholderTextColor={colors.mutedForeground}
                  value={mpesaPhone}
                  onChangeText={setMpesaPhone}
                  keyboardType="phone-pad"
                />
                <Text style={s.infoText}>
                  You'll receive an M-Pesa STK Push prompt on your phone. Approve it within 60 seconds to complete your booking.
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
                <Text style={s.reviewTotalLabel}>Amount Due Now (Deposit)</Text>
                <Text style={s.reviewTotalValue}>{formatPrice(service.price * 0.5)}</Text>
              </View>
              <View style={[s.reviewTotal, { paddingTop: 4 }]}>
                <Text style={[s.reviewTotalLabel, { color: colors.primary, fontSize: 13 }]}>Points to Earn</Text>
                <Text style={[s.reviewTotalValue, { color: colors.primary, fontSize: 14 }]}>+{Math.floor(service.price / 100)} pts</Text>
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
          {loading && <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />}
          <Text style={s.nextBtnText}>
            {step < 2
              ? 'Continue'
              : step === 2
              ? 'Choose Payment'
              : loading
              ? mpesaStep === 'sending'
                ? 'Sending to phone...'
                : mpesaStep === 'waiting'
                ? 'Waiting for approval...'
                : mpesaStep === 'approved'
                ? '✓ Approved!'
                : 'Processing...'
              : `Pay Deposit ${formatPrice(service?.price ? service.price * 0.5 : 0)}`}
          </Text>
        </Pressable>
      </View>

      {/* M-Pesa Demo Overlay */}
      {mpesaStep !== 'idle' && (
        <View style={{
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
          alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 32,
            alignItems: 'center', width: 300, gap: 16,
          }}>
            {/* M-Pesa Logo area */}
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#00A651', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 26, color: '#fff' }}>M</Text>
            </View>
            <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: '#111', textAlign: 'center' }}>
              {mpesaStep === 'sending' && 'Sending STK Push...'}
              {mpesaStep === 'waiting' && 'Waiting for PIN'}
              {mpesaStep === 'approved' && 'Payment Approved!'}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#666', textAlign: 'center', lineHeight: 20 }}>
              {mpesaStep === 'sending' && `Sending prompt to\n${mpesaPhone}`}
              {mpesaStep === 'waiting' && 'Please enter your M-Pesa PIN\non your phone to confirm payment'}
              {mpesaStep === 'approved' && `Ksh ${service ? Math.ceil(service.price * 0.5).toLocaleString() : '—'} received successfully`}
            </Text>
            {mpesaStep === 'sending' && <ActivityIndicator color="#00A651" size="large" />}
            {mpesaStep === 'waiting' && (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#00A651', opacity: 0.3 + i * 0.35 }} />
                ))}
              </View>
            )}
            {mpesaStep === 'approved' && (
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F8EF', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>✓</Text>
              </View>
            )}
            <Text style={{ fontSize: 11, color: '#999', fontFamily: 'Inter_400Regular' }}>
              🔒 Demo mode — no real charge
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
