import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Skeleton } from '@/components/Skeleton';
import { useBookings } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';
import { useColors } from '@/hooks/useColors';
import { SERVICES, STAFF, formatDate, formatPrice } from '@/constants/data';
import { apiFetch } from '@/lib/api';

interface Spa {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  latitude: number;
  longitude: number;
  image?: string;
  isSponsored?: boolean;
  amenities?: string[];
  rankingScore?: number;
}

const CATEGORIES = [
  { id: '1', name: 'Massage', icon: 'wind' },
  { id: '2', name: 'Facial', icon: 'smile' },
  { id: '3', name: 'Nails', icon: 'edit-2' },
  { id: '4', name: 'Hair', icon: 'scissors' },
  { id: '5', name: 'Body', icon: 'droplet' },
];

const GREETING = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
})();

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookings } = useBookings();
  const { user } = useAuth();
  const { savedSpaIds, toggleSpaFavourite } = useFavourites();
  
  const [spas, setSpas] = useState<Spa[]>([]);
  const [loadingSpas, setLoadingSpas] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);

  const AMENITY_FILTERS = ['Parking', 'WiFi', 'Wheelchair Access', 'Refreshments'];

  const toggleAmenityFilter = (am: string) => {
    setActiveAmenities(prev =>
      prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]
    );
  };

  useEffect(() => {
    async function loadSpas() {
      try {
        const data = await apiFetch<Spa[]>('/spas');
        setSpas(data);
      } catch (err) {
        console.error('Failed to load spas', err);
      } finally {
        setLoadingSpas(false);
      }
    }
    loadSpas();
  }, []);

  const nextBooking = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null,
    [bookings],
  );

  const nextService = nextBooking ? SERVICES.find((s) => s.id === nextBooking.serviceId) : null;
  const nextStaff = nextBooking ? STAFF.find((s) => s.id === nextBooking.therapistId) : null;

  const filteredSpas = useMemo(() => {
    let result = spas;
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(spa => spa.name.toLowerCase().includes(lower) || spa.address.toLowerCase().includes(lower));
    }
    if (activeAmenities.length > 0) {
      result = result.filter(spa =>
        activeAmenities.every(am => spa.amenities?.includes(am))
      );
    }
    return result;
  }, [searchQuery, activeAmenities, spas]);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  function handleSpaPress(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/spa/${id}`);
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
    categoryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
    categoryBtn: { alignItems: 'center', gap: 8 },
    categoryIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    categoryName: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.foreground },
    spaCard: {
      width: 240,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: 'hidden',
      marginRight: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heartBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    spaImage: { width: 240, height: 140 },
    spaCardBody: { padding: 12 },
    spaCardName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    spaCardAddress: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    ratingText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontStyle: 'italic' }
  });

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{GREETING}</Text>
          <Text style={s.name}>{user?.name || 'Guest'}</Text>
        </View>
        <AnimatedPressable style={s.bellBtn} onPress={() => router.push('/notifications')}>
          <Feather name="bell" size={18} color={colors.foreground} />
          {/* A small unread badge could go here if we tracked unread count */}
          <View style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
        </AnimatedPressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
          borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
          borderWidth: 1, borderColor: colors.border,
        }}>
          <Feather name="search" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search spas, locations..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground, padding: 0 }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Amenity Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}
      >
        {AMENITY_FILTERS.map(am => {
          const active = activeAmenities.includes(am);
          return (
            <Pressable
              key={am}
              onPress={() => { Haptics.selectionAsync(); toggleAmenityFilter(am); }}
              style={{
                paddingHorizontal: 14, paddingVertical: 7,
                borderRadius: 20, borderWidth: 1.5,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.card,
              }}
            >
              <Text style={{
                fontSize: 12, fontFamily: 'Inter_500Medium',
                color: active ? '#fff' : colors.foreground
              }}>{am}</Text>
            </Pressable>
          );
        })}
        {activeAmenities.length > 0 && (
          <Pressable
            onPress={() => setActiveAmenities([])}
            style={{
              paddingHorizontal: 10, paddingVertical: 7,
              borderRadius: 20, borderWidth: 1.5,
              borderColor: colors.border,
              backgroundColor: colors.card,
              flexDirection: 'row', alignItems: 'center', gap: 4
            }}
          >
            <Feather name="x" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>Clear</Text>
          </Pressable>
        )}
      </ScrollView>

      {user && nextBooking && nextService && (
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Next Appointment</Text>
          </View>
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
        </View>
      )}

      <View style={[s.section, { paddingHorizontal: 0 }]}>
        <View style={[s.sectionRow, { paddingHorizontal: 20 }]}>
          <Text style={s.sectionTitle}>Explore by Category</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryRow}>
          {CATEGORIES.map(cat => (
            <AnimatedPressable key={cat.id} style={s.categoryBtn as any} onPress={() => {
              Haptics.selectionAsync();
              router.push({ pathname: '/(tabs)/services', params: { category: cat.name } });
            }}>
              <View style={s.categoryIconBox}>
                <Feather name={cat.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={s.categoryName}>{cat.name}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>

      <View style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Featured Spas</Text>
          <Pressable onPress={() => router.push('/(tabs)/map')}>
            <Text style={s.seeAll}>Map view</Text>
          </Pressable>
        </View>
        {loadingSpas ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={s.spaCard}>
                <Skeleton width={240} height={140} borderRadius={0} />
                <View style={s.spaCardBody}>
                  <Skeleton width={140} height={18} style={{ marginBottom: 6 }} />
                  <Skeleton width={100} height={14} style={{ marginBottom: 12 }} />
                  <Skeleton width={40} height={14} />
                </View>
              </View>
            ))}
          </ScrollView>
        ) : filteredSpas.length === 0 ? (
          <Text style={s.emptyText}>No spas found.</Text>
        ) : (
          <FlatList
            data={filteredSpas}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSaved = savedSpaIds.includes(item.id);
              return (
                <Pressable style={s.spaCard} onPress={() => handleSpaPress(item.id)}>
                  <Image 
                    source={{ uri: item.image || 'https://picsum.photos/seed/spa-default/400/280' }} 
                    style={s.spaImage} 
                    contentFit="cover" 
                    transition={300}
                    recyclingKey={item.id}
                    cachePolicy="disk"
                    placeholder={{ thumbhash: 'YhkGJYSId3iHeHd3aGd3h2cA' }}
                  />
                  {item.isSponsored && (
                    <View style={{
                      position: 'absolute', top: 10, left: 10,
                      backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4,
                      borderRadius: 4, zIndex: 10
                    }}>
                      <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sponsored</Text>
                    </View>
                  )}
                  <Pressable 
                    style={s.heartBtn} 
                    onPress={() => {
                      if (!user) {
                        router.push('/login');
                        return;
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      toggleSpaFavourite(item.id);
                    }}
                  >
                    <Feather 
                      name="heart" 
                      size={16} 
                      color={isSaved ? colors.primary : colors.foreground} 
                    />
                  </Pressable>
                  <View style={s.spaCardBody}>
                    <Text style={s.spaCardName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.spaCardAddress} numberOfLines={1}>{item.address}</Text>
                    <View style={s.ratingRow}>
                      <Feather name="star" size={13} color="#F59E0B" />
                      <Text style={s.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
            contentContainerStyle={{ paddingRight: 20 }}
            scrollEnabled
          />
        )}
      </View>

      <View style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Special Offers</Text>
        </View>
        <Pressable style={[s.nextCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={() => {}}>
          <View style={s.nextInfo}>
            <Text style={[s.nextLabel, { color: colors.primary }]}>PROMO CODE: RELAX20</Text>
            <Text style={[s.nextServiceName, { color: colors.foreground }]}>20% Off Coastal Massages</Text>
            <Text style={[s.nextMeta, { color: colors.mutedForeground }]}>Valid at Bofa Beach Wellness & Kilifi Town Clinic.</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

