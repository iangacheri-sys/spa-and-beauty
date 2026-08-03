import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Image,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { apiFetch } from '@/lib/api';

interface Spa {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  latitude: number;
  longitude: number;
  distance?: string;
  status?: 'Open Now' | 'Closed';
  pinX?: number;
  pinY?: number;
  mapsUrl?: string;
}

// Hardcoded pin mappings for visual map layout based on spaId (mixed Nairobi and Kilifi)
const PIN_MAPPINGS: Record<string, { x: number, y: number }> = {
  's1': { x: 0.15, y: 0.15 }, // Westlands
  's2': { x: 0.25, y: 0.20 }, // Kilimani
  's3': { x: 0.10, y: 0.35 }, // Karen
  's4': { x: 0.20, y: 0.25 }, // CBD
  's5': { x: 0.85, y: 0.40 }, // Bofa Beach
  's6': { x: 0.70, y: 0.25 }, // Vipingo
  's7': { x: 0.75, y: 0.50 }, // Kilifi Town
};

// Static satellite map image from Unsplash (Coastal area from above)
const MAP_IMAGE = 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&q=80';

// Fallback in case Mapbox image fails
const FALLBACK_MAP = 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&q=80';

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [spas, setSpas] = useState<Spa[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapImgError, setMapImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const mapWidth = width - 32;
  const mapHeight = 260;

  useEffect(() => {
    async function loadSpas() {
      try {
        const data = await apiFetch<Spa[]>('/spas');
        const mappedSpas = data.map(spa => ({
          ...spa,
          distance: spa.id.startsWith('s5') || spa.id.startsWith('s6') || spa.id.startsWith('s7') ? '2.5 km' : '450 km', 
          status: 'Open Now' as const, 
          pinX: PIN_MAPPINGS[spa.id]?.x || Math.random() * 0.6 + 0.2,
          pinY: PIN_MAPPINGS[spa.id]?.y || Math.random() * 0.6 + 0.2,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${spa.latitude},${spa.longitude}`
        }));
        setSpas(mappedSpas);
        if (mappedSpas.length > 0) {
          setSelectedId('s7'); // Default to Kilifi Town Spa
        }
      } catch (err) {
        console.error('Failed to load spas', err);
      } finally {
        setLoading(false);
      }
    }
    loadSpas();
  }, []);

  const selectSpa = (spa: Spa) => {
    Haptics.selectionAsync();
    setSelectedId(spa.id);
  };

  const openDirections = (spa: Spa) => {
    if (spa.mapsUrl) Linking.openURL(spa.mapsUrl).catch(() => {});
  };

  const selectedSpa = spas.find((s) => s.id === selectedId);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 16, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    mapWrapper: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, height: mapHeight, position: 'relative' },
    mapImage: { width: mapWidth, height: mapHeight },
    mapOverlay: { position: 'absolute', inset: 0 },
    pin: {
      position: 'absolute', width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
    },
    callout: {
      position: 'absolute', backgroundColor: '#fff', borderRadius: 10, padding: 10,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
      minWidth: 160, maxWidth: 200,
    },
    calloutArrow: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#fff', alignSelf: 'center' },
    calloutName: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#111', marginBottom: 2 },
    calloutAddr: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#666' },
    calloutStatus: { fontFamily: 'Inter_700Bold', fontSize: 10, marginTop: 3 },
    listSection: { paddingHorizontal: 16, marginTop: 20 },
    listTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground, marginBottom: 12 },
    spaCard: {
      backgroundColor: colors.card, borderRadius: 16, borderWidth: 1.5,
      padding: 16, marginBottom: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    cardRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    spaName: { fontSize: 15, fontFamily: 'Inter_700Bold', color: colors.foreground, flex: 1, marginRight: 8 },
    spaDist: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
    spaAddr: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 4 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    statusText: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    directionsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.secondary, borderRadius: 10, paddingVertical: 10 },
    directionsBtnText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
    callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
    callBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#fff' },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Find a Spa</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Feather name="map-pin" size={14} color={colors.primary} />
          <Text style={{ fontFamily: 'Inter_500Medium', color: colors.mutedForeground, fontSize: 12 }}>{spas.length} locations</Text>
        </View>
      </View>

      {/* Interactive Tappable Map */}
      <View style={s.mapWrapper}>
        <Image
          source={{ uri: mapImgError ? FALLBACK_MAP : MAP_IMAGE }}
          style={s.mapImage}
          resizeMode="cover"
          onError={() => setMapImgError(true)}
        />
        <View style={s.mapOverlay}>
          {spas.map((spa) => {
            const isSelected = selectedId === spa.id;
            const pinLeft = (spa.pinX || 0.5) * mapWidth - 18;
            const pinTop = (spa.pinY || 0.5) * mapHeight - 36;

            return (
              <React.Fragment key={spa.id}>
                <Pressable
                  style={[s.pin, {
                    left: pinLeft,
                    top: pinTop,
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderWidth: 2,
                    borderColor: colors.primary,
                  }]}
                  onPress={() => selectSpa(spa)}
                  accessibilityLabel={`Select ${spa.name}`}
                >
                  <Feather name="map-pin" size={16} color={isSelected ? '#fff' : colors.primary} />
                </Pressable>
                {isSelected && (
                  <View style={[s.callout, { left: Math.min(pinLeft - 40, mapWidth - 210), top: pinTop - 82 }]}>
                    <Text style={s.calloutName} numberOfLines={1}>{spa.name.replace('Nairobi Spa Hub – ', '')}</Text>
                    <Text style={s.calloutAddr} numberOfLines={1}>{spa.address}</Text>
                    <Text style={[s.calloutStatus, { color: spa.status === 'Open Now' ? '#16A34A' : '#DC2626' }]}>{spa.status}</Text>
                    <View style={s.calloutArrow} />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* Spa List */}
      <ScrollView
        style={s.listSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={s.listTitle}>Nearby Locations</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          spas.map((spa) => (
            <Pressable
              key={spa.id}
              style={[s.spaCard, { borderColor: selectedId === spa.id ? colors.primary : colors.border }]}
              onPress={() => selectSpa(spa)}
            >
              <View style={s.cardRow1}>
                <View style={{ flex: 1 }}>
                  <Text style={s.spaName}>{spa.name}</Text>
                  <Text style={s.spaAddr}>{spa.address}</Text>
                </View>
                <Text style={s.spaDist}>{spa.distance}</Text>
              </View>
              <View style={s.metaRow}>
                <View style={s.ratingRow}>
                  <Feather name="star" size={14} color="#F59E0B" />
                  <Text style={s.ratingText}>{spa.rating}</Text>
                </View>
                <Text style={[s.statusText, { color: spa.status === 'Open Now' ? '#16A34A' : '#DC2626' }]}>
                  {spa.status}
                </Text>
              </View>
              <View style={s.actionsRow}>
                <Pressable style={s.directionsBtn} onPress={() => openDirections(spa)}>
                  <Feather name="navigation" size={14} color={colors.primary} />
                  <Text style={s.directionsBtnText}>Directions</Text>
                </Pressable>
                <Pressable style={s.callBtn} onPress={() => router.push(`/spa/${spa.id}`)}>
                  <Feather name="arrow-right" size={14} color="#fff" />
                  <Text style={s.callBtnText}>Open Profile</Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
