import { customFetch } from "@workspace/api-client-react";
export { customFetch as apiFetch };
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth";

// Types
export interface Service {
  id: string;
  spaId: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  image?: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  spaId: string;
  userId: string;
  therapistId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  spaId: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
}

export interface TrainingClass {
  id: string;
  spaId: string;
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
  enrolled: any[];
}

export interface Therapist {
  id: string;
  spaId: string;
  userId: string;
  name: string;
  specialties: string[];
  bio: string;
  avatar?: string;
  isActive: boolean;
}

export function useServices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['services', user?.spaId],
    queryFn: () => customFetch<Service[]>(`/api/services${user?.spaId ? `?spaId=${user.spaId}` : ''}`),
  });
}

export function useProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['products', user?.spaId],
    queryFn: () => customFetch<Product[]>(`/api/products${user?.spaId ? `?spaId=${user.spaId}` : ''}`),
  });
}

export function useClasses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['classes', user?.spaId],
    queryFn: () => customFetch<TrainingClass[]>(`/api/classes${user?.spaId ? `?spaId=${user.spaId}` : ''}`),
  });
}

export function useBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookings', user?.spaId],
    queryFn: () => customFetch<Booking[]>(`/api/bookings${user?.spaId ? `?spaId=${user.spaId}` : ''}`),
  });
}

export function useTherapists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['therapists', user?.spaId],
    queryFn: () => customFetch<Therapist[]>(`/api/therapists${user?.spaId ? `?spaId=${user.spaId}` : ''}`),
  });
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  createdAt: string;
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => customFetch<Client[]>('/api/users?role=CUSTOMER'),
  });
}

export interface Spa {
  id: string;
  name: string;
  address: string;
  phone: string;
  ownerId: string;
  subscriptionTier: string;
}

export function useSpas(all: boolean = false) {
  return useQuery({
    queryKey: ['spas', all],
    queryFn: () => customFetch<Spa[]>(`/api/spas${all ? '?all=true' : ''}`),
  });
}

export interface Staff {
  id: string;
  userId: string;
  spaId: string;
  role: string;
  isActive: boolean;
  user: { name: string; phone: string; email?: string };
}

export function useStaff() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['staff', user?.spaId],
    queryFn: () => customFetch<Staff[]>(`/api/users?role=THERAPIST&spaId=${user?.spaId ?? ''}`),
    enabled: !!user?.spaId,
  });
}

export interface Conversation {
  id: string;
  spaId: string;
  clientName: string;
  clientPhone?: string;
  status: 'open' | 'resolved' | 'blocked';
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['conversations', user?.spaId],
    queryFn: () => customFetch<Conversation[]>(`/api/messages?spaId=${user?.spaId ?? ''}`),
    enabled: !!user?.spaId,
  });
}

export interface DashboardStats {
  revenue: number;
  bookings: number;
  newClients: number;
  activeStaff: number;
}

export function useDashboardStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboardStats', user?.spaId],
    queryFn: () => customFetch<DashboardStats>(`/api/analytics/dashboard?spaId=${user?.spaId ?? ''}`),
    enabled: !!user?.spaId || user?.role === 'PLATFORM_ADMIN',
  });
}

export interface RevenueChartData {
  date: string;
  amount: number;
}

export function useRevenueChart(days: number = 30) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['revenueChart', user?.spaId, days],
    queryFn: () => customFetch<RevenueChartData[]>(`/api/analytics/revenue?spaId=${user?.spaId ?? ''}&days=${days}`),
    enabled: !!user?.spaId || user?.role === 'PLATFORM_ADMIN',
  });
}

export interface Review {
  id: string;
  spaId: string;
  therapistId?: string;
  serviceId?: string;
  authorId: string;
  bookingId: string;
  rating: number;
  title?: string;
  body?: string;
  photos: string[];
  tags: string[];
  ownerReply?: string;
  ownerRepliedAt?: string;
  aiModerated: boolean;
  aiSentiment?: string;
  isVisible: boolean;
  createdAt: string;
  author: { id: string; name: string; };
}

export function useReviews() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['reviews', user?.spaId],
    queryFn: () => customFetch<Review[]>(`/api/reviews${user?.spaId ? `?spaId=${user.spaId}` : ''}`),
  });
}

// ── Loyalty ───────────────────────────────────────────────────────────────────

export interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  tier: string;
  createdAt: string;
  transactions: LoyaltyTransaction[];
}

export interface LoyaltyTransaction {
  id: string;
  accountId: string;
  type: 'EARN' | 'REDEEM';
  points: number;
  description: string;
  createdAt: string;
}

