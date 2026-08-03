import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, Pressable, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const [phone, setPhone] = useState('0744444444');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const colors = useColors();
  const router = useRouter();
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both phone and password');
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      // Wait a tick for context state to sync, then navigate back or to tabs
      setTimeout(() => {
        if (returnUrl) {
          router.replace(returnUrl as any);
        } else {
          router.replace('/(tabs)');
        }
      }, 50);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 24 },
    backBtn: { position: 'absolute', top: 16, left: 24, zIndex: 10, padding: 8 },
    content: { flex: 1, justifyContent: 'center' },
    brand: { fontSize: 32, fontFamily: 'Inter_700Bold', color: colors.foreground, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, textAlign: 'center', marginBottom: 48 },
    input: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      marginBottom: 16,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.foreground,
      marginBottom: 8,
      marginLeft: 4,
    }
  });

  return (
    <SafeAreaView style={s.container}>
      <Pressable style={s.backBtn} onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }}>
        <Feather name="arrow-left" size={24} color={colors.foreground} />
      </Pressable>
      <View style={s.content}>
        <Text style={s.brand}>Beauty Booker</Text>
        <Text style={s.subtitle}>Sign in to book your next appointment</Text>

        <Text style={s.label}>Phone Number</Text>
        <TextInput
          style={s.input}
          placeholder="07XX XXX XXX"
          placeholderTextColor={colors.mutedForeground}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <Text style={s.label}>Password</Text>
        <TextInput
          style={s.input}
          placeholder="Enter your password"
          placeholderTextColor={colors.mutedForeground}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={s.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.buttonText}>Sign In</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
