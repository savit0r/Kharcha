import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  Alert, ActivityIndicator, SafeAreaView, RefreshControl,
  ScrollView, StyleSheet, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch } from '../api';

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function CustomerDetailScreen({ route, navigation }) {
  const { customerId, customerName } = route.params;

  const [customer, setCustomer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [netBalance, setNetBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add entry modal
  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState('credit'); // credit = you gave, debit = you got
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiFetch(`/ledger/customers/${customerId}/entries`);
      if (res.status === 401) { navigation.replace('Login'); return; }
      if (!res.ok) { Alert.alert('Error', 'Party not found'); navigation.goBack(); return; }
      const data = await res.json();
      setCustomer(data.customer);
      setNetBalance(data.net_balance);
      if (Array.isArray(data.entries)) setEntries(data.entries);
    } catch {
      Alert.alert('Error', 'Failed to load party data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId, navigation]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  const onRefresh = () => { setRefreshing(true); fetchData(true); };

  const handleAddEntry = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Invalid', 'Enter a valid amount');
      return;
    }
    setFormLoading(true);
    try {
      const res = await apiFetch(`/ledger/customers/${customerId}/entries`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), type: entryType, note, date: entryDate }),
      });
      if (res.ok) {
        setShowModal(false);
        setAmount(''); setNote('');
        setEntryDate(new Date().toISOString().split('T')[0]);
        fetchData(true);
      } else {
        const d = await res.json();
        Alert.alert('Error', d.message || 'Failed to add entry');
      }
    } catch { Alert.alert('Error', 'Something went wrong'); }
    finally { setFormLoading(false); }
  };

  // Group entries by date
  const grouped = (() => {
    const groups = {};
    entries.forEach(e => {
      const key = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups);
  })();

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{customerName}</Text>
        </View>
        <View style={s.center}><ActivityIndicator size="large" color="#4f46e5" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{customer?.name || customerName}</Text>
          {customer?.phone ? <Text style={s.headerSub}>📞 {customer.phone}</Text> : null}
        </View>
      </View>

      {/* Balance Card */}
      <View style={[s.balanceCard, { borderColor: netBalance >= 0 ? '#16a34a' : '#dc2626' }]}>
        <Text style={s.balanceCardLabel}>
          {netBalance > 0 ? `${customer?.name || 'They'} will give you` : netBalance < 0 ? 'You will give them' : 'All Settled ✓'}
        </Text>
        <Text style={[s.balanceCardAmount, { color: netBalance >= 0 ? '#4ade80' : '#f87171' }]}>
          {fmt(Math.abs(netBalance))}
        </Text>
        <View style={s.balanceCardStats}>
          <View style={s.bStat}>
            <Text style={s.bStatLabel}>You Gave 💸</Text>
            <Text style={[s.bStatVal, { color: '#4ade80' }]}>
              {fmt(entries.filter(e => e.type === 'credit').reduce((a, e) => a + Number(e.amount), 0))}
            </Text>
          </View>
          <View style={s.bStatDivider} />
          <View style={s.bStat}>
            <Text style={s.bStatLabel}>You Got 💰</Text>
            <Text style={[s.bStatVal, { color: '#f87171' }]}>
              {fmt(entries.filter(e => e.type === 'debit').reduce((a, e) => a + Number(e.amount), 0))}
            </Text>
          </View>
          <View style={s.bStatDivider} />
          <View style={s.bStat}>
            <Text style={s.bStatLabel}>Entries</Text>
            <Text style={[s.bStatVal, { color: '#818cf8' }]}>{entries.length}</Text>
          </View>
        </View>
      </View>

      {/* Entries */}
      <FlatList
        data={grouped}
        keyExtractor={([date]) => date}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📝</Text>
            <Text style={s.emptyText}>No entries yet. Record a transaction below.</Text>
          </View>
        }
        renderItem={({ item: [date, dateEntries] }) => (
          <View style={{ marginBottom: 18 }}>
            <View style={s.dateHeader}>
              <Text style={s.dateText}>{date}</Text>
              <View style={s.dateLine} />
            </View>
            <View style={{ gap: 8 }}>
              {dateEntries.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={s.entryCard}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert(
                      e.type === 'credit' ? '💸 You Gave' : '💰 You Got',
                      `${fmt(e.amount)}\n${e.note || 'No note'}`
                    );
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[s.entryIcon, e.type === 'credit' ? s.iconGave : s.iconGot]}>
                    <Text style={s.entryIconText}>{e.type === 'credit' ? '💸' : '💰'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.entryNote} numberOfLines={1}>{e.note || (e.type === 'credit' ? 'You Gave' : 'You Got')}</Text>
                    <Text style={s.entryTime}>
                      {new Date(e.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={[s.entryAmount, { color: e.type === 'credit' ? '#4ade80' : '#f87171' }]}>
                    {e.type === 'credit' ? '+' : '-'}{fmt(e.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />

      {/* Bottom Action Buttons */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.bottomBtn, { backgroundColor: '#16a34a' }]}
          onPress={() => { setEntryType('credit'); setShowModal(true); }}
        >
          <Text style={s.bottomBtnText}>💸  You Gave</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.bottomBtn, { backgroundColor: '#dc2626' }]}
          onPress={() => { setEntryType('debit'); setShowModal(true); }}
        >
          <Text style={s.bottomBtnText}>💰  You Got</Text>
        </TouchableOpacity>
      </View>

      {/* Add Entry Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={[s.sheetHeader, { backgroundColor: entryType === 'credit' ? '#16a34a' : '#dc2626' }]}>
                <Text style={s.sheetHeaderText}>
                  {entryType === 'credit' ? '💸 You Gave Money' : '💰 You Got Money'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 26, lineHeight: 28 }}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                <Text style={s.fieldLabel}>AMOUNT (₹) *</Text>
                <View style={s.amtRow}>
                  <Text style={s.amtPrefix}>₹</Text>
                  <TextInput
                    style={s.amtInput}
                    placeholder="0.00"
                    placeholderTextColor="#334155"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>

                <Text style={[s.fieldLabel, { marginTop: 18 }]}>DATE</Text>
                <TextInput
                  style={s.input}
                  value={entryDate}
                  onChangeText={setEntryDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#475569"
                />

                <Text style={[s.fieldLabel, { marginTop: 18 }]}>NOTE / REASON</Text>
                <TextInput
                  style={[s.input, { height: 70, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="e.g. Advance, rent, goods..."
                  placeholderTextColor="#475569"
                  value={note}
                  onChangeText={setNote}
                  multiline
                />

                <TouchableOpacity
                  style={[s.submitBtn, { backgroundColor: entryType === 'credit' ? '#16a34a' : '#dc2626' }, formLoading && { opacity: 0.6 }]}
                  onPress={handleAddEntry}
                  disabled={formLoading}
                >
                  {formLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.submitBtnText}>Save Entry</Text>}
                </TouchableOpacity>
                <View style={{ height: 24 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#94a3b8', fontSize: 20, lineHeight: 22 },
  headerTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 17 },
  headerSub: { color: '#64748b', fontSize: 12, marginTop: 1 },
  balanceCard: { margin: 16, backgroundColor: '#1e293b', borderRadius: 18, padding: 20, borderWidth: 1.5 },
  balanceCardLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  balanceCardAmount: { fontSize: 34, fontWeight: '800', marginBottom: 16, letterSpacing: -1 },
  balanceCardStats: { flexDirection: 'row', alignItems: 'center' },
  bStat: { flex: 1, alignItems: 'center' },
  bStatLabel: { color: '#64748b', fontSize: 11, marginBottom: 3 },
  bStatVal: { fontWeight: 'bold', fontSize: 14 },
  bStatDivider: { width: 1, height: 28, backgroundColor: '#334155' },
  dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dateText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  dateLine: { flex: 1, height: 1, backgroundColor: '#1e293b' },
  entryCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155' },
  entryIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconGave: { backgroundColor: 'rgba(74,222,128,0.12)' },
  iconGot: { backgroundColor: 'rgba(248,113,113,0.12)' },
  entryIconText: { fontSize: 20 },
  entryNote: { color: '#f8fafc', fontWeight: '600', fontSize: 14 },
  entryTime: { color: '#334155', fontSize: 11, marginTop: 2 },
  entryAmount: { fontWeight: 'bold', fontSize: 15 },
  emptyWrap: { alignItems: 'center', paddingTop: 50 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b' },
  bottomBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  bottomBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  fieldLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  amtRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14 },
  amtPrefix: { color: '#475569', fontSize: 24, fontWeight: 'bold', marginRight: 4 },
  amtInput: { flex: 1, color: '#f8fafc', fontSize: 28, fontWeight: 'bold', paddingVertical: 14 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#f8fafc', fontSize: 14 },
  submitBtn: { marginTop: 20, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
