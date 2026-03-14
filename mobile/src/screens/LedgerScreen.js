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

export default function LedgerScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Add customer modal
  const [showAdd, setShowAdd] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiFetch('/ledger/customers');
      if (res.status === 401) { navigation.replace('Login'); return; }
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch {
      Alert.alert('Error', 'Could not load party book');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(useCallback(() => { fetchCustomers(); }, [fetchCustomers]));
  const onRefresh = () => { setRefreshing(true); fetchCustomers(true); };

  const handleAddCustomer = async () => {
    if (!custName.trim()) return;
    setFormLoading(true);
    try {
      const res = await apiFetch('/ledger/customers', {
        method: 'POST',
        body: JSON.stringify({ name: custName.trim(), phone: custPhone.trim() || undefined }),
      });
      if (res.ok) {
        setShowAdd(false);
        setCustName(''); setCustPhone('');
        fetchCustomers(true);
      } else {
        const d = await res.json();
        Alert.alert('Error', d.message || 'Failed to add party');
      }
    } catch { Alert.alert('Error', 'Something went wrong'); }
    finally { setFormLoading(false); }
  };

  const totalOwedToMe = customers.reduce((a, c) => c.net_balance > 0 ? a + c.net_balance : a, 0);
  const totalIOwe = customers.reduce((a, c) => c.net_balance < 0 ? a + Math.abs(c.net_balance) : a, 0);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const renderCustomer = ({ item: c }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: c.id, customerName: c.name })}
      onLongPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      activeOpacity={0.75}
    >
      <View style={[s.avatar, { backgroundColor: c.net_balance >= 0 ? '#14532d' : '#7f1d1d' }]}>
        <Text style={s.avatarText}>{c.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.custName}>{c.name}</Text>
        {c.phone ? <Text style={s.custPhone}>📞 {c.phone}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[s.balance, { color: c.net_balance >= 0 ? '#4ade80' : '#f87171' }]}>
          {fmt(Math.abs(c.net_balance))}
        </Text>
        <Text style={[s.balanceLabel, { color: c.net_balance >= 0 ? '#4ade80' : '#f87171' }]}>
          {c.net_balance > 0 ? 'will give' : c.net_balance < 0 ? 'will get' : 'settled'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Party Book</Text>
          <Text style={s.headerSub}>{customers.length} {customers.length !== 1 ? 'parties' : 'party'}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => { setCustName(''); setCustPhone(''); setShowAdd(true); }}>
          <Text style={s.addBtnText}>+ Add Party</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#4f46e5" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={c => String(c.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            <>
              {/* Summary */}
              {customers.length > 0 && (
                <View style={s.summaryRow}>
                  <View style={[s.summaryCard, { borderColor: '#16a34a' }]}>
                    <Text style={s.summaryLabel}>They Owe You</Text>
                    <Text style={[s.summaryVal, { color: '#4ade80' }]}>{fmt(totalOwedToMe)}</Text>
                  </View>
                  <View style={[s.summaryCard, { borderColor: '#dc2626' }]}>
                    <Text style={s.summaryLabel}>You Owe Them</Text>
                    <Text style={[s.summaryVal, { color: '#f87171' }]}>{fmt(totalIOwe)}</Text>
                  </View>
                </View>
              )}

              {/* Search */}
              {customers.length > 0 && (
                <View style={s.searchBox}>
                  <Text style={{ color: '#475569', marginRight: 6 }}>🔍</Text>
                  <TextInput
                    style={s.searchInput}
                    placeholder="Search party or phone..."
                    placeholderTextColor="#475569"
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>
              )}

              {/* Empty */}
              {customers.length === 0 && (
                <View style={s.emptyWrap}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>🤝</Text>
                  <Text style={s.emptyTitle}>No parties yet</Text>
                  <Text style={s.emptySub}>Add people you give to or receive from — friends, suppliers, clients.</Text>
                  <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
                    <Text style={s.addBtnText}>+ Add First Party</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
          ListEmptyComponent={search ? <Text style={s.noResults}>No parties matching "{search}"</Text> : null}
          renderItem={renderCustomer}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}

      {/* Add Customer Modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.sheetHandle} />
              <Text style={s.sheetTitle}>Add New Party</Text>

              <Text style={s.fieldLabel}>NAME *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Ramesh Kumar, Supplier ABC"
                placeholderTextColor="#475569"
                value={custName}
                onChangeText={setCustName}
                autoFocus
                maxLength={60}
              />

              <Text style={[s.fieldLabel, { marginTop: 14 }]}>PHONE NUMBER</Text>
              <TextInput
                style={s.input}
                placeholder="Optional — for reference"
                placeholderTextColor="#475569"
                value={custPhone}
                onChangeText={setCustPhone}
                keyboardType="phone-pad"
                maxLength={15}
              />

              <TouchableOpacity
                style={[s.submitBtn, (!custName.trim() || formLoading) && { opacity: 0.5 }]}
                onPress={handleAddCustomer}
                disabled={!custName.trim() || formLoading}
              >
                {formLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Add Party</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ marginTop: 8 }}>
                <Text style={{ textAlign: 'center', color: '#64748b', paddingVertical: 10 }}>Cancel</Text>
              </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 22 },
  headerSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, padding: 14, borderWidth: 1 },
  summaryLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  summaryVal: { fontWeight: 'bold', fontSize: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  searchInput: { flex: 1, color: '#f8fafc', paddingVertical: 11, fontSize: 14 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  custName: { color: '#f8fafc', fontWeight: '600', fontSize: 15 },
  custPhone: { color: '#64748b', fontSize: 12, marginTop: 2 },
  balance: { fontWeight: 'bold', fontSize: 16 },
  balanceLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 18 },
  emptySub: { color: '#64748b', fontSize: 13, textAlign: 'center', paddingHorizontal: 32, marginBottom: 16 },
  noResults: { color: '#64748b', textAlign: 'center', paddingTop: 32 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 18, marginBottom: 20 },
  fieldLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: '#f8fafc', fontSize: 15, marginBottom: 4 },
  submitBtn: { backgroundColor: '#4f46e5', paddingVertical: 15, borderRadius: 13, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
