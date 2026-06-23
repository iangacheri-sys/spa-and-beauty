import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Booking } from '@/constants/data';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
}

interface BookingContextValue {
  bookings: Booking[];
  profile: UserProfile;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const BOOKINGS_KEY = '@spa_bookings';
const PROFILE_KEY = '@spa_profile';

const DEFAULT_PROFILE: UserProfile = { name: 'Guest', phone: '', email: '' };

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bJson, pJson] = await Promise.all([
          AsyncStorage.getItem(BOOKINGS_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);
        if (bJson) setBookings(JSON.parse(bJson));
        if (pJson) setProfile(JSON.parse(pJson));
      } catch (_) {
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const addBooking = useCallback(
    async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
      const newBooking: Booking = {
        ...booking,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    },
    [bookings],
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      const updated = bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b,
      );
      setBookings(updated);
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    },
    [bookings],
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const updated = { ...profile, ...updates };
      setProfile(updated);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    },
    [profile],
  );

  return (
    <BookingContext.Provider
      value={{ bookings, profile, addBooking, cancelBooking, updateProfile, isLoading }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
}
