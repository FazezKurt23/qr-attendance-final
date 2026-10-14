import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import StatusPill from '@/components/StatusPill';
import { COLORS } from '@/constants/colors';
import { listOpenEvents, type CloudEvent } from '@/lib/events';
import { getAttendanceHistory } from '@/lib/attendance';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';

function dateBadgeParts(iso: string | null) {
  if (!iso) return { day: '--', mon: '---' };
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, '0'),
    mon: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<CloudEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [present, setPresent] = useState(0);
  const [late, setLate] = useState(0);
  const [role, setRole] = useState<Role | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    const profile = user ? await getProfile(user.id) : null;
    setRole(profile?.role ?? null);
    const [evs, hist] = await Promise.all([
      listOpenEvents(),
      user ? getAttendanceHistory(user.id, 200) : Promise.resolve([]),
    ]);
    setEvents(evs);
    setPresent(hist.filter((h) => h.status === 'present').length);
    setLate(hist.filter((h) => h.status === 'late').length);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const total = present + late;
  // Stats + Scan kay para ra sa student. Sa teacher/admin kay 0 ra permi
  // ug dili sila maka-scan, so tagoon para limpyo.
  const showStudentTools = role === 'student';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.accent} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.greet}>School Event Attendance</Text>
            <Text style={styles.subtitle}>Scan event QR codes to record your attendance instantly.</Text>

            {showStudentTools ? (
              <>
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { borderColor: '#34D39955' }]}>
                    <Text style={[styles.statNum, { color: COLORS.success }]}>{present}</Text>
                    <Text style={styles.statLabel}>Present</Text>
                  </View>
                  <View style={[styles.statCard, { borderColor: '#FBBF2455' }]}>
                    <Text style={[styles.statNum, { color: COLORS.warning }]}>{late}</Text>
                    <Text style={styles.statLabel}>Late</Text>
                  </View>
                  <View style={[styles.statCard, { borderColor: '#8B5CF655' }]}>
                    <Text style={[styles.statNum, { color: COLORS.primary }]}>{total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>

                <View style={styles.scanCta}>
                  <AppButton theme="primary" title="Scan QR Code" icon="qr-code-outline" onPress={() => router.push('/(tabs)/scan')} />
                </View>
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Available Events ({events.length})</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={44} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No open events</Text>
            <Text style={styles.empty}>Pull to refresh or check your history.</Text>
            <View style={{ width: '100%', marginTop: 12, gap: 10 }}>
              <AppButton title="Scan Now" icon="qr-code-outline" theme="primary" onPress={() => router.push('/(tabs)/scan')} />
              <AppButton title="View History" icon="time-outline" onPress={() => router.push('/(tabs)/history')} />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const badge = dateBadgeParts(item.start_time);
          return (
            <View style={styles.card}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateDay}>{badge.day}</Text>
                <Text style={styles.dateMon}>{badge.mon}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <StatusPill status={item.status} />
                </View>
                <Text style={styles.code}>{item.event_code}</Text>
                {item.venue ? (
                  <View style={styles.venueRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.accent} />
                    <Text style={styles.meta} numberOfLines={1}>{item.venue}</Text>
                  </View>
                ) : null}
                {item.start_time ? (
                  <Text style={styles.meta}>{new Date(item.start_time).toLocaleString()}</Text>
                ) : null}
                {showStudentTools ? (
                  <Pressable style={styles.scanBtn} onPress={() => router.push('/(tabs)/scan')}>
                    <Ionicons name="qr-code-outline" size={15} color={COLORS.textOnPrimary} />
                    <Text style={styles.scanBtnText}>Scan to attend</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, gap: 12, paddingBottom: 32, paddingTop: 20 },
  greet: { fontSize: 24, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary, marginBottom: 4, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, lineHeight: 20, color: COLORS.textSecondary, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, paddingVertical: 12, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 22, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold' },
  statLabel: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold', color: COLORS.textSecondary },
  scanCta: { marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary, marginBottom: 4 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  dateBadge: { width: 56, height: 64, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  dateMon: { fontSize: 11, fontWeight: '800', color: COLORS.accent, letterSpacing: 1 },
  cardBody: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary, flex: 1 },
  code: { fontSize: 12, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.5 },
  meta: { fontSize: 13, color: COLORS.textSecondary },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scanBtn: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 9 },
  scanBtnText: { color: COLORS.textOnPrimary, fontWeight: '800', fontSize: 13 },
  emptyWrap: { alignItems: 'center', gap: 6, marginTop: 24, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginTop: 8 },
  empty: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
