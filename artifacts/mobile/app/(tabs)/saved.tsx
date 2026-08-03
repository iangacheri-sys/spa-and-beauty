import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';
import { useColors } from '@/hooks/useColors';
import { apiFetch } from '@/lib/api';

interface Spa {
  id: string;
  name: string;
  address: string;
  rating: number;
}

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { savedSpaIds, toggleSpaFavourite } = useFavourites();
  
  const [spas, setSpas] = useState<Spa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpas() {
      try {
        const data = await apiFetch<Spa[]>('/spas');
        setSpas(data);
      } catch (err) {
        console.error('Failed to load spas', err);
      } finally {
        setLoading(false);
      }
    }
    loadSpas();
  }, []);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const savedSpas = spas.filter((s) => savedSpaIds.includes(s.id));

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topInset + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginTop: 16 },
    emptyDesc: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 8 },
    spaCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: 'hidden',
      marginHorizontal: 20,
      marginBottom: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    spaImage: { width: 100, height: '100%' },
    spaCardBody: { flex: 1, padding: 14, justifyContent: 'center' },
    spaCardName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    spaCardAddress: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    ratingText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
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
    }
  });

  if (!user) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Saved</Text>
        </View>
        <View style={s.emptyState}>
          <Feather name="heart" size={48} color={colors.mutedForeground} opacity={0.5} />
          <Text style={s.emptyTitle}>Sign in to save favourites</Text>
          <Text style={s.emptyDesc}>Keep track of your favourite spas and therapists by signing into your account.</Text>
          <Pressable
            style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primary, borderRadius: 20 }}
            onPress={() => router.push('/login')}
          >
            <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Saved</Text>
        <Text style={s.subtitle}>Your favourite spots.</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : savedSpas.length === 0 ? (
        <View style={s.emptyState}>
          <Feather name="heart" size={48} color={colors.mutedForeground} opacity={0.3} />
          <Text style={s.emptyTitle}>No saved spas yet</Text>
          <Text style={s.emptyDesc}>Tap the heart icon on any spa to save it here for quick access later.</Text>
        </View>
      ) : (
        <FlatList
          data={savedSpas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={s.spaCard} onPress={() => router.push(`/spa/${item.id}`)}>
              <Image 
                source={{ uri: `https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80` }} 
                style={s.spaImage} 
                contentFit="cover" 
                transition={200} 
              />
              <Pressable 
                style={s.heartBtn} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  toggleSpaFavourite(item.id);
                }}
              >
                <Feather name="heart" size={16} color={colors.primary} />
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
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
