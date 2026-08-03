import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export interface Booking {
  id: string;
  userId: string;
  spaId: string;
  serviceId: string;
  therapistId: string;
  date: string;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  paymentMethod?: string;
  depositAmount?: number;
  balanceDue?: number;
  depositPaid?: boolean;
  createdAt: string;
  policyAcknowledged?: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  serviceId: string;
  therapistId: string;
  rating: number;
  comment: string;
  tipAmount: number;
  createdAt: string;
}

interface BookingContextValue {
  bookings: Booking[];
  reviews: Review[];
  addBooking: (booking: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  hasReview: (bookingId: string) => boolean;
  isLoading: boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      if (!user) {
        setBookings([]);
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiFetch<Booking[]>('/bookings');
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  const addBooking = useCallback(
    async (booking: Partial<Booking>) => {
      const data = await apiFetch<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      });
      setBookings((prev) => [data, ...prev]);
    },
    [],
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      await apiFetch(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setBookings((prev) => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    },
    [],
  );

  const addReview = useCallback(
    async (review: Omit<Review, 'id' | 'createdAt'>) => {
      // Mock review for now
      const newReview: Review = {
        ...review,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => [newReview, ...prev]);
    },
    [],
  );

  const hasReview = useCallback(
    (bookingId: string) => reviews.some((r) => r.bookingId === bookingId),
    [reviews],
  );

  return (
    <BookingContext.Provider
      value={{ bookings, reviews, addBooking, cancelBooking, addReview, hasReview, isLoading }}
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
