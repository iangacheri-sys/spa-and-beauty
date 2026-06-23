import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import { SERVICES, formatPrice } from '@/constants/data';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, bookings } = useBookings();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const totalBookings = bookings.filter((b) => b.status !== 'cancelled').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => {
      const service = SERVICES.find((s) => s.id === b.serviceId);
      return sum + (service?.price ?? 0);
    }, 0);
  const totalMinutes = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => {
      const service = SERVICES.find((s) => s.id === b.serviceId);
      return sum + (service?.duration ?? 0);
    }, 0);

  async function saveProfile() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile({ name: name.trim() || 'Guest', phone, email });
    setEditing(false);
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topInset + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: editing ? colors.primary : colors.secondary,
    },
    editBtnText: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
      color: editing ? '#fff' : colors.foreground,
    },
    avatarSection: { alignItems: 'center', paddingVertical: 24 },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#fff' },
    profileName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.foreground, marginTop: 12 },
    profileSub: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    statsRow: {
      flexDirection: 'row',
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      gap: 0,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: colors.border },
    statValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.primary },
    statLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    section: { marginHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: 'hidden',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.foreground },
    rowValue: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    divider: { height: 1, backgroundColor: colors.border, marginLeft: 48 },
    inputField: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    inputLabel: { width: 64, fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' },
    input: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      paddingVertical: 0,
    },
    mpesaBadge: {
      backgroundColor: '#E8F5E9',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    mpesaText: { fontSize: 11, color: '#2E7D32', fontFamily: 'Inter_600SemiBold' },
    comingSoon: {
      fontSize: 11, color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginTop: 24,
      marginBottom: 8,
    },
  });

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
        <Pressable
          style={s.editBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (editing) {
              saveProfile();
            } else {
              setName(profile.name);
              setPhone(profile.phone);
              setEmail(profile.email);
              setEditing(true);
            }
          }}
        >
          <Feather name={editing ? 'check' : 'edit-2'} size={14} color={editing ? '#fff' : colors.foreground} />
          <Text style={s.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
        </Pressable>
      </View>

      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.profileName}>{profile.name}</Text>
        {profile.phone ? <Text style={s.profileSub}>{profile.phone}</Text> : null}
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{totalBookings}</Text>
          <Text style={s.statLabel}>Bookings</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{Math.round(totalMinutes / 60)}h</Text>
          <Text style={s.statLabel}>Hours</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statValue}>{totalSpent > 0 ? `${Math.round(totalSpent / 1000)}K` : '0'}</Text>
          <Text style={s.statLabel}>Spent (KES)</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Personal Info</Text>
        <View style={s.card}>
          {editing ? (
            <>
              <View style={s.inputField}>
                <Text style={s.inputLabel}>Name</Text>
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={s.inputField}>
                <Text style={s.inputLabel}>Phone</Text>
                <TextInput
                  style={s.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+254 700 000 000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={[s.inputField, { borderBottomWidth: 0 }]}>
                <Text style={s.inputLabel}>Email</Text>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </>
          ) : (
            <>
              <View style={s.row}>
                <Feather name="user" size={16} color={colors.mutedForeground} />
                <Text style={s.rowLabel}>Name</Text>
                <Text style={s.rowValue}>{profile.name}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.row}>
                <Feather name="phone" size={16} color={colors.mutedForeground} />
                <Text style={s.rowLabel}>Phone</Text>
                <Text style={s.rowValue}>{profile.phone || 'Not set'}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.row}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <Text style={s.rowLabel}>Email</Text>
                <Text style={s.rowValue}>{profile.email || 'Not set'}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Payment</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Feather name="smartphone" size={16} color={colors.mutedForeground} />
            <Text style={s.rowLabel}>M-Pesa</Text>
            <View style={s.mpesaBadge}>
              <Text style={s.mpesaText}>Coming Soon</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Feather name="credit-card" size={16} color={colors.mutedForeground} />
            <Text style={s.rowLabel}>Card</Text>
            <Text style={s.comingSoon}>Coming soon</Text>
          </View>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Preferences</Text>
        <View style={s.card}>
          <View style={s.row}>
            <Feather name="bell" size={16} color={colors.mutedForeground} />
            <Text style={s.rowLabel}>Reminders</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </View>
          <View style={s.divider} />
          <Pressable
            style={s.row}
            onPress={() =>
              Alert.alert('About', 'Spa & Beauty\nVersion 1.0.0\n\nYour luxury beauty partner.')
            }
          >
            <Feather name="info" size={16} color={colors.mutedForeground} />
            <Text style={s.rowLabel}>About</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <Text style={s.versionText}>Spa & Beauty v1.0.0</Text>
      <View style={{ height: Math.max(bottomInset + 100, 100) }} />
    </ScrollView>
  );
}
