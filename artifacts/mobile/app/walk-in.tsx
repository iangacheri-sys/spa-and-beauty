import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WalkInScreen() {
  const colors = useColors();
  const router = useRouter();
  const [hasJoined, setHasJoined] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Digital Walk-in</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {!hasJoined ? (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="clock" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.waitTime, { color: colors.foreground }]}>25 - 35 mins</Text>
              <Text style={[styles.waitDesc, { color: colors.mutedForeground }]}>Estimated wait time for next available therapist.</Text>
            </View>

            <Text style={[styles.queueInfo, { color: colors.foreground }]}>
              Currently <Text style={{ fontWeight: 'bold' }}>3</Text> people ahead of you in the queue.
            </Text>

            <TouchableOpacity 
              style={[styles.joinBtn, { backgroundColor: colors.primary }]}
              onPress={() => setHasJoined(true)}
            >
              <Text style={styles.joinBtnText}>Join Queue Now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successState}>
            <View style={[styles.successCircle, { backgroundColor: '#10B981' + '20' }]}>
              <Feather name="check" size={48} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>You're in the queue!</Text>
            <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
              We will notify you when it's almost your turn. Please arrive 5 minutes before your estimated time.
            </Text>
            
            <View style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.ticketLabel, { color: colors.mutedForeground }]}>Your Ticket Number</Text>
              <Text style={[styles.ticketNumber, { color: colors.primary }]}>A-42</Text>
            </View>

            <TouchableOpacity 
              style={[styles.leaveBtn, { borderColor: colors.destructive }]}
              onPress={() => setHasJoined(false)}
            >
              <Text style={[styles.leaveBtnText, { color: colors.destructive }]}>Leave Queue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { padding: 5, marginLeft: -5 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  infoCard: { alignItems: 'center', padding: 30, borderRadius: 20, borderWidth: 1, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  waitTime: { fontSize: 36, fontWeight: 'bold', marginBottom: 10 },
  waitDesc: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  queueInfo: { fontSize: 18, textAlign: 'center', marginBottom: 40 },
  joinBtn: { paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  joinBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  successState: { alignItems: 'center', paddingTop: 20 },
  successCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  successDesc: { fontSize: 16, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20, lineHeight: 24 },
  ticketCard: { width: '100%', alignItems: 'center', padding: 30, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', marginBottom: 40 },
  ticketLabel: { fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  ticketNumber: { fontSize: 48, fontWeight: '900', letterSpacing: 2 },
  leaveBtn: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12, borderWidth: 1 },
  leaveBtnText: { fontSize: 16, fontWeight: 'bold' },
});
