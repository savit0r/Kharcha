import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, StyleSheet, StatusBar, ActivityIndicator, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { apiFetch } from '../api';

// removed static SCREEN_W
const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HomeScreen({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const [dashboard, setDashboard] = useState(null);
  const [books, setBooks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [dashRes, booksRes, actRes] = await Promise.all([
        apiFetch('/dashboard'),
        apiFetch('/books'),
        apiFetch('/activity?limit=10'),
      ]);
      if (dashRes.status === 401) { navigation.replace('Login'); return; }
      const [dash, booksData, actData] = await Promise.all([
        dashRes.ok ? dashRes.json() : null,
        booksRes.ok ? booksRes.json() : [],
        actRes.ok ? actRes.json() : [],
      ]);
      if (dash) setDashboard(dash);
      if (Array.isArray(booksData)) setBooks(booksData.slice(0, 5));
      if (Array.isArray(actData)) setActivity(actData.slice(0, 8));
    } catch {
      // Silently fail — data is non-critical here
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));
  const onRefresh = () => { setRefreshing(true); fetchAll(true); };

  // Build chart data from monthly trend
  const chartData = (() => {
    if (!dashboard?.monthlyTrend?.length) return null;
    const trend = dashboard.monthlyTrend;
    const labels = trend.map(t => MONTH_LABELS[parseInt(t.month.split('-')[1]) - 1]);
    const inData = trend.map(t => Number(t.income || 0));
    const outData = trend.map(t => Number(t.expense || 0));
    return { labels, inData, outData };
  })();

  // Books-based totals (more accurate for cashbook context)
  const totalIn = books.reduce((a, b) => a + Number(b.total_in || 0), 0);
  const totalOut = books.reduce((a, b) => a + Number(b.total_out || 0), 0);
  const netBalance = totalIn - totalOut;

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.center}><ActivityIndicator size="large" color="#4f46e5" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good {getGreeting()} 👋</Text>
          <Text style={s.headerTitle}>Spendora</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Net Balance Hero Card ── */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Total Net Balance</Text>
          <Text style={[s.heroBalance, { color: netBalance >= 0 ? '#4ade80' : '#f87171' }]}>
            {fmt(netBalance)}
          </Text>
          <View style={s.heroRow}>
            <View style={s.heroStat}>
              <Text style={s.heroStatLabel}>↑ Total In</Text>
              <Text style={[s.heroStatVal, { color: '#4ade80' }]}>{fmt(totalIn)}</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatLabel}>↓ Total Out</Text>
              <Text style={[s.heroStatVal, { color: '#f87171' }]}>{fmt(totalOut)}</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatLabel}>📒 Books</Text>
              <Text style={[s.heroStatVal, { color: '#818cf8' }]}>{books.length}</Text>
            </View>
          </View>
        </View>

        {/* ── 6-Month Chart ── */}
        {chartData && chartData.labels.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>6-Month Cash Flow</Text>
            <View style={s.chartCard}>
              <BarChart
                data={{
                  labels: chartData.labels,
                  datasets: [
                    { data: chartData.inData.length ? chartData.inData : [0], color: () => 'rgba(74,222,128,0.8)' },
                  ],
                }}
                width={windowWidth - 56}
                height={180}
                yAxisLabel="₹"
                yAxisSuffix=""
                fromZero
                chartConfig={{
                  backgroundColor: '#1e293b',
                  backgroundGradientFrom: '#1e293b',
                  backgroundGradientTo: '#1e293b',
                  decimalPlaces: 0,
                  color: () => 'rgba(74,222,128,0.8)',
                  labelColor: () => '#64748b',
                  propsForBackgroundLines: { stroke: '#334155', strokeDasharray: '' },
                  barPercentage: 0.6,
                  formatYLabel: v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v),
                }}
                style={{ borderRadius: 12 }}
                showValuesOnTopOfBars={false}
                withInnerLines
              />
              <View style={s.chartLegend}>
                <View style={s.legendDot} />
                <Text style={s.legendText}>Cash In (6 months)</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Quick Access — Books ── */}
        {books.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>My Books</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BooksTab')}>
                <Text style={s.sectionLink}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8 }}>
              {books.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={s.bookRow}
                  onPress={() => navigation.navigate('BooksTab', { screen: 'BookDetail', params: { bookId: b.id, bookName: b.name } })}
                >
                  <View style={s.bookRowIcon}>
                    <Text style={{ fontSize: 16 }}>📒</Text>
                  </View>
                  <Text style={s.bookRowName} numberOfLines={1}>{b.name}</Text>
                  <Text style={[s.bookRowNet, Number(b.net_balance) >= 0 ? { color: '#4ade80' } : { color: '#f87171' }]}>
                    {fmt(b.net_balance)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Recent Activity ── */}
        {activity.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            <View style={s.card}>
              {activity.map((act, i) => (
                <View key={act.id || i} style={[s.actRow, i > 0 && s.actRowBorder]}>
                  <View style={s.actDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.actText} numberOfLines={1}>{act.description || act.action || 'Action'}</Text>
                    <Text style={s.actTime}>
                      {new Date(act.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty home */}
        {books.length === 0 && (
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 52, marginBottom: 14 }}>📊</Text>
            <Text style={s.emptyTitle}>Welcome to Spendora!</Text>
            <Text style={s.emptySub}>Create your first cashbook to start tracking your money.</Text>
            <TouchableOpacity
              style={s.ctaBtn}
              onPress={() => navigation.navigate('BooksTab')}
            >
              <Text style={s.ctaBtnText}>+ Create First Book</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e293b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  headerTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 22 },
  heroCard: { backgroundColor: '#312e81', borderRadius: 20, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: '#4338ca' },
  heroLabel: { color: '#a5b4fc', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  heroBalance: { fontSize: 36, fontWeight: '800', marginBottom: 18, letterSpacing: -1 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatLabel: { color: '#a5b4fc', fontSize: 11, marginBottom: 3 },
  heroStatVal: { fontWeight: 'bold', fontSize: 14 },
  heroDivider: { width: 1, height: 32, backgroundColor: 'rgba(165,180,252,0.2)' },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 15, marginBottom: 10 },
  sectionLink: { color: '#818cf8', fontSize: 13, fontWeight: '600' },
  chartCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#334155' },
  chartLegend: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', marginRight: 6 },
  legendText: { color: '#64748b', fontSize: 11 },
  bookRow: { backgroundColor: '#1e293b', borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155' },
  bookRowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#312e81', alignItems: 'center', justifyContent: 'center' },
  bookRowName: { flex: 1, color: '#f8fafc', fontWeight: '600', fontSize: 14 },
  bookRowNet: { fontWeight: 'bold', fontSize: 14 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  actRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  actRowBorder: { borderTopWidth: 1, borderTopColor: '#334155' },
  actDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4f46e5' },
  actText: { color: '#e2e8f0', fontSize: 13, fontWeight: '500' },
  actTime: { color: '#475569', fontSize: 11, marginTop: 2 },
  emptyWrap: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { color: '#e2e8f0', fontWeight: 'bold', fontSize: 20, marginBottom: 8 },
  emptySub: { color: '#64748b', fontSize: 14, textAlign: 'center', paddingHorizontal: 32, marginBottom: 24 },
  ctaBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  ctaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
