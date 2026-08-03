import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBookings } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { formatDate, formatPrice } from '@/constants/data';
import { Booking } from '@/context/BookingContext';
import { apiFetch } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Therapist {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<Booking['status'], { bg: string; text: string; label: string }> = {
  upcoming: { bg: '#E8F5E9', text: '#2E7D32', label: 'Upcoming' },
  completed: { bg: '#F3E5F5', text: '#6A1B9A', label: 'Completed' },
  cancelled: { bg: '#FFEBEE', text: '#C62828', label: 'Cancelled' },
  'no-show': { bg: '#FFEBEE', text: '#C62828', label: 'No Show' },
};

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookings, cancelBooking, isLoading: bookingsLoading } = useBookings();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const [services, setServices] = useState<Record<string, Service>>({});
  const [therapists, setTherapists] = useState<Record<string, Therapist>>({});
  const [loadingExtras, setLoadingExtras] = useState(true);

  const { user } = useAuth(); // ADDED THIS

  useEffect(() => {
    async function loadData() {
      if (!user) return; // DON'T FETCH IF NOT LOGGED IN
      try {
        const [servicesRes, therapistsRes] = await Promise.all([
          apiFetch<Service[]>('/services'),
          apiFetch<Therapist[]>('/therapists')
        ]);
        const srvMap: Record<string, Service> = {};
        servicesRes.forEach(s => srvMap[s.id] = s);
        
        const thMap: Record<string, Therapist> = {};
        therapistsRes.forEach(t => thMap[t.id] = t);

        setServices(srvMap);
        setTherapists(thMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingExtras(false);
      }
    }
    loadData();
  }, [user]);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [bookings],
  );

  const past = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== 'upcoming')
        .sort((a, b) => b.date.localeCompare(a.date)),
    [bookings],
  );

  const displayed = tab === 'upcoming' ? upcoming : past;

  function handleCancel(id: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: () => cancelBooking(id),
        },
      ],
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topInset + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 4,
      marginHorizontal: 20,
      marginBottom: 16,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 9,
      alignItems: 'center',
    },
    tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    serviceName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.foreground, flex: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
    badgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    metaText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    price: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.primary },
    cancelBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.destructive,
    },
    cancelText: { fontSize: 12, color: colors.destructive, fontFamily: 'Inter_500Medium' },
    rebookBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.secondary,
    },
    rebookText: { fontSize: 12, color: colors.primary, fontFamily: 'Inter_500Medium' },
    emptyBox: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 6 },
    bookBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      marginTop: 20,
    },
    bookBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  });

  function renderItem({ item }: { item: Booking }) {
    const service = services[item.serviceId];
    const staff = therapists[item.therapistId];
    const statusKey = (item.status || 'upcoming').toLowerCase() as keyof typeof STATUS_COLORS;
    const statusStyle = STATUS_COLORS[statusKey] || { bg: '#F1F5F9', text: '#64748B', label: item.status };
    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <Text style={s.serviceName}>{service?.name ?? 'Service'}</Text>
          <View style={[s.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[s.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.metaRow}>
          <Feather name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={s.metaText}>{formatDate(new Date(item.date))}</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={s.metaText}>{item.timeSlot} · {service?.duration ?? 0} min</Text>
        </View>
        {staff && (
          <View style={s.metaRow}>
            <Feather name="user" size={13} color={colors.mutedForeground} />
            <Text style={s.metaText}>with {staff.name}</Text>
          </View>
        )}
        {item.depositAmount !== undefined && item.depositAmount > 0 && (
          <View style={[s.metaRow, { marginTop: 4 }]}>
            <Feather name="credit-card" size={13} color={colors.primary} />
            <Text style={[s.metaText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              Deposit Paid: {formatPrice(item.depositAmount)}
            </Text>
          </View>
        )}
        {item.balanceDue !== undefined && item.balanceDue > 0 && item.status === 'upcoming' && (
          <View style={s.metaRow}>
            <Feather name="alert-circle" size={13} color={colors.mutedForeground} />
            <Text style={s.metaText}>
              Balance Due: {formatPrice(item.balanceDue)}
            </Text>
          </View>
        )}
        <View style={s.bottomRow}>
          <Text style={s.price}>{formatPrice(service?.price ?? 0)}</Text>
          {item.status === 'upcoming' ? (
            <Pressable style={s.cancelBtn} onPress={() => handleCancel(item.id)}>
              <Feather name="x" size={12} color={colors.destructive} />
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
          ) : item.status === 'completed' ? (
            <Pressable
              style={s.rebookBtn}
              onPress={() => router.push(`/booking/${item.serviceId}`)}
            >
              <Feather name="refresh-cw" size={12} color={colors.primary} />
              <Text style={s.rebookText}>Rebook</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Feather name="calendar" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
        <Text style={[s.emptyTitle, { marginTop: 0 }]}>Sign in to view your bookings</Text>
        <Text style={s.emptySubtitle}>Track your upcoming appointments and past history.</Text>
        <Pressable style={s.bookBtn} onPress={() => router.push('/login')}>
          <Text style={s.bookBtnText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>My Bookings</Text>
      </View>
      <View style={s.tabRow}>
        {(['upcoming', 'past'] as const).map((t) => (
          <Pressable
            key={t}
            style={[s.tabBtn, { backgroundColor: tab === t ? colors.card : 'transparent' }]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                s.tabText,
                { color: tab === t ? colors.foreground : colors.mutedForeground },
              ]}
            >
              {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(bottomInset + 100, 100) }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Feather name="calendar" size={48} color={colors.border} />
            <Text style={s.emptyTitle}>
              {tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            </Text>
            <Text style={s.emptySubtitle}>
              {tab === 'upcoming'
                ? 'Book a service and pamper yourself'
                : 'Your completed appointments will appear here'}
            </Text>
            {tab === 'upcoming' && (
              <Pressable style={s.bookBtn} onPress={() => router.push('/(tabs)/services')}>
                <Text style={s.bookBtnText}>Browse Services</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}
