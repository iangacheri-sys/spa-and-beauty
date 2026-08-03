import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColors } from '@/hooks/useColors';
import { apiFetch } from '@/lib/api';

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'enrolled' | 'waitlist';
  registrationDate: string;
}

interface TrainingClass {
  id: string;
  title: string;
  instructor: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  fee: number;
  location: string;
  image?: string;
  isPublished: boolean;
  enrolled: Enrollment[];
}

// Using the API for enrollments instead of AsyncStorage

function RegistrationModal({
  cls,
  onClose,
  onRegistered,
}: {
  cls: TrainingClass;
  onClose: () => void;
  onRegistered: (status: 'enrolled' | 'waitlist') => void;
}) {
  const colors = useColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const enrolledCount = cls.enrolled.filter((e) => e.status === 'enrolled').length;
  const isFull = enrolledCount >= cls.capacity;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim() || !email.includes('@')) e.email = 'Valid email is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/classes/${cls.id}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ name, email, phone }),
      }) as Response;
      const data = await res.json();
      onRegistered(data.status);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.foreground }}>
            {isFull ? 'Join Waitlist' : 'Register for Class'}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}><Feather name="x" size={24} color={colors.foreground} /></Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', color: colors.foreground, fontSize: 16 }}>{cls.title}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: colors.mutedForeground }}>{new Date(cls.date).toLocaleDateString('en-KE')} · {cls.startTime}–{cls.endTime}</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', color: colors.primary, fontSize: 15 }}>Fee: Ksh {cls.fee.toLocaleString()}</Text>
            {isFull && (
              <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10 }}>
                <Text style={{ color: '#92400E', fontFamily: 'Inter_500Medium', fontSize: 13 }}>⚠ This class is full. You'll be added to the waitlist.</Text>
              </View>
            )}
          </View>

          {[
            { key: 'name', label: 'Full Name', value: name, setter: setName, placeholder: 'Your full name', keyboardType: 'default' as const },
            { key: 'email', label: 'Email Address', value: email, setter: setEmail, placeholder: 'your@email.com', keyboardType: 'email-address' as const },
            { key: 'phone', label: 'Phone Number', value: phone, setter: setPhone, placeholder: '0712 345 678', keyboardType: 'phone-pad' as const },
          ].map(({ key, label, value, setter, placeholder, keyboardType }) => (
            <View key={key} style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.foreground, fontSize: 14 }}>{label} *</Text>
              <TextInput
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={keyboardType}
                style={{
                  height: 48, borderRadius: 10, borderWidth: 1, borderColor: errors[key] ? '#EF4444' : colors.border,
                  backgroundColor: colors.card, paddingHorizontal: 14, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15,
                }}
              />
              {errors[key] && <Text style={{ color: '#EF4444', fontSize: 12, fontFamily: 'Inter_400Regular' }}>{errors[key]}</Text>}
            </View>
          ))}

          <Pressable
            style={{ backgroundColor: isFull ? '#D97706' : colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting && <ActivityIndicator color="#fff" size="small" />}
            <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 }}>
              {submitting ? 'Processing...' : isFull ? 'Join Waitlist' : 'Confirm Registration'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ClassesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const [registrations, setRegistrations] = React.useState<Record<string, 'enrolled' | 'waitlist'>>({});
  const [registeringFor, setRegisteringFor] = useState<TrainingClass | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { data: classes = [], isLoading, isError, refetch } = useQuery<TrainingClass[]>({
    queryKey: ['mobile-classes'],
    queryFn: async () => {
      return apiFetch<TrainingClass[]>('/classes');
    },
  });

  const publishedClasses = classes.filter((c) => c.isPublished);

  const handleRegistered = (cls: TrainingClass, status: 'enrolled' | 'waitlist') => {
    setRegistrations((prev) => ({ ...prev, [cls.id]: status }));
    setRegisteringFor(null);
    queryClient.invalidateQueries({ queryKey: ['mobile-classes'] });
    const msg = status === 'waitlist'
      ? `You've been added to the waitlist for "${cls.title}"`
      : `You're registered for "${cls.title}"! Check your email for confirmation.`;
    setSuccessMsg(msg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: topInset + 16, paddingHorizontal: 20, paddingBottom: 12 },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 4 },
    card: {
      backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      marginHorizontal: 20, marginBottom: 16, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    cardImg: { width: '100%', height: 160, backgroundColor: colors.secondary },
    cardBody: { padding: 16 },
    cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
    cardTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: colors.foreground, flex: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexShrink: 0 },
    badgeText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    infoText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, flex: 1 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
    fee: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.foreground },
    registerBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    registerBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    registeredPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#DCFCE7' },
    registeredText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#166534' },
    waitlistPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FEF3C7' },
    waitlistText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#92400E' },
    toast: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: '#166534', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 999 },
    toastText: { color: '#fff', fontFamily: 'Inter_500Medium', fontSize: 13, flex: 1 },
    emptyBox: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
    loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
    retryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { color: '#fff', fontFamily: 'Inter_600SemiBold' },
  });

  if (isLoading) {
    return (
      <View style={[s.container, s.loadingBox]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>Loading classes...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[s.container, s.errorBox]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' }}>Could not load classes. Check your connection.</Text>
        <Pressable style={s.retryBtn} onPress={() => refetch()}>
          <Text style={s.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Training & Classes</Text>
        <Text style={s.subtitle}>Expert-led masterclasses and certification courses</Text>
      </View>

      <FlatList
        data={publishedClasses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Feather name="book-open" size={40} color={colors.border} />
            <Text style={s.emptyText}>No classes available yet. Check back soon!</Text>
          </View>
        }
        renderItem={({ item: cls }) => {
          const enrolledCount = cls.enrolled.filter((e) => e.status === 'enrolled').length;
          const isFull = enrolledCount >= cls.capacity;
          const myStatus = registrations[cls.id];

          return (
            <View style={s.card}>
              {cls.image && (
                <Image
                  source={{ uri: cls.image }}
                  style={s.cardImg}
                  contentFit="cover"
                  transition={200}
                />
              )}
              <View style={s.cardBody}>
                <View style={s.cardTitleRow}>
                  <Text style={s.cardTitle} numberOfLines={2}>{cls.title}</Text>
                  <View style={[s.badge, { backgroundColor: isFull ? '#FEE2E2' : '#DCFCE7' }]}>
                    <Text style={[s.badgeText, { color: isFull ? '#B91C1C' : '#166534' }]}>{isFull ? 'Full' : 'Open'}</Text>
                  </View>
                </View>

                <View style={s.infoRow}>
                  <Feather name="user" size={14} color={colors.mutedForeground} />
                  <Text style={s.infoText}>{cls.instructor}</Text>
                </View>
                <View style={s.infoRow}>
                  <Feather name="calendar" size={14} color={colors.mutedForeground} />
                  <Text style={s.infoText}>{new Date(cls.date).toLocaleDateString('en-KE')}</Text>
                </View>
                <View style={s.infoRow}>
                  <Feather name="clock" size={14} color={colors.mutedForeground} />
                  <Text style={s.infoText}>{cls.startTime} – {cls.endTime}</Text>
                </View>
                <View style={s.infoRow}>
                  <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                  <Text style={s.infoText} numberOfLines={1}>{cls.location}</Text>
                </View>
                <View style={s.infoRow}>
                  <Feather name="users" size={14} color={colors.mutedForeground} />
                  <Text style={[s.infoText, isFull ? { color: '#B91C1C', fontFamily: 'Inter_600SemiBold' } : {}]}>{enrolledCount}/{cls.capacity} enrolled</Text>
                  {cls.enrolled.filter((e) => e.status === 'waitlist').length > 0 && (
                    <Text style={{ color: '#D97706', fontSize: 12, fontFamily: 'Inter_500Medium' }}>· {cls.enrolled.filter((e) => e.status === 'waitlist').length} waitlisted</Text>
                  )}
                </View>

                <View style={s.cardFooter}>
                  <Text style={s.fee}>Ksh {cls.fee.toLocaleString()}</Text>

                  {myStatus === 'enrolled' ? (
                    <View style={s.registeredPill}>
                      <Feather name="check-circle" size={14} color="#166534" />
                      <Text style={s.registeredText}>Registered</Text>
                    </View>
                  ) : myStatus === 'waitlist' ? (
                    <View style={s.waitlistPill}>
                      <Feather name="clock" size={14} color="#92400E" />
                      <Text style={s.waitlistText}>Waitlisted</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={[s.registerBtn, { backgroundColor: isFull ? '#D97706' : colors.primary }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRegisteringFor(cls); }}
                    >
                      <Text style={[s.registerBtnText, { color: '#fff' }]}>
                        {isFull ? 'Join Waitlist' : 'Register Now'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      {successMsg ? (
        <View style={s.toast}>
          <Feather name="check-circle" size={18} color="#fff" />
          <Text style={s.toastText}>{successMsg}</Text>
        </View>
      ) : null}

      {registeringFor && (
        <RegistrationModal
          cls={registeringFor}
          onClose={() => setRegisteringFor(null)}
          onRegistered={(status) => handleRegistered(registeringFor, status)}
        />
      )}
    </View>
  );
}
