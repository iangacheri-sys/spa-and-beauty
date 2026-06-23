import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { SERVICES, STAFF, formatPrice } from '@/constants/data';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const service = SERVICES.find((s) => s.id === id);
  const specialists = service ? STAFF.filter((s) => service.staffIds.includes(s.id)) : [];

  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (!service) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Service not found</Text>
      </View>
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    hero: { width: '100%', height: 300 },
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
    body: { flex: 1, paddingHorizontal: 20 },
    catBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.secondary,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      marginTop: 20,
    },
    catText: { fontSize: 12, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
    serviceName: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.foreground, marginTop: 8 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    ratingText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    metaRow: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 12,
    },
    metaCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      gap: 4,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    metaLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    metaValue: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.foreground },
    sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginTop: 24, marginBottom: 12 },
    description: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 22 },
    staffCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    staffAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    staffInitials: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
    staffInfo: { flex: 1 },
    staffName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    staffSpec: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    staffMeta: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingBottom: Math.max(bottomInset + 16, 24),
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    priceBlock: { flex: 1 },
    priceLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    priceValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.foreground },
    bookBtn: {
      flex: 2,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
    },
    bookBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={service.image} style={s.hero} resizeMode="cover" />
        <View style={s.body}>
          <View style={s.catBadge}>
            <Text style={s.catText}>{service.category}</Text>
          </View>
          <Text style={s.serviceName}>{service.name}</Text>
          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Feather
                key={i}
                name="star"
                size={14}
                color={i <= Math.round(service.rating) ? colors.accent : colors.border}
              />
            ))}
            <Text style={s.ratingText}>{service.rating} ({service.reviews} reviews)</Text>
          </View>

          <View style={s.metaRow}>
            <View style={s.metaCard}>
              <Feather name="clock" size={18} color={colors.primary} />
              <Text style={s.metaValue}>{service.duration}m</Text>
              <Text style={s.metaLabel}>Duration</Text>
            </View>
            <View style={s.metaCard}>
              <Feather name="users" size={18} color={colors.primary} />
              <Text style={s.metaValue}>{specialists.length}</Text>
              <Text style={s.metaLabel}>Specialists</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>About this service</Text>
          <Text style={s.description}>{service.description}</Text>

          <Text style={s.sectionTitle}>Available Specialists</Text>
          {specialists.map((member) => (
            <View key={member.id} style={s.staffCard}>
              <View style={[s.staffAvatar, { backgroundColor: member.avatarColor }]}>
                <Text style={s.staffInitials}>{member.initials}</Text>
              </View>
              <View style={s.staffInfo}>
                <Text style={s.staffName}>{member.name}</Text>
                <Text style={s.staffSpec}>{member.specialty}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="star" size={12} color={colors.accent} />
                  <Text style={s.staffMeta}>{member.rating}</Text>
                </View>
                <Text style={s.staffMeta}>{member.experience}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      <Pressable style={s.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={18} color="#fff" />
      </Pressable>

      <View style={s.footer}>
        <View style={s.priceBlock}>
          <Text style={s.priceLabel}>Price</Text>
          <Text style={s.priceValue}>{formatPrice(service.price)}</Text>
        </View>
        <Pressable
          style={s.bookBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/booking/${service.id}`);
          }}
        >
          <Text style={s.bookBtnText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}
