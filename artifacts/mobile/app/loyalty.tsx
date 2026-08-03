import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient';

interface LoyaltyAccount {
  id: string;
  points: number;
  tier: string;
  transactions: Array<{
    id: string;
    type: 'EARN' | 'REDEEM';
    points: number;
    description: string;
    createdAt: string;
  }>;
}

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

const TIER_CONFIG: Record<string, { color: string; gradient: [string, string]; icon: string }> = {
  BRONZE: { color: '#CD7F32', gradient: ['#CD7F32', '#8B4513'], icon: '🥉' },
  SILVER: { color: '#A8A9AD', gradient: ['#A8A9AD', '#696969'], icon: '🥈' },
  GOLD: { color: '#FFD700', gradient: ['#FFD700', '#FFA500'], icon: '🥇' },
  PLATINUM: { color: '#E5E4E2', gradient: ['#E5E4E2', '#B0B0B0'], icon: '💎' },
};

const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const TIER_THRESHOLDS: Record<string, number> = { BRONZE: 0, SILVER: 500, GOLD: 2000, PLATINUM: 5000 };

export default function LoyaltyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();

  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'loyalty' | 'wallet'>('loyalty');

  const shimmer = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch<LoyaltyAccount>('/api/loyalty'),
      apiFetch<WalletData>('/api/wallet'),
    ]).then(([l, w]) => {
      setLoyalty(l);
      setWallet(w);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const tier = loyalty?.tier ?? 'BRONZE';
  const tierConf = TIER_CONFIG[tier];
  const currentTierIdx = TIER_ORDER.indexOf(tier);
  const nextTier = TIER_ORDER[currentTierIdx + 1];
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
  const progress = nextThreshold
    ? Math.min(1, (loyalty?.points ?? 0) / nextThreshold)
    : 1;

  if (loading) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Rewards & Wallet</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tab Bar */}
      <View style={[s.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(['loyalty', 'wallet'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && { backgroundColor: colors.primary, borderRadius: 10 }]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, { color: tab === t ? '#fff' : colors.mutedForeground }]}>
              {t === 'loyalty' ? '🏆 Loyalty' : '💳 Wallet'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {tab === 'loyalty' ? (
          <>
            {/* Tier Card */}
            <LinearGradient
              colors={tierConf.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.tierCard}
            >
              <View style={s.tierCardTop}>
                <View>
                  <Text style={s.tierLabel}>{tierConf.icon} {tier} MEMBER</Text>
                  <Text style={s.tierPoints}>{(loyalty?.points ?? 0).toLocaleString()} pts</Text>
                </View>
                <Text style={{ fontSize: 52 }}>{tierConf.icon}</Text>
              </View>

              {nextTier && (
                <View style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={s.progressLabel}>Progress to {nextTier}</Text>
                    <Text style={s.progressLabel}>
                      {(loyalty?.points ?? 0).toLocaleString()} / {nextThreshold?.toLocaleString()} pts
                    </Text>
                  </View>
                  <View style={s.progressBg}>
                    <Animated.View
                      style={[s.progressFill, { width: `${progress * 100}%`, opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }]}
                    />
                  </View>
                </View>
              )}
            </LinearGradient>

            {/* Tier Milestones */}
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Tier Milestones</Text>
              {TIER_ORDER.map((t, i) => {
                const conf = TIER_CONFIG[t];
                const threshold = TIER_THRESHOLDS[t];
                const reached = (loyalty?.points ?? 0) >= threshold;
                const isCurrent = t === tier;
                return (
                  <View key={t} style={[s.milestoneRow, i < TIER_ORDER.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={[s.milestoneDot, { backgroundColor: reached ? conf.color : colors.muted }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.milestoneName, { color: isCurrent ? conf.color : colors.foreground, fontWeight: isCurrent ? '700' : '500' }]}>
                        {conf.icon} {t} {isCurrent ? '← You are here' : ''}
                      </Text>
                      <Text style={[s.milestoneThreshold, { color: colors.mutedForeground }]}>
                        {threshold.toLocaleString()} points · {i === 0 ? 'Base tier' : `+${(threshold - TIER_THRESHOLDS[TIER_ORDER[i - 1]]).toLocaleString()} pts from ${TIER_ORDER[i - 1]}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Points history */}
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Points History</Text>
              {(loyalty?.transactions ?? []).length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontSize: 14, textAlign: 'center', padding: 20 }}>
                  No transactions yet. Book a service to earn points!
                </Text>
              ) : (
                (loyalty?.transactions ?? []).slice(0, 15).map((tx) => (
                  <View key={tx.id} style={[s.txRow, { borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.txDesc, { color: colors.foreground }]}>{tx.description}</Text>
                      <Text style={[s.txDate, { color: colors.mutedForeground }]}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[s.txPoints, { color: tx.type === 'EARN' ? '#F59E0B' : '#EF4444' }]}>
                      {tx.type === 'EARN' ? '+' : ''}{tx.points} pts
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            {/* Wallet Balance Card */}
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.tierCard}
            >
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 }}>💳 Beauty Wallet</Text>
              <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>
                KES {(wallet?.balance ?? 0).toLocaleString()}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 }}>
                {wallet?.currency ?? 'KES'} · Available Balance
              </Text>
            </LinearGradient>

            {/* Wallet Transactions */}
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.foreground }]}>Transaction History</Text>
              {(wallet?.transactions ?? []).length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontSize: 14, textAlign: 'center', padding: 20 }}>
                  No wallet transactions yet.
                </Text>
              ) : (
                (wallet?.transactions ?? []).slice(0, 20).map((tx) => (
                  <View key={tx.id} style={[s.txRow, { borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.txDesc, { color: colors.foreground }]}>{tx.description}</Text>
                      <Text style={[s.txDate, { color: colors.mutedForeground }]}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[s.txPoints, { color: tx.amount > 0 ? '#10B981' : '#EF4444' }]}>
                      {tx.amount > 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  tabBar: { flexDirection: 'row', margin: 16, borderRadius: 14, padding: 4, borderWidth: 1 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  tierCard: { borderRadius: 24, padding: 28, marginBottom: 20 },
  tierCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  tierPoints: { color: '#fff', fontSize: 36, fontWeight: '800' },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  milestoneDot: { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  milestoneName: { fontSize: 14 },
  milestoneThreshold: { fontSize: 11, marginTop: 2 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  txDesc: { fontSize: 13, fontWeight: '500' },
  txDate: { fontSize: 11, marginTop: 2 },
  txPoints: { fontSize: 15, fontWeight: '700' },
});
