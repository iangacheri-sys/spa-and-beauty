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
  const weekDates = AVAILABLE_DATES.slice(weekOffset * 7, weekOffset * 7 + 7);
  const hasNextWeek = (weekOffset + 1) * 7 < AVAILABLE_DATES.length;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const selectedStaff = STAFF.find((s) => s.id === selectedStaffId);

  async function confirmBooking() {
    if (!service || !selectedStaffId || !selectedDate || !selectedTime) return;
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addBooking({
      serviceId: service.id,
      staffId: selectedStaffId,
      date: formatDateKey(selectedDate),
      timeSlot: selectedTime,
      notes,
      status: 'upcoming',
    });
    setLoading(false);
    Alert.alert(
      'Booking Confirmed!',
      `Your ${service.name} appointment has been booked for ${selectedDate.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })} at ${selectedTime}.`,
      [{ text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') }],
    );
  }

  const canNext = [
    !!selectedStaffId,
    !!(selectedDate && selectedTime),
    true,
  ][step];

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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 20,
      marginBottom: 10,
      gap: 12,
      borderWidth: 2,
    },
    staffAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    staffInitials: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
    staffInfo: { flex: 1 },
    staffName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    staffSpec: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    staffMeta: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    weekNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    weekLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    weekNavBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.secondary,
      alignItems: 'center', justifyContent: 'center',
    },
    datesRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
    dateBtn: {
      flex: 1, alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    dateDayText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
    dateNumText: { fontSize: 17, fontFamily: 'Inter_700Bold', marginTop: 2 },
    timeSlotsTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground, paddingHorizontal: 20, marginBottom: 10 },
    timeSlotsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
    timeSlot: {
      width: '30%',
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1.5,
    },
    timeSlotText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
    reviewCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginHorizontal: 20,
      padding: 16,
      marginBottom: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    reviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    reviewLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    reviewValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    reviewTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
    reviewTotalLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    reviewTotalValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.primary },
    notesInput: {
      backgroundColor: colors.card,
      borderRadius: 14,
      marginHorizontal: 20,
      padding: 14,
      height: 80,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      textAlignVertical: 'top',
    },
    notesLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground, paddingHorizontal: 20, marginBottom: 8 },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 14,
      paddingBottom: Math.max(bottomInset + 14, 24),
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    nextBtn: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 14,
      alignItems: 'center',
    },
    nextBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  });

  const monthLabel = weekDates.length > 0
    ? `${MONTHS[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`
    : '';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => (step === 0 ? router.back() : setStep(step - 1))}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>{service?.name ?? 'Book Appointment'}</Text>
          <Text style={s.headerSub}>Step {step + 1} of 3</Text>
        </View>
      </View>

      <View style={s.progress}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                flex: 1,
                backgroundColor: i <= step ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {step === 0 && (
          <>
            <Text style={s.stepTitle}>Choose your specialist</Text>
            {specialists.map((member) => {
              const active = selectedStaffId === member.id;
              return (
                <Pressable
                  key={member.id}
                  style={[
                    s.staffCard,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.secondary : colors.card,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedStaffId(member.id);
                  }}
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
                    style={[
                      s.dateBtn,
                      {
                        backgroundColor: selected ? colors.primary : colors.card,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
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
                        style={[
                          s.timeSlot,
                          {
                            backgroundColor: active ? colors.primary : colors.card,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedTime(slot);
                        }}
                      >
                        <Text style={[s.timeSlotText, { color: active ? '#fff' : colors.foreground }]}>
                          {slot}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

        {step === 2 && service && (
          <>
            <Text style={s.stepTitle}>Confirm booking</Text>
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
      </ScrollView>

      <View style={s.footer}>
        <Pressable
          style={[s.nextBtn, { backgroundColor: canNext ? colors.primary : colors.border }]}
          disabled={!canNext || loading}
          onPress={() => {
            if (step < 2) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStep(step + 1);
            } else {
              confirmBooking();
            }
          }}
        >
          <Text style={s.nextBtnText}>
            {step === 2 ? (loading ? 'Booking...' : 'Confirm Booking') : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
