import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Linking
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';
import { useColors } from '@/hooks/useColors';
import { formatPrice } from '@/constants/data';
import { apiFetch } from '@/lib/api';

interface Spa {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  latitude: number;
  longitude: number;
  brandStory?: string;
  verified?: boolean;
  galleries?: string[];
  amenities?: string[];
  isSponsored?: boolean;
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

interface Therapist {
  id: string;
  name: string;
  specialty?: string;
  specialties?: string[];
  bio?: string;
  rating?: number;
  avatarColor?: string;
  initials?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image?: string;
}

type TabType = 'Services' | 'Therapists' | 'Products' | 'Classes';

export default function SpaStorefrontScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { savedSpaIds, toggleSpaFavourite } = useFavourites();
  const isSaved = savedSpaIds.includes(id);
  
  const [spa, setSpa] = useState<Spa | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('Services');

  useEffect(() => {
    async function loadData() {
      try {
        const [spaRes, servicesRes, therapistsRes, productsRes] = await Promise.all([
          apiFetch<Spa>(`/spas/${id}`),
          apiFetch<Service[]>(`/services?spaId=${id}`),
          apiFetch<Therapist[]>(`/therapists?spaId=${id}`),
          apiFetch<Product[]>(`/products?spaId=${id}`)
        ]);
        
        setSpa(spaRes);
        setServices(servicesRes);
        setTherapists(therapistsRes);
        setProducts(productsRes);
      } catch (err) {
        console.error('Failed to load spa details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!spa) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Spa not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16, padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    hero: { width: '100%', height: 260 },
    backBtn: {
      position: 'absolute',
      top: topInset + 8,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heartBtn: {
      position: 'absolute',
      top: topInset + 8,
      right: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1 },
    headerSection: { padding: 20, paddingBottom: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    spaName: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.foreground, flex: 1 },
    verifiedBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
    verifiedText: { color: '#2E7D32', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    addressText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', flex: 1 },
    brandStory: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 22, marginTop: 16 },
    actionsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.card, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    actionBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    tabsContainer: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 20 },
    tabRow: { flexDirection: 'row', gap: 24 },
    tabBtn: { paddingVertical: 14, borderBottomWidth: 2 },
    tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    contentSection: { padding: 20, paddingBottom: bottomInset + 40 },
    serviceCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    serviceImg: { width: 100, height: '100%', backgroundColor: colors.secondary },
    serviceInfo: { flex: 1, padding: 12 },
    serviceName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    serviceMeta: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    serviceBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    servicePrice: { fontSize: 14, fontFamily: 'Inter_700Bold', color: colors.primary },
    bookBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    bookBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
    staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    staffAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    staffInitials: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
    staffInfo: { flex: 1 },
    staffName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    staffSpec: { fontSize: 13, color: colors.primary, fontFamily: 'Inter_500Medium', marginTop: 2 },
    staffBio: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    productCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 12, margin: 6, borderWidth: 1, borderColor: colors.border },
    productImg: { width: '100%', height: 120, borderRadius: 8, backgroundColor: colors.secondary, marginBottom: 12 },
    productName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    productPrice: { fontSize: 14, fontFamily: 'Inter_700Bold', color: colors.primary, marginTop: 4 },
    emptyText: { textAlign: 'center', color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 40 }
  });

  const tabs: TabType[] = ['Services', 'Therapists', 'Products', 'Classes'];

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: spa.image || 'https://picsum.photos/seed/spa-default/800/400' }} 
          style={s.hero} 
          contentFit="cover" 
          transition={300}
          cachePolicy="disk"
          placeholder={{ thumbhash: 'YhkGJYSId3iHeHd3aGd3h2cA' }}
        />
        <View style={s.body}>
          <View style={s.headerSection}>
            <View style={s.titleRow}>
              <Text style={s.spaName} numberOfLines={2}>{spa.name}</Text>
              {spa.verified && (
                <View style={s.verifiedBadge}>
                  <Feather name="check-circle" size={12} color="#2E7D32" />
                  <Text style={s.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <View style={s.metaRow}>
              <View style={s.ratingRow}>
                <Feather name="star" size={14} color="#F59E0B" />
                <Text style={s.ratingText}>{spa.rating}</Text>
              </View>
              <Text style={s.addressText} numberOfLines={1}>{spa.address}</Text>
            </View>
            {spa.brandStory && (
              <Text style={s.brandStory}>{spa.brandStory}</Text>
            )}

            {/* Photo Gallery */}
            {spa.galleries && spa.galleries.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginBottom: 10 }}>Gallery</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {spa.galleries.map((uri, i) => (
                    <Image
                      key={i}
                      source={{ uri }}
                      style={{ width: 140, height: 100, borderRadius: 12 }}
                      contentFit="cover"
                      cachePolicy="disk"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Amenities */}
            {spa.amenities && spa.amenities.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginBottom: 10 }}>Amenities</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {spa.amenities.map(am => (
                    <View key={am} style={{
                      paddingHorizontal: 12, paddingVertical: 6,
                      borderRadius: 20, backgroundColor: colors.secondary,
                      borderWidth: 1, borderColor: colors.border
                    }}>
                      <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.foreground }}>{am}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={s.actionsRow}>
              <Pressable style={s.actionBtn} onPress={() => router.push(`/chatbot?spaId=${spa.id}`)}>
                <Feather name="message-circle" size={16} color={colors.foreground} />
                <Text style={s.actionBtnText}>Chat</Text>
              </Pressable>
              <Pressable style={s.actionBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${spa.latitude},${spa.longitude}`)}>
                <Feather name="map-pin" size={16} color={colors.foreground} />
                <Text style={s.actionBtnText}>Map</Text>
              </Pressable>
              <Pressable style={s.actionBtn} onPress={() => Linking.openURL(`tel:${spa.phone}`)}>
                <Feather name="phone" size={16} color={colors.foreground} />
                <Text style={s.actionBtnText}>Call</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
              {tabs.map(tab => (
                <Pressable 
                  key={tab} 
                  style={[s.tabBtn, { borderBottomColor: activeTab === tab ? colors.primary : 'transparent' }]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[s.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>{tab}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={s.contentSection}>
            {activeTab === 'Services' && (
              services.length > 0 ? services.map(srv => (
                <Pressable key={srv.id} style={s.serviceCard} onPress={() => router.push(`/service/${srv.id}`)}>
                  <Image 
                    source={{ uri: srv.image || 'https://picsum.photos/seed/service-default/500/300' }} 
                    style={s.serviceImg} 
                    contentFit="cover"
                    recyclingKey={srv.id}
                    cachePolicy="disk"
                    transition={300}
                    placeholder={{ thumbhash: 'YhkGJYSId3iHeHd3aGd3h2cA' }}
                  />
                  <View style={s.serviceInfo}>
                    <Text style={s.serviceName}>{srv.name}</Text>
                    <Text style={s.serviceMeta}>{srv.duration} min • {srv.category}</Text>
                    <View style={s.serviceBottom}>
                      <Text style={s.servicePrice}>{formatPrice(srv.price)}</Text>
                      <Pressable style={s.bookBtn} onPress={() => router.push(`/booking/${srv.id}`)}>
                        <Text style={s.bookBtnText}>Book</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              )) : <Text style={s.emptyText}>No services available.</Text>
            )}

            {activeTab === 'Therapists' && (
              therapists.length > 0 ? therapists.map(t => (
                <View key={t.id} style={s.staffCard}>
                  <View style={[s.staffAvatar, t.avatarColor ? { backgroundColor: t.avatarColor } : {}]}>
                    <Text style={s.staffInitials}>{t.initials || t.name.charAt(0)}</Text>
                  </View>
                  <View style={s.staffInfo}>
                    <Text style={s.staffName}>{t.name}</Text>
                    <Text style={s.staffSpec}>{t.specialties?.[0] || t.specialty || 'Therapist'}</Text>
                    {t.bio && <Text style={s.staffBio} numberOfLines={2}>{t.bio}</Text>}
                  </View>
                </View>
              )) : <Text style={s.emptyText}>No therapists listed.</Text>
            )}

            {activeTab === 'Products' && (
              products.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
                  {products.map(p => (
                    <View key={p.id} style={[s.productCard, { minWidth: '45%' }]}>
                      <Image 
                        source={{ uri: p.image || 'https://picsum.photos/seed/product-default/500/500' }} 
                        style={s.productImg} 
                        contentFit="cover"
                        recyclingKey={p.id}
                        cachePolicy="disk"
                        transition={300}
                        placeholder={{ thumbhash: 'YhkGJYSId3iHeHd3aGd3h2cA' }}
                      />
                      <Text style={s.productName} numberOfLines={2}>{p.name}</Text>
                      <Text style={s.productPrice}>{formatPrice(p.price)}</Text>
                    </View>
                  ))}
                </View>
              ) : <Text style={s.emptyText}>No products available.</Text>
            )}

            {activeTab === 'Classes' && (
              <Text style={s.emptyText}>No upcoming classes.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <Pressable style={s.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={18} color="#fff" />
      </Pressable>
      <Pressable 
        style={s.heartBtn} 
        onPress={() => {
          if (!user) {
            router.push('/login');
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          toggleSpaFavourite(id);
        }}
      >
        <Feather name="heart" size={20} color={isSaved ? colors.primary : colors.foreground} />
      </Pressable>
    </View>
  );
}
