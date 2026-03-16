import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  Alert, ActivityIndicator, RefreshControl, StyleSheet, StatusBar,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch } from '../api';

export default function BooksScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [modalName, setModalName] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalColor, setModalColor] = useState('#4f46e5');
  const [formLoading, setFormLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'

  // Colors constant
  const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#64748b"];

  // Long-press menu
  const [menuBook, setMenuBook] = useState(null);

  const fetchBooks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiFetch('/books');
      if (res.status === 401) { navigation.replace('Auth'); return; }
      const data = await res.json();
      if (Array.isArray(data)) setBooks(data);
    } catch {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(useCallback(() => { fetchBooks(); }, [fetchBooks]));

  const onRefresh = () => { setRefreshing(true); fetchBooks(true); };

  const handleCreateBook = async () => {
    if (!modalName.trim()) return;
    setFormLoading(true);
    try {
      const res = await apiFetch('/books', {
        method: 'POST',
        body: JSON.stringify({ 
          name: modalName.trim(),
          description: modalDesc.trim(),
          color: modalColor
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        setModalName('');
        setModalDesc('');
        setModalColor('#4f46e5');
        fetchBooks(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to create book');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRenameBook = async () => {
    if (!modalName.trim() || !editBook) return;
    setFormLoading(true);
    try {
      const res = await apiFetch(`/books/${editBook.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: modalName.trim(),
          description: modalDesc.trim(),
          color: modalColor
        }),
      });
      if (res.ok) {
        setEditBook(null);
        setModalName('');
        setModalDesc('');
        setModalColor('#4f46e5');
        fetchBooks(true);
      } else {
        Alert.alert('Error', 'Failed to rename book');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBook = (book) => {
    Alert.alert(
      'Delete Book?',
      `"${book.name}" and all its entries will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiFetch(`/books/${book.id}`, { method: 'DELETE' });
              if (res.ok) fetchBooks(true);
              else Alert.alert('Error', 'Failed to delete book');
            } catch { Alert.alert('Error', 'Something went wrong'); }
          },
        },
      ]
    );
  };

  const handleToggleArchive = async (book) => {
    try {
      const res = await apiFetch(`/books/${book.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_archived: !book.is_archived }),
      });
      if (res.ok) fetchBooks(true);
      else Alert.alert('Error', 'Failed to update book');
    } catch {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const activeBooks = books.filter(b => !b.is_archived && b.name.toLowerCase().includes(search.toLowerCase()));
  const archivedBooks = books.filter(b => b.is_archived && b.name.toLowerCase().includes(search.toLowerCase()));
  const filtered = activeTab === 'active' ? activeBooks : archivedBooks;

  const totalIn = filtered.reduce((acc, b) => acc + Number(b.total_in), 0);
  const totalOut = filtered.reduce((acc, b) => acc + Number(b.total_out), 0);
  const totalNet = filtered.reduce((acc, b) => acc + Number(b.net_balance), 0);

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  const renderBook = ({ item: b }) => (
    <TouchableOpacity
      style={[s.bookCard, b.is_archived && { opacity: 0.6 }]}
      onPress={() => navigation.navigate('BookDetail', { bookId: b.id, bookName: b.name })}
      onLongPress={() => setMenuBook(b)}
      activeOpacity={0.75}
    >
      <View style={[s.bookIcon, { backgroundColor: b.color || '#312e81' }]}>
        <Text style={{ fontSize: 20 }}>📒</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={s.bookName} numberOfLines={1}>{b.name}</Text>
          {b.is_archived && (
            <View style={{ backgroundColor: '#334155', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
              <Text style={{ color: '#94a3b8', fontSize: 8, fontWeight: 'bold' }}>ARCHIVED</Text>
            </View>
          )}
        </View>
        <Text style={s.bookDesc} numberOfLines={1}>{b.description || 'No description'}</Text>
        <View style={s.bookMeta}>
          <Text style={s.inText}>+{fmt(b.total_in)}</Text>
          <Text style={s.metaDot}>·</Text>
          <Text style={s.outText}>-{fmt(b.total_out)}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[s.netBal, Number(b.net_balance) >= 0 ? s.inColor : s.outColor]}>
          {fmt(b.net_balance)}
        </Text>
        <Text style={s.netLabel}>Net</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>My Books</Text>
          <Text style={s.headerSub}>{filtered.length} book{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => { setModalName(''); setModalDesc(''); setModalColor('#4f46e5'); setShowCreateModal(true); }}>
          <Text style={s.addBtnText}>+ New Book</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            <>
              {/* Summary Row */}
              {books.length > 0 && (
                <View style={s.summaryRow}>
                  <View style={s.summaryCard}>
                    <Text style={s.summaryLabel}>Total In</Text>
                    <Text style={[s.summaryVal, s.inColor]}>{fmt(totalIn)}</Text>
                  </View>
                  <View style={s.summaryCard}>
                    <Text style={s.summaryLabel}>Total Out</Text>
                    <Text style={[s.summaryVal, s.outColor]}>{fmt(totalOut)}</Text>
                  </View>
                  <View style={s.summaryCard}>
                    <Text style={s.summaryLabel}>Net</Text>
                    <Text style={[s.summaryVal, totalNet >= 0 ? s.inColor : s.outColor]}>{fmt(totalNet)}</Text>
                  </View>
                </View>
              )}

              {/* Search */}
              {books.length > 0 && (
                <View style={s.searchBox}>
                  <Text style={s.searchIcon}>🔍</Text>
                  <TextInput
                    style={s.searchInput}
                    placeholder="Search books..."
                    placeholderTextColor="#475569"
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>
              )}

              {/* Tabs */}
              {books.length > 0 && (
                <View style={s.tabContainer}>
                  <TouchableOpacity 
                    style={[s.tab, activeTab === 'active' && s.tabActive]} 
                    onPress={() => setActiveTab('active')}
                  >
                    <Text style={[s.tabText, activeTab === 'active' && s.tabTextActive]}>Active ({activeBooks.length})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[s.tab, activeTab === 'archived' && s.tabActive]} 
                    onPress={() => setActiveTab('archived')}
                  >
                    <Text style={[s.tabText, activeTab === 'archived' && s.tabTextActive]}>Archived ({archivedBooks.length})</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Empty state */}
              {books.length === 0 && (
                <View style={s.empty}>
                  <Text style={s.emptyIcon}>📚</Text>
                  <Text style={s.emptyTitle}>No books yet</Text>
                  <Text style={s.emptySub}>Create your first book to start tracking</Text>
                  <TouchableOpacity style={s.addBtn} onPress={() => setShowCreateModal(true)}>
                    <Text style={s.addBtnText}>+ Create First Book</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
          ListEmptyComponent={search ? (
            <Text style={s.noResults}>No books matching "{search}"</Text>
          ) : null}
          renderItem={renderBook}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}

      {/* Context Menu Modal */}
      <Modal visible={!!menuBook} transparent animationType="slide" onRequestClose={() => setMenuBook(null)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setMenuBook(null)}>
          <View style={s.actionSheet}>
            <View style={s.actionSheetHandle} />
            <Text style={s.actionSheetTitle} numberOfLines={1}>{menuBook?.name}</Text>
            <TouchableOpacity
              style={s.actionItem}
              onPress={() => { 
                setEditBook(menuBook); 
                setModalName(menuBook.name); 
                setModalDesc(menuBook.description || '');
                setModalColor(menuBook.color || '#4f46e5');
                setMenuBook(null); 
              }}
            >
              <Text style={s.actionItemText}>✏️  Edit Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionItem}
              onPress={() => { handleToggleArchive(menuBook); setMenuBook(null); }}
            >
              <Text style={s.actionItemText}>📦  {menuBook?.is_archived ? 'Unarchive' : 'Archive'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionItem, s.actionItemDanger]}
              onPress={() => { handleDeleteBook(menuBook); setMenuBook(null); }}
            >
              <Text style={[s.actionItemText, { color: '#ef4444' }]}>🗑️  Delete Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionItem, { marginTop: 4 }]} onPress={() => setMenuBook(null)}>
              <Text style={[s.actionItemText, { textAlign: 'center', color: '#64748b' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create/Rename Modal */}
      <Modal
        visible={showCreateModal || !!editBook}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowCreateModal(false); setEditBook(null); setModalName(''); setModalDesc(''); setModalColor('#4f46e5'); }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.overlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>{editBook ? 'Rename Book' : 'Create New Book'}</Text>
                <TextInput
                  style={s.modalInput}
                  placeholder="e.g. Office Expenses, Trip 2025"
                  placeholderTextColor="#475569"
                  value={modalName}
                  onChangeText={setModalName}
                  autoFocus
                  maxLength={60}
                />
                <Text style={s.label}>Description (Optional)</Text>
                <TextInput
                  style={[s.modalInput, { fontSize: 13, paddingVertical: 10 }]}
                  placeholder="What is this book for?"
                  placeholderTextColor="#475569"
                  value={modalDesc}
                  onChangeText={setModalDesc}
                  maxLength={100}
                />
                <Text style={s.label}>Theme Color</Text>
                <View style={s.colorRow}>
                  {COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[s.colorCircle, { backgroundColor: c }, modalColor === c && s.colorCircleActive]}
                      onPress={() => setModalColor(c)}
                    >
                      {modalColor === c && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              <TouchableOpacity
                style={[s.modalBtn, (formLoading || !modalName.trim()) && s.btnDisabled]}
                onPress={editBook ? handleRenameBook : handleCreateBook}
                disabled={formLoading || !modalName.trim()}
              >
                {formLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.modalBtnText}>{editBook ? 'Save Changes' : 'Create Book'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowCreateModal(false); setEditBook(null); setModalName(''); }}
                style={{ marginTop: 8 }}
              >
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
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc' },
  headerSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  logoutBtn: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  logoutBtnText: { color: '#64748b', fontWeight: '700', fontSize: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 10, padding: 4, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#334155' },
  tabText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#f8fafc' },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#334155' },
  summaryLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  summaryVal: { fontSize: 14, fontWeight: 'bold' },
  inColor: { color: '#22c55e' },
  outColor: { color: '#ef4444' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: '#f8fafc', paddingVertical: 12, fontSize: 14 },
  bookCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155' },
  bookIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#312e81', alignItems: 'center', justifyContent: 'center' },
  bookName: { color: '#f8fafc', fontWeight: '600', fontSize: 15 },
  bookDesc: { color: '#64748b', fontSize: 12, marginTop: 1 },
  bookMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  inText: { color: '#22c55e', fontSize: 12 },
  outText: { color: '#ef4444', fontSize: 12 },
  metaDot: { color: '#475569', fontSize: 12 },
  netBal: { fontWeight: 'bold', fontSize: 15 },
  netLabel: { color: '#475569', fontSize: 11 },
  label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  colorCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  colorCircleActive: { borderWidth: 2, borderColor: '#fff' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 18 },
  emptySub: { color: '#64748b', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  noResults: { color: '#64748b', textAlign: 'center', paddingTop: 32, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  actionSheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  actionSheetHandle: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  actionSheetTitle: { color: '#94a3b8', fontWeight: '600', fontSize: 13, marginBottom: 16 },
  actionItem: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#334155' },
  actionItemDanger: {},
  actionItemText: { color: '#e2e8f0', fontSize: 16, fontWeight: '500' },
  modalCard: { margin: 20, backgroundColor: '#1e293b', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 18, marginBottom: 16 },
  modalInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, color: '#f8fafc', fontSize: 15, marginBottom: 16 },
  modalBtn: { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
