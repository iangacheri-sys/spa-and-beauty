import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBookings, Review } from '@/context/BookingContext';
import { useColors } from '@/hooks/useColors';
import { SERVICES, STAFF, formatDate, formatPrice } from '@/constants/data';
import { Booking } from '@/constants/data';

const TIP_OPTIONS = [0, 100, 200, 300, 500];

function StarPicker({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => { Haptics.selectionAsync(); onChange(n); }}>
          <Feather
            name="star"
            size={size}
            color={n <= value ? '#F59E0B' : '#D1D5DB'}
            style={{ fill: n <= value ? '#F59E0B' : 'none' } as never}
          />
        </Pressable>
      ))}
    </View>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Feather
          key={n}
          name="star"
          size={size}
          color={n <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

export default function FeedbackScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookings, reviews, addReview, hasReview } = useBookings();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const completedBookings = bookings
    .filter((b) => b.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date));

  const pendingReview = completedBookings.filter((b) => !hasReview(b.id));
  const reviewed = completedBookings.filter((b) => hasReview(b.id));

  function openModal(booking: Booking) {
    setActiveBooking(booking);
    setRating(0);
    setComment('');
    setTipAmount(0);
  }

  function closeModal() {
    setActiveBooking(null);
  }

  async function submitReview() {
    if (!activeBooking) return;
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
      return;
    }
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addReview({
      bookingId: activeBooking.id,
      serviceId: activeBooking.serviceId,
      staffId: activeBooking.staffId,
      rating,
      comment: comment.trim(),
      tipAmount,
    });
    setSubmitting(false);
    closeModal();
  }

  function getReviewForBooking(bookingId: string): Review | undefined {
    return reviews.find((r) => r.bookingId === bookingId);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topInset + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 },
    sectionLabel: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: 20,
      marginBottom: 10,
      marginTop: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
    serviceName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.foreground, flex: 1, marginRight: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    metaText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
    feedbackBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingVertical: 9,
      paddingHorizontal: 16,
      alignSelf: 'flex-start',
    },
    feedbackBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
    reviewedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#E8F5E9',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    reviewedText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#2E7D32' },
    reviewComment: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      lineHeight: 20,
      marginTop: 8,
      fontStyle: 'italic',
    },
    tipBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#FEF3C7',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    tipBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#92400E' },
    emptyBox: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 6, lineHeight: 20 },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: Math.max(insets.bottom + 20, 32),
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 20,
    },
    modalHeader: { paddingHorizontal: 24, marginBottom: 20 },
    modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.foreground },
    modalSubtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 3 },
    modalSection: { paddingHorizontal: 24, marginBottom: 20 },
    modalSectionLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground, marginBottom: 10 },
    commentInput: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      height: 90,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      textAlignVertical: 'top',
    },
    tipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    tipChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    tipChipText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    submitBtn: {
      marginHorizontal: 24,
      paddingVertical: 15,
      borderRadius: 14,
      alignItems: 'center',
    },
    submitBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  });

  const activeService = activeBooking ? SERVICES.find((s) => s.id === activeBooking.serviceId) : null;
  const activeStaff = activeBooking ? STAFF.find((s) => s.id === activeBooking.staffId) : null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Feedback</Text>
        <Text style={s.subtitle}>Rate your experiences and reward great service</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(bottomInset + 100, 100) }}
      >
        {/* Pending reviews */}
        {pendingReview.length > 0 && (
          <>
            <Text style={s.sectionLabel}>Awaiting your review</Text>
            {pendingReview.map((booking) => {
              const service = SERVICES.find((s) => s.id === booking.serviceId);
              const staff = STAFF.find((s) => s.id === booking.staffId);
              return (
                <View key={booking.id} style={s.card}>
                  <View style={s.cardTop}>
                    <Text style={s.serviceName}>{service?.name ?? 'Service'}</Text>
                  </View>
                  <View style={s.metaRow}>
                    <Feather name="calendar" size={13} color={colors.mutedForeground} />
                    <Text style={s.metaText}>{formatDate(new Date(booking.date))}</Text>
                  </View>
                  {staff && (
                    <View style={s.metaRow}>
                      <Feather name="user" size={13} color={colors.mutedForeground} />
                      <Text style={s.metaText}>with {staff.name}</Text>
                    </View>
                  )}
                  <View style={s.metaRow}>
                    <Feather name="clock" size={13} color={colors.mutedForeground} />
                    <Text style={s.metaText}>{booking.timeSlot} · {service?.duration ?? 0} min</Text>
                  </View>
                  <View style={s.divider} />
                  <Pressable
                    style={s.feedbackBtn}
                    onPress={() => openModal(booking)}
                  >
                    <Feather name="star" size={14} color="#fff" />
                    <Text style={s.feedbackBtnText}>Leave Feedback</Text>
                  </Pressable>
                </View>
              );
            })}
          </>
        )}

        {/* All caught up */}
        {pendingReview.length === 0 && reviewed.length === 0 && (
          <View style={s.emptyBox}>
            <Feather name="message-square" size={48} color={colors.border} />
            <Text style={s.emptyTitle}>No completed bookings yet</Text>
            <Text style={s.emptySubtitle}>
              After your appointments are completed, you can leave a review and tip your therapist here.
            </Text>
          </View>
        )}

        {pendingReview.length === 0 && reviewed.length > 0 && (
          <View style={[s.emptyBox, { paddingTop: 32 }]}>
            <Feather name="check-circle" size={36} color="#2E7D32" />
            <Text style={s.emptyTitle}>All caught up!</Text>
            <Text style={s.emptySubtitle}>You've reviewed all your appointments.</Text>
          </View>
        )}

        {/* Submitted reviews */}
        {reviewed.length > 0 && (
          <>
            <Text style={s.sectionLabel}>My Reviews</Text>
            {reviewed.map((booking) => {
              const service = SERVICES.find((s) => s.id === booking.serviceId);
              const staff = STAFF.find((s) => s.id === booking.staffId);
              const review = getReviewForBooking(booking.id);
              return (
                <View key={booking.id} style={s.card}>
                  <View style={s.cardTop}>
                    <Text style={s.serviceName}>{service?.name ?? 'Service'}</Text>
                    <View style={s.reviewedBadge}>
                      <Feather name="check" size={11} color="#2E7D32" />
                      <Text style={s.reviewedText}>Reviewed</Text>
                    </View>
                  </View>
                  <View style={s.metaRow}>
                    <Feather name="user" size={13} color={colors.mutedForeground} />
                    <Text style={s.metaText}>{staff?.name ?? ''}</Text>
                  </View>
                  <View style={s.metaRow}>
                    <Feather name="calendar" size={13} color={colors.mutedForeground} />
                    <Text style={s.metaText}>{formatDate(new Date(booking.date))}</Text>
                  </View>
                  {review && (
                    <>
                      <View style={s.divider} />
                      <StarRow rating={review.rating} size={15} />
                      {review.comment.length > 0 && (
                        <Text style={s.reviewComment}>"{review.comment}"</Text>
                      )}
                      {review.tipAmount > 0 && (
                        <View style={s.tipBadge}>
                          <Feather name="heart" size={12} color="#92400E" />
                          <Text style={s.tipBadgeText}>Tip: {formatPrice(review.tipAmount)}</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Review modal */}
      <Modal
        visible={!!activeBooking}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={s.modalOverlay} onPress={closeModal}>
          <Pressable onPress={() => {}} style={s.modalSheet}>
            <View style={s.modalHandle} />

            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{activeService?.name ?? 'Leave Feedback'}</Text>
              <Text style={s.modalSubtitle}>
                {activeStaff ? `with ${activeStaff.name}` : ''}{activeBooking ? ` · ${formatDate(new Date(activeBooking.date))}` : ''}
              </Text>
            </View>

            {/* Star rating */}
            <View style={s.modalSection}>
              <Text style={s.modalSectionLabel}>How was your experience?</Text>
              <StarPicker value={rating} onChange={setRating} size={36} />
              {rating > 0 && (
                <Text style={{ marginTop: 8, fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                </Text>
              )}
            </View>

            {/* Comment */}
            <View style={s.modalSection}>
              <Text style={s.modalSectionLabel}>Share your thoughts (optional)</Text>
              <TextInput
                style={s.commentInput}
                placeholder="What did you love? Any suggestions for improvement?"
                placeholderTextColor={colors.mutedForeground}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Tip */}
            <View style={s.modalSection}>
              <Text style={s.modalSectionLabel}>Add a tip for your therapist (optional)</Text>
              <View style={s.tipRow}>
                {TIP_OPTIONS.map((amount) => {
                  const active = tipAmount === amount;
                  return (
                    <Pressable
                      key={amount}
                      style={[
                        s.tipChip,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary : colors.card,
                        },
                      ]}
                      onPress={() => { Haptics.selectionAsync(); setTipAmount(amount); }}
                    >
                      <Text style={[s.tipChipText, { color: active ? '#fff' : colors.foreground }]}>
                        {amount === 0 ? 'No tip' : `+${formatPrice(amount)}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Submit */}
            <Pressable
              style={[s.submitBtn, { backgroundColor: rating > 0 ? colors.primary : colors.border, opacity: submitting ? 0.7 : 1 }]}
              disabled={submitting}
              onPress={submitReview}
            >
              <Text style={s.submitBtnText}>
                {submitting ? 'Submitting...' : tipAmount > 0 ? `Submit & Tip ${formatPrice(tipAmount)}` : 'Submit Review'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
