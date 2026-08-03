import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { apiFetch } from '@/lib/api';

interface NotificationLog {
  id: string;
  type: string;
  title: string;
  body: string;
  sentAt: string;
  channel: string;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data: any = await apiFetch('/notifications/history');
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'BOOKING_UPDATE': return 'calendar';
      case 'PROMO': return 'tag';
      case 'REMINDER': return 'clock';
      default: return 'bell';
    }
  };

  const renderItem = ({ item }: { item: NotificationLog }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Feather name={getIconName(item.type)} size={20} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {new Date(item.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <Text style={[styles.body, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.body}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.channel, { color: colors.primary }]}>{item.channel}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Feather name="bell-off" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.foreground }]}>No notifications yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>We'll let you know when there's an update.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, gap: 16 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  date: { fontSize: 12 },
  body: { fontSize: 14, lineHeight: 20 },
  footer: { marginTop: 8 },
  channel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
});
