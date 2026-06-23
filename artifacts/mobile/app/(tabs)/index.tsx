import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBookings } from '@/context/BookingContext';
import { useColors } from '@/hooks/useColors';
import { SERVICES, STAFF, formatDate, formatPrice } from '@/constants/data';

const GREETING = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
})();

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookings, profile } = useBookings();

  const nextBooking = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null,
    [bookings],
  );

  const nextService = nextBooking ? SERVICES.find((s) => s.id === nextBooking.serviceId) : null;
  const nextStaff = nextBooking ? STAFF.find((s) => s.id === nextBooking.staffId) : null;

  const popularServices = useMemo(
    () => [...SERVICES].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [],
  );

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  function handleServicePress(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/service/${id}`);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topInset + 16,
      paddingHorizontal: 20,
      paddingBottom: 8,
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    greeting: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    name: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.foreground, marginTop: 2 },
    bellBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: 'center', justifyContent: 'center',
      marginTop: topInset > 20 ? 0 : 4,
    },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    seeAll: { fontSize: 13, color: colors.primary, fontFamily: 'Inter_500Medium' },
    nextCard: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    nextInfo: { flex: 1 },
    nextLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_500Medium', letterSpacing: 0.8, textTransform: 'uppercase' },
    nextServiceName: { fontSize: 17, color: '#fff', fontFamily: 'Inter_700Bold', marginTop: 2 },
    nextMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter_400Regular', marginTop: 4 },
    nextIconBox: {
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    emptyCard: {
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    emptyText: { flex: 1 },
    emptyTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    emptySubtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    bookNowBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20,
    },
    bookNowText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
    serviceCard: {
      width: 160,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: 'hidden',
      marginRight: 12,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    serviceImage: { width: 160, height: 120 },
    serviceCardBody: { padding: 10 },
    serviceCardName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    serviceCardMeta: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    serviceCardPrice: { fontSize: 13, color: colors.primary, fontFamily: 'Inter_700Bold', marginTop: 4 },
    staffRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
    staffCard: { alignItems: 'center', gap: 6, width: 72 },
    staffAvatar: {
      width: 56, height: 56, borderRadius: 28,
      alignItems: 'center', justifyContent: 'center',
    },
    staffInitials: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
    staffName: { fontSize: 11, fontFamily: 'Inter_500Medium', color: colors.foreground, textAlign: 'center' },
    staffSpec: { fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
    ratingText: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    pb: { paddingBottom: Math.max(bottomInset + 100, 100) },
  });

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{GREETING}</Text>
          <Text style={s.name}>{profile.name}</Text>
        </View>
        <View style={s.bellBtn}>
          <Feather name="bell" size={18} color={colors.foreground} />
        </View>
      </View>

      <View style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Next Appointment</Text>
        </View>
        {nextBooking && nextService ? (
          <View style={s.nextCard}>
            <View style={s.nextInfo}>
              <Text style={s.nextLabel}>Upcoming</Text>
              <Text style={s.nextServiceName}>{nextService.name}</Text>
              <Text style={s.nextMeta}>
                {formatDate(new Date(nextBooking.date))} · {nextBooking.timeSlot}
              </Text>
              {nextStaff && (
                <Text style={s.nextMeta}>with {nextStaff.name}</Text>
              )}
            </View>
            <View style={s.nextIconBox}>
              <Feather name="calendar" size={22} color="#fff" />
            </View>
          </View>
        ) : (
          <View style={s.emptyCard}>
            <Feather name="calendar" size={28} color={colors.mutedForeground} />
            <View style={s.emptyText}>
              <Text style={s.emptyTitle}>No upcoming bookings</Text>
              <Text style={s.emptySubtitle}>Treat yourself today</Text>
            </View>
            <Pressable style={s.bookNowBtn} onPress={() => router.push('/(tabs)/services')}>
              <Text style={s.bookNowText}>Book</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Popular Services</Text>
          <Pressable onPress={() => router.push('/(tabs)/services')}>
            <Text style={s.seeAll}>See all</Text>
          </Pressable>
        </View>
        <FlatList
          data={popularServices}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={s.serviceCard} onPress={() => handleServicePress(item.id)}>
              <Image source={item.image} style={s.serviceImage} resizeMode="cover" />
              <View style={s.serviceCardBody}>
                <Text style={s.serviceCardName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.serviceCardMeta}>{item.duration} min</Text>
                <View style={s.ratingRow}>
                  <Feather name="star" size={11} color={colors.accent} />
                  <Text style={s.ratingText}>{item.rating} ({item.reviews})</Text>
                </View>
                <Text style={s.serviceCardPrice}>{formatPrice(item.price)}</Text>
              </View>
            </Pressable>
          )}
          contentContainerStyle={{ paddingRight: 20 }}
          scrollEnabled
        />
      </View>

      <View style={{ marginTop: 24, marginBottom: 8, paddingHorizontal: 20 }}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Our Specialists</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.staffRow}>
        {STAFF.map((member) => (
          <View key={member.id} style={s.staffCard}>
            <View style={[s.staffAvatar, { backgroundColor: member.avatarColor }]}>
              <Text style={s.staffInitials}>{member.initials}</Text>
            </View>
            <Text style={s.staffName} numberOfLines={1}>{member.name.split(' ')[0]}</Text>
            <Text style={s.staffSpec} numberOfLines={1}>{member.specialty.split(' ')[0]}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={s.pb} />
    </ScrollView>
  );
}
