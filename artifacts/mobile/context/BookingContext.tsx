import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Booking } from '@/constants/data';

export interface Review {
  id: string;
  bookingId: string;
  serviceId: string;
  staffId: string;
  rating: number;
  comment: string;
  tipAmount: number;
  createdAt: string;
}

interface UserProfile {
  name: string;
  phone: string;
  email: string;
}

interface BookingContextValue {
  bookings: Booking[];
  reviews: Review[];
  profile: UserProfile;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  hasReview: (bookingId: string) => boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const BOOKINGS_KEY = '@spa_bookings';
const REVIEWS_KEY = '@spa_reviews';
const PROFILE_KEY = '@spa_profile';

const DEFAULT_PROFILE: UserProfile = { name: 'Guest', phone: '', email: '' };

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bJson, rJson, pJson] = await Promise.all([
          AsyncStorage.getItem(BOOKINGS_KEY),
          AsyncStorage.getItem(REVIEWS_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);
        if (bJson) setBookings(JSON.parse(bJson));
        if (rJson) setReviews(JSON.parse(rJson));
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

  const addReview = useCallback(
    async (review: Omit<Review, 'id' | 'createdAt'>) => {
      const newReview: Review = {
        ...review,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
      };
      const updated = [newReview, ...reviews];
      setReviews(updated);
      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    },
    [reviews],
  );

  const hasReview = useCallback(
    (bookingId: string) => reviews.some((r) => r.bookingId === bookingId),
    [reviews],
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
      value={{ bookings, reviews, profile, addBooking, cancelBooking, addReview, hasReview, updateProfile, isLoading }}
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
