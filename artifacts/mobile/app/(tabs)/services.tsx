import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
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

import { useColors } from '@/hooks/useColors';
import { apiFetch } from '@/lib/api';

type Category = 'All' | 'Massage' | 'Facial' | 'Nails' | 'Hair' | 'Body' | 'Other';
const CATEGORIES: Category[] = ['All', 'Massage', 'Facial', 'Nails', 'Hair', 'Body', 'Other'];

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);
}

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  image?: string;
  spaId: string;
}

export default function ServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const initialCategory = (params.category as Category) || 'All';
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);

  // Update selectedCategory if params.category changes
  useEffect(() => {
    if (params.category && CATEGORIES.includes(params.category as Category)) {
      setSelectedCategory(params.category as Category);
    }
  }, [params.category]);
  const [query, setQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await apiFetch<Service[]>('/services');
        setServices(data);
      } catch (e) {
        console.error('Failed to load services', e);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
      const matchQuery =
        query.trim() === '' ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, query, services]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topInset + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      marginTop: 14,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      height: 44,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      fontSize: 15,
    },
    categoriesRow: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 8,
    },
    categoryPill: {
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 24,
      borderWidth: 1.5,
      minWidth: 64,
      alignItems: 'center',
    },
    categoryText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    serviceRow: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      flexDirection: 'row',
      overflow: 'hidden',
      marginHorizontal: 20,
      marginBottom: 12,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    serviceImg: { width: 100, height: 110 },
    serviceBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
    serviceName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    serviceCat: {
      alignSelf: 'flex-start',
      backgroundColor: colors.secondary,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginTop: 4,
    },
    serviceCatText: { fontSize: 10, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
    metaText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
    price: { fontSize: 15, fontFamily: 'Inter_700Bold', color: colors.primary },
    bookBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
    },
    bookBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
    emptyBox: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyText: { fontSize: 15, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 12 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Services</Text>
        <View style={s.searchBox}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Search services..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoriesRow}
      >
        {CATEGORIES.map((cat) => {
          const active = cat === selectedCategory;
          return (
            <Pressable
              key={cat}
              style={[
                s.categoryPill,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedCategory(cat);
              }}
            >
              <Text style={[s.categoryText, { color: active ? '#fff' : colors.foreground }]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(bottomInset + 100, 100) }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Feather name="search" size={40} color={colors.border} />
            <Text style={s.emptyText}>No services found. Try a different search or category.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={s.serviceRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/service/${item.id}`);
            }}
          >
            <Image source={item.image} style={s.serviceImg} contentFit="cover" transition={200} />
            <View style={s.serviceBody}>
              <View>
                <Text style={s.serviceName} numberOfLines={1}>{item.name}</Text>
                <View style={s.serviceCat}>
                  <Text style={s.serviceCatText}>{item.category}</Text>
                </View>
                <View style={s.metaRow}>
                  <Feather name="clock" size={12} color={colors.mutedForeground} />
                  <Text style={s.metaText}>{item.duration} min</Text>
                  <Feather name="star" size={12} color={colors.accent} />
                  <Text style={s.metaText}>{item.rating}</Text>
                </View>
              </View>
              <View style={s.priceRow}>
                <Text style={s.price}>{formatPrice(item.price)}</Text>
                <View style={s.bookBtn}>
                  <Text style={s.bookBtnText}>Book</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