export function useLoyaltyAccount() {
  return useQuery({
    queryKey: ['loyaltyAccount'],
    queryFn: () => customFetch<LoyaltyAccount>('/api/loyalty'),
  });
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface WalletData {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  reference?: string;
  description: string;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  spaId?: string;
  code: string;
  value: number;
  balance: number;
  isActive: boolean;
  expiresAt?: string;
  redeemedBy?: string;
  createdAt: string;
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => customFetch<WalletData>('/api/wallet'),
  });
}

export function useGiftCards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['giftCards', user?.spaId],
    queryFn: () => customFetch<any[]>(`/api/wallet/gift-cards?spaId=${user?.spaId ?? ''}`),
    enabled: !!user?.spaId,
  });
}

export function useDashboardMetrics(spaId?: string) {
  return useQuery<any>({
    queryKey: ['metrics', spaId],
    queryFn: () => customFetch(`/api/analytics/dashboard?spaId=${spaId}`),
    enabled: !!spaId,
  });
}

// ==========================================
// PAYROLL & COMMISSIONS
// ==========================================
export interface CommissionRecord {
  id: string;
  spaId: string;
  therapistId: string;
  bookingId: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
  therapist: { id: string; name: string; avatar?: string };
  booking: {
    id: string; date: string; timeSlot: string; price: number;
    service: { name: string; commissionPercent: number };
  };
}

export interface PayrollSummary {
  therapistId: string;
  name: string;
  pending: number;
  paid: number;
}

export function useCommissions(spaId?: string, status?: string) {
  return useQuery<CommissionRecord[]>({
    queryKey: ['commissions', spaId, status],
    queryFn: () => {
      let url = `/api/payroll/commissions?spaId=${spaId}`;
      if (status && status !== 'ALL') url += `&status=${status}`;
      return customFetch(url);
    },
    enabled: !!spaId,
  });
}

export function usePayrollSummary(spaId?: string) {
  return useQuery<PayrollSummary[]>({
    queryKey: ['payroll-summary', spaId],
    queryFn: () => customFetch(`/api/payroll/summary?spaId=${spaId}`),
    enabled: !!spaId,
  });
}

export async function payCommissions(ids: string[]) {
  return customFetch(`/api/payroll/commissions/pay`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  note?: string;
  createdAt: string;
  product: { name: string };
}

export function useInventory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['inventory', user?.spaId],
    queryFn: () => customFetch<InventoryItem[]>(`/api/inventory?spaId=${user?.spaId ?? ''}`),
    enabled: !!user?.spaId,
  });
}

export function useInventoryAlerts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['inventoryAlerts', user?.spaId],
    queryFn: () => customFetch<InventoryItem[]>(`/api/inventory/alerts?spaId=${user?.spaId ?? ''}`),
    enabled: !!user?.spaId,
  });
}

export function useInventoryHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['inventoryHistory', user?.spaId],
    queryFn: () => customFetch<InventoryMovement[]>(`/api/inventory/history?spaId=${user?.spaId ?? ''}`),
    enabled: !!user?.spaId,
  });
}

// ─── Schedule / Time Off ──────────────────────────────────────────────────────

export interface TherapistSchedule {
  id: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface TimeOff {
  id: string;
  spaId: string;
  therapistId: string | null;
  startDate: string;
  endDate: string;
  reason: string | null;
  therapist?: { id: string; name: string } | null;
}

export function useTherapistSchedule(therapistId: string | null) {
  return useQuery({
    queryKey: ['therapistSchedule', therapistId],
    queryFn: () => customFetch<TherapistSchedule[]>(`/api/schedules/therapist/${therapistId}`),
    enabled: !!therapistId,
  });
}

export function useTimeOff() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['timeOff', user?.spaId],
    queryFn: () => customFetch<TimeOff[]>(`/api/schedules/timeoff`),
    enabled: !!user?.spaId,
  });
}

// ─── Payment Settings ────────────────────────────────────────────────────────

export interface SpaPaymentSettings {
  id: string;
  spaId: string;
  activeProvider: string;
  mpesaPaybillNumber?: string | null;
  mpesaAccountRef?: string | null;
  mpesaTillNumber?: string | null;
  mpesaPochiNumber?: string | null;
  stripeAccountId?: string | null;
  instructions?: string | null;
}

export function usePaymentSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['paymentSettings', user?.spaId],
    queryFn: () => customFetch<SpaPaymentSettings>(`/api/settings/payment`),
    enabled: !!user?.spaId,
  });
}

export async function updatePaymentSettings(data: Partial<SpaPaymentSettings>) {
  return customFetch<SpaPaymentSettings>(`/api/settings/payment`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
