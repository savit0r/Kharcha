import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StyleSheet, StatusBar, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch } from '../api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [profileRes, actRes] = await Promise.all([
        apiFetch('/auth/me'),
        apiFetch('/activity?limit=20'),
      ]);
      if (profileRes.status === 401) { navigation.replace('Login'); return; }
      const [profileData, actData] = await Promise.all([
        profileRes.ok ? profileRes.json() : null,
        actRes.ok ? actRes.json() : [],
      ]);
      if (profileData) setUser(profileData.user || profileData);
      if (Array.isArray(actData)) setActivity(actData);
    } catch { /* silently fail */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));
  const onRefresh = () => { setRefreshing(true); fetchAll(true); };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
          navigation.replace('Login');
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  // Group activity by date
  const groupedActivity = (() => {
    const groups = {};
    activity.forEach(a => {
      const key = new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return Object.entries(groups);
  })();

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#4f46e5" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Avatar Hero ── */}
          <View style={s.avatarCard}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <Text style={s.userName}>{user?.name || 'Spendora User'}</Text>
            <Text style={s.userEmail}>{user?.email || ''}</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>✓  Active Account</Text>
            </View>
          </View>

          {/* ── Account Details ── */}
          <Text style={s.sectionLabel}>ACCOUNT DETAILS</Text>
          <View style={s.card}>
            {[
              { icon: '👤', label: 'Full Name', value: user?.name || '—' },
              { icon: '📧', label: 'Email', value: user?.email || '—' },
              { icon: '📅', label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
            ].map((item, i, arr) => (
              <View key={item.label} style={[s.infoRow, i > 0 && s.infoRowBorder]}>
                <View style={s.infoIcon}><Text style={{ fontSize: 16 }}>{item.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.infoLabel}>{item.label}</Text>
                  <Text style={s.infoValue} numberOfLines={1}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Activity Log ── */}
          {groupedActivity.length > 0 && (
            <>
              <Text style={s.sectionLabel}>RECENT ACTIVITY</Text>
              <View style={s.card}>
                {groupedActivity.map(([date, acts], gi) => (
                  <View key={date}>
                    <View style={[s.actDateRow, gi > 0 && { marginTop: 4 }]}>
                      <Text style={s.actDate}>{date}</Text>
                    </View>
                    {acts.map((act, i) => (
                      <View key={act.id || i} style={[s.actRow, s.infoRowBorder]}>
                        <View style={s.actDot} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.actText} numberOfLines={2}>
                            {act.description || act.action || 'Activity'}
                          </Text>
                          <Text style={s.actTime}>
                            {new Date(act.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── About ── */}
          <Text style={s.sectionLabel}>ABOUT</Text>
          <View style={s.card}>
            {[
              { icon: '📱', label: 'App Version', value: 'Spendora Mobile 1.0.0' },
              { icon: '🔒', label: 'Security', value: 'Session-based Authentication' },
              { icon: '🗄️', label: 'Data', value: 'Synced with Spendora Cloud' },
            ].map((item, i) => (
              <View key={item.label} style={[s.infoRow, i > 0 && s.infoRowBorder]}>
                <View style={s.infoIcon}><Text style={{ fontSize: 16 }}>{item.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.infoLabel}>{item.label}</Text>
                  <Text style={s.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Logout ── */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={s.logoutBtnText}>↩  Sign Out</Text>
          </TouchableOpacity>

          <Text style={s.footer}>Made with ❤️ · Spendora</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc' },
  // Avatar
  avatarCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 22, borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#6366f1' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  userName: { color: '#f8fafc', fontWeight: 'bold', fontSize: 20, marginBottom: 4 },
  userEmail: { color: '#64748b', fontSize: 14, marginBottom: 14 },
  badge: { backgroundColor: '#14532d', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#16a34a' },
  badgeText: { color: '#4ade80', fontWeight: '600', fontSize: 13 },
  // Cards
  sectionLabel: { color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginLeft: 2 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 22, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: '#293548' },
  infoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  infoValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  // Activity
  actDateRow: { paddingHorizontal: 15, paddingTop: 12, paddingBottom: 6 },
  actDate: { color: '#4f46e5', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  actRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, gap: 12 },
  actDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4f46e5', marginTop: 2 },
  actText: { color: '#cbd5e1', fontSize: 13 },
  actTime: { color: '#475569', fontSize: 11, marginTop: 3 },
  // Logout
  logoutBtn: { backgroundColor: '#7f1d1d', borderWidth: 1, borderColor: '#dc2626', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  logoutBtnText: { color: '#fca5a5', fontWeight: 'bold', fontSize: 16 },
  footer: { color: '#334155', textAlign: 'center', fontSize: 12, paddingBottom: 8 },
});
