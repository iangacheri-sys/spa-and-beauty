import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useBookings } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { SERVICES, formatPrice } from '@/constants/data';
import { apiFetch } from '@/lib/api';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookings } = useBookings();
  const { user, login, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

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

  const loyaltyPoints = Math.floor(totalSpent / 100);
  const nextTierPoints = 1000;
  const loyaltyProgress = Math.min(loyaltyPoints / nextTierPoints, 1);

  async function saveProfile() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  }

  const handleOpenWeb = (role: 'owner' | 'therapist') => {
    // For local dev, redirect to web admin on 5173 or use env
    const debuggerHost = Constants.expoConfig?.hostUri;
    let url = process.env.EXPO_PUBLIC_ADMIN_URL || 'http://localhost:5173';
    
    if (!process.env.EXPO_PUBLIC_ADMIN_URL && debuggerHost) {
      url = `http://${debuggerHost.split(':')[0]}:5173`;
    }
    Linking.openURL(url);
  };

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
    loyaltyCard: {
      marginHorizontal: 20, marginTop: 20,
      backgroundColor: colors.primary, borderRadius: colors.radius,
      padding: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    loyaltyTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.8)', letterSpacing: 1, textTransform: 'uppercase' },
    loyaltyPoints: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff', marginTop: 4 },
    loyaltyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter_400Regular', marginTop: 4 },
    progressBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 3, marginTop: 16, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
    progressText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_500Medium', marginTop: 8, textAlign: 'right' },
    section: { marginHorizontal: 20, marginTop: 24 },
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
    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      marginHorizontal: 20, marginTop: 32,
      paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.destructive + '40',
      backgroundColor: colors.destructive + '10',
    },
    logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.destructive },
    welcomeContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: topInset + 40,
    },
    welcomeBadge: {
      alignSelf: 'center',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginBottom: 16,
    },
    welcomeBadgeText: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
    },
    welcomeTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      textAlign: 'center',
      marginBottom: 8,
    },
    welcomeSub: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      textAlign: 'center',
      marginBottom: 32,
    },
    demoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    demoIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    demoTitle: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    demoDesc: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginTop: 2,
    },
  });

  if (!user) {
    return (
      <View style={s.container}>
        <View style={s.welcomeContainer}>
          <Feather name="user" size={64} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 24 }} />
          <Text style={s.welcomeTitle}>Sign In Required</Text>
          <Text style={s.welcomeSub}>Please log in to view your profile, manage bookings, and earn loyalty points.</Text>

          <Pressable 
            style={[s.demoBtn, { backgroundColor: colors.primary }]} 
            onPress={() => router.push('/login')}
          >
            <Text style={[s.demoTitle, { color: '#fff', textAlign: 'center', width: '100%' }]}>Sign In or Create Account</Text>
          </Pressable>
          
          <Pressable 
            style={[s.demoBtn, { marginTop: 12, borderColor: 'transparent', shadowOpacity: 0, backgroundColor: 'transparent' }]} 
            onPress={() => handleOpenWeb('owner')}
          >
            <Text style={[s.demoDesc, { textAlign: 'center', width: '100%' }]}>Are you a Spa Owner? Open Admin Portal</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

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
              setName(user?.name || '');
              setPhone(user?.phone || '');
              setEmail('');
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
        <Text style={s.profileName}>{user?.name}</Text>
        {user?.phone ? <Text style={s.profileSub}>{user.phone}</Text> : null}
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
          <Text style={s.statLabel}>Spent (Ksh)</Text>
        </View>
      </View>

      <View style={s.loyaltyCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={s.loyaltyTitle}>Beauty Rewards</Text>
            <Text style={s.loyaltyPoints}>{loyaltyPoints} <Text style={{ fontSize: 16 }}>pts</Text></Text>
          </View>
          <Feather name="award" size={32} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={s.loyaltyDesc}>You earn 1 point for every Ksh 100 spent.</Text>
        
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${loyaltyProgress * 100}%` }]} />
        </View>
        <Text style={s.progressText}>{nextTierPoints - loyaltyPoints} pts to Silver Tier</Text>
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
                <Text style={s.rowValue}>{user?.name}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.row}>
                <Feather name="phone" size={16} color={colors.mutedForeground} />
                <Text style={s.rowLabel}>Phone</Text>
                <Text style={s.rowValue}>{user?.phone || 'Not set'}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.row}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <Text style={s.rowLabel}>Email</Text>
                <Text style={s.rowValue}>{email || 'Not set'}</Text>
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

      {!editing && (
        <>
          {user?.isDemo || user?.name === 'Guest' ? (
            <Pressable
              style={[s.logoutBtn, { borderColor: colors.primary + '40', backgroundColor: colors.primary + '10', marginBottom: 12 }]}
              onPress={() => router.push('/login')}
            >
              <Feather name="log-in" size={18} color={colors.primary} />
              <Text style={[s.logoutText, { color: colors.primary }]}>Sign In to Your Account</Text>
            </Pressable>
          ) : null}
          <Pressable 
            style={s.logoutBtn} 
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await logout();
            }}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={s.logoutText}>Log Out</Text>
          </Pressable>
        </>
      )}

      <Text style={s.versionText}>Spa & Beauty v1.0.0</Text>
      <View style={{ height: Math.max(bottomInset + 100, 100) }} />
    </ScrollView>
  );
}
