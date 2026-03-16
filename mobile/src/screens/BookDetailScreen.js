import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  Alert, ActivityIndicator, RefreshControl,
  ScrollView, StyleSheet, StatusBar, Platform, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import { apiFetch } from '../api';

const PAYMENT_MODES = ['Cash', 'Online', 'Bank Transfer'];
const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;

// ─── Memoized Entry Row ───────────────────────────────────────────────────────
const EntryRow = memo(({ entry, onLongPress }) => (
  <TouchableOpacity style={s.entryCard} onLongPress={onLongPress} activeOpacity={0.8}>
    <View style={[s.entryIcon, entry.type === 'cash_in' ? s.entryIconIn : s.entryIconOut]}>
      <Text style={[s.entryIconText, entry.type === 'cash_in' ? { color: '#4ade80' } : { color: '#f87171' }]}>
        {entry.type === 'cash_in' ? '↑' : '↓'}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.entryRemark} numberOfLines={1}>
        {entry.remark || (entry.type === 'cash_in' ? 'Cash Received' : 'Cash Paid')}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
        <View style={s.modeTag}>
          <Text style={s.modeTagText}>{entry.payment_mode || 'Cash'}</Text>
        </View>
        <Text style={s.entryTime}>
          {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </Text>
      </View>
    </View>
    <Text style={[s.entryAmount, entry.type === 'cash_in' ? { color: '#4ade80' } : { color: '#f87171' }]}>
      {entry.type === 'cash_in' ? '+' : '-'}{fmt(entry.amount)}
    </Text>
  </TouchableOpacity>
));

// ─── Date Group ───────────────────────────────────────────────────────────────
const DateGroup = memo(({ date, group, onLongPressEntry }) => (
  <View style={{ marginBottom: 18 }}>
    <View style={s.dateHeader}>
      <Text style={s.dateText}>{date}</Text>
      <View style={s.dateLine} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {group.in > 0 && <Text style={{ color: '#4ade80', fontSize: 12, fontWeight: '700' }}>+{fmt(group.in)}</Text>}
        {group.out > 0 && <Text style={{ color: '#f87171', fontSize: 12, fontWeight: '700' }}>-{fmt(group.out)}</Text>}
      </View>
    </View>
    <View style={{ gap: 8 }}>
      {group.entries.map(entry => (
        <EntryRow key={entry.id} entry={entry} onLongPress={() => onLongPressEntry(entry)} />
      ))}
    </View>
  </View>
));

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BookDetailScreen({ route, navigation }) {
  const { bookId, bookName } = route.params;

  const [book, setBook] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Add Entry
  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState('cash_in');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteEntry, setDeleteEntry] = useState(null);

  // Reports
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('all_entries');
  const [exporting, setExporting] = useState(null); // 'pdf' | 'excel' | 'csv'

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [bookRes, entriesRes] = await Promise.all([
        apiFetch(`/books/${bookId}`),
        apiFetch(`/books/${bookId}/entries`),
      ]);
      if (bookRes.status === 401) { navigation.replace('Auth'); return; }
      if (!bookRes.ok) { Alert.alert('Error', 'Book not found'); navigation.goBack(); return; }
      const [bookData, entriesData] = await Promise.all([bookRes.json(), entriesRes.json()]);
      setBook(bookData);
      if (Array.isArray(entriesData)) setEntries(entriesData);
    } catch {
      Alert.alert('Error', 'Failed to load book. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookId, navigation]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(true); }, [fetchData]);

  // ── Filtered & grouped (memoized) ────────────────────────────────────────
  const filtered = useMemo(() => entries.filter(e => {
    const matchType = filterType === 'all' || e.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || (e.remark || '').toLowerCase().includes(q) || String(e.amount).includes(q);
    return matchType && matchSearch;
  }), [entries, filterType, search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const key = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = { entries: [], in: 0, out: 0 };
      groups[key].entries.push(e);
      if (e.type === 'cash_in') groups[key].in += Number(e.amount);
      else groups[key].out += Number(e.amount);
    });
    return Object.entries(groups);
  }, [filtered]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddEntry = useCallback(async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }
    setFormLoading(true);
    try {
      const res = await apiFetch(`/books/${bookId}/entries`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), type: entryType, remark, payment_mode: paymentMode, date: entryDate }),
      });
      if (res.ok) {
        setShowModal(false);
        setAmount(''); setRemark(''); setPaymentMode('Cash');
        setEntryDate(new Date().toISOString().split('T')[0]);
        fetchData(true);
      } else {
        const d = await res.json();
        Alert.alert('Error', d.error || 'Failed to add entry');
      }
    } catch { Alert.alert('Error', 'Something went wrong. Check your connection.'); }
    finally { setFormLoading(false); }
  }, [amount, entryType, remark, paymentMode, entryDate, bookId, fetchData]);

  const handleDeleteEntry = useCallback(async () => {
    if (!deleteEntry) return;
    try {
      const res = await apiFetch(`/books/${bookId}/entries/${deleteEntry.id}`, { method: 'DELETE' });
      if (res.ok) { setDeleteEntry(null); fetchData(true); }
      else Alert.alert('Error', 'Failed to delete entry');
    } catch { Alert.alert('Error', 'Something went wrong.'); }
  }, [deleteEntry, bookId, fetchData]);

  const onLongPressEntry = useCallback((entry) => {
    Alert.alert(
      'Delete Entry?',
      `${entry.type === 'cash_in' ? '+' : '-'}${fmt(entry.amount)} · ${entry.remark || 'No remark'}\n\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => setDeleteEntry(entry) },
      ]
    );
  }, []);

  // ── Report Data ───────────────────────────────────────────────────────────
  const getReportData = useCallback(() => {
    const data = entries; // always use full entries for reports
    switch (reportType) {
      case 'all_entries':
        return data.map(e => ({
          Date: new Date(e.date).toLocaleDateString('en-IN'),
          Type: e.type === 'cash_in' ? 'Cash In' : 'Cash Out',
          Amount: Number(e.amount),
          'Payment Mode': e.payment_mode || 'Cash',
          Remark: e.remark || '-',
          'Entered By': e.created_by_name || 'You',
        }));
      case 'day_wise': {
        const map = {};
        data.forEach(e => {
          const d = new Date(e.date).toLocaleDateString('en-IN');
          if (!map[d]) map[d] = { Date: d, 'Cash In (₹)': 0, 'Cash Out (₹)': 0, 'Net (₹)': 0 };
          if (e.type === 'cash_in') map[d]['Cash In (₹)'] += Number(e.amount);
          else map[d]['Cash Out (₹)'] += Number(e.amount);
          map[d]['Net (₹)'] = map[d]['Cash In (₹)'] - map[d]['Cash Out (₹)'];
        });
        return Object.values(map);
      }
      case 'payment_mode': {
        const map = {};
        data.forEach(e => {
          const m = e.payment_mode || 'Cash';
          if (!map[m]) map[m] = { 'Payment Mode': m, 'Cash In (₹)': 0, 'Cash Out (₹)': 0, 'Net (₹)': 0 };
          if (e.type === 'cash_in') map[m]['Cash In (₹)'] += Number(e.amount);
          else map[m]['Cash Out (₹)'] += Number(e.amount);
          map[m]['Net (₹)'] = map[m]['Cash In (₹)'] - map[m]['Cash Out (₹)'];
        });
        return Object.values(map);
      }
      default: return [];
    }
  }, [entries, reportType]);

  const reportTitle = useMemo(() =>
    ({ all_entries: 'All Entries', day_wise: 'Day-wise Summary', payment_mode: 'Payment Mode Summary' }[reportType])
  , [reportType]);

  // Safe filename: removes chars that break file systems
  const safeFilename = useCallback((name, suffix) => {
    const safe = name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_') || 'Book';
    return `${FileSystem.documentDirectory}${safe}_${suffix}`;
  }, []);

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleDownloadCSV = useCallback(async () => {
    const data = getReportData();
    if (!data.length) { Alert.alert('No Data', 'No entries to export'); return; }
    setExporting('csv');
    try {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(r =>
        Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;
      const filepath = safeFilename(book.name, `${reportTitle.replace(/\s+/g, '_')}.csv`);
      await FileSystem.writeAsStringAsync(filepath, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, { mimeType: 'text/csv', dialogTitle: `${book.name} - ${reportTitle}` });
      } else {
        Alert.alert('Saved', 'CSV file saved successfully.');
      }
    } catch (e) {
      Alert.alert('Export Error', e.message || 'Could not export CSV');
    } finally {
      setExporting(null);
    }
  }, [getReportData, book, reportTitle, safeFilename]);

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleDownloadExcel = useCallback(async () => {
    const data = getReportData();
    if (!data.length) { Alert.alert('No Data', 'No entries to export'); return; }
    setExporting('excel');
    try {
      const sheetName = reportTitle.slice(0, 31); // Excel sheet name max 31 chars
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = Object.keys(data[0]).map(k => ({ wch: Math.max(k.length + 2, 16) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Summary sheet
      const summary = [
        { Item: 'Book Name', Value: book.name },
        { Item: 'Report Type', Value: reportTitle },
        { Item: 'Generated On', Value: new Date().toLocaleString('en-IN') },
        { Item: 'Total In (Rs)', Value: Number(book.total_in) },
        { Item: 'Total Out (Rs)', Value: Number(book.total_out) },
        { Item: 'Net Balance (Rs)', Value: Number(book.net_balance) },
      ];
      const wsSum = XLSX.utils.json_to_sheet(summary);
      wsSum['!cols'] = [{ wch: 22 }, { wch: 28 }];
      XLSX.utils.book_append_sheet(wb, wsSum, 'Summary');

      // Use 'base64' — works in React Native without Buffer polyfill
      const b64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const filepath = safeFilename(book.name, `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
      await FileSystem.writeAsStringAsync(filepath, b64, { encoding: FileSystem.EncodingType.Base64 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: `${book.name} - ${reportTitle}`,
        });
      } else {
        Alert.alert('Saved', 'Excel file saved successfully.');
      }
    } catch (e) {
      Alert.alert('Export Error', e.message || 'Could not export Excel');
    } finally {
      setExporting(null);
    }
  }, [getReportData, book, reportTitle, safeFilename]);

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleDownloadPDF = useCallback(async () => {
    const data = getReportData();
    if (!data.length) { Alert.alert('No Data', 'No entries to export'); return; }
    setExporting('pdf');
    try {
      const headers = Object.keys(data[0]);
      const escHtml = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const rows = data.map(r =>
        `<tr>${Object.values(r).map(v => `<td>${escHtml(v)}</td>`).join('')}</tr>`
      ).join('');

      const totalIn = Number(book.total_in).toLocaleString('en-IN');
      const totalOut = Number(book.total_out).toLocaleString('en-IN');
      const net = Number(book.net_balance);
      const netColor = net >= 0 ? '#16a34a' : '#dc2626';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, Helvetica, Arial, sans-serif; background: #fff; color: #0f172a; }
            .header { background: ${book.color || '#4f46e5'}; color: white; padding: 24px 28px; }
            .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
            .header p { font-size: 13px; opacity: 0.85; }
            .summary { display: flex; background: ${book.color ? `${book.color}1A` : '#f8fafc'}; border-bottom: 2px solid #e2e8f0; }
            .summary-item { flex: 1; padding: 14px 20px; text-align: center; border-right: 1px solid #e2e8f0; }
            .summary-item:last-child { border-right: none; }
            .summary-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .summary-value { font-size: 16px; font-weight: 800; }
            .meta { padding: 12px 28px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
            .content { padding: 20px 28px; }
            .section-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: ${book.color || '#4f46e5'}; color: white; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; }
            td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }
            tr:nth-child(even) td { background: #f8fafc; }
            .footer { padding: 16px 28px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Spendora — ${book.name}</h1>
            <p>${book.description || reportTitle} Report</p>
          </div>
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total In</div>
              <div class="summary-value" style="color:#16a34a">&#8377;${totalIn}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Out</div>
              <div class="summary-value" style="color:#dc2626">&#8377;${totalOut}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Net Balance</div>
              <div class="summary-value" style="color:${netColor}">&#8377;${net.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div class="meta">Generated: ${new Date().toLocaleString('en-IN')} &nbsp;·&nbsp; ${data.length} record(s)</div>
          <div class="content">
            <div class="section-title">${reportTitle}</div>
            <table>
              <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="footer">Spendora · Your cashbook companion · Confidential</div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const filepath = safeFilename(book.name, `${reportTitle.replace(/\s+/g,'_')}.pdf`);
      await FileSystem.moveAsync({ from: uri, to: filepath });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, {
          mimeType: 'application/pdf',
          dialogTitle: `${book.name} - ${reportTitle}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Saved', 'PDF saved successfully.');
      }
    } catch (e) {
      Alert.alert('Export Error', e.message || 'Could not export PDF');
    } finally {
      setExporting(null);
    }
  }, [getReportData, book, reportTitle, safeFilename]);

  // ── FlatList renderItem (stable ref) ─────────────────────────────────────
  const renderGroup = useCallback(({ item: [date, group] }) => (
    <DateGroup date={date} group={group} onLongPressEntry={onLongPressEntry} />
  ), [onLongPressEntry]);

  const keyExtractor = useCallback(([date]) => date, []);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>{bookName}</Text>
        </View>
        <View style={s.center}><ActivityIndicator size="large" color="#4f46e5" /></View>
      </SafeAreaView>
    );
  }

  const filterLabels = [['all', 'All'], ['cash_in', 'In'], ['cash_out', 'Out']];

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: book?.color || '#0f172a' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{book?.name || bookName}</Text>
          <Text style={[s.headerSub, { color: book?.color ? 'rgba(255,255,255,0.7)' : '#64748b' }]}>
            {book?.description ? book.description : `${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'}`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowReport(true)} style={s.reportBtn}>
          <Text style={{ fontSize: 18 }}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* ── Summary Strip ── */}
      {book && (
        <View style={s.summaryStrip}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total In</Text>
            <Text style={[s.summaryVal, { color: '#4ade80' }]}>{fmt(book.total_in)}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total Out</Text>
            <Text style={[s.summaryVal, { color: '#f87171' }]}>{fmt(book.total_out)}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Net Balance</Text>
            <Text style={[s.summaryVal, { color: Number(book.net_balance) >= 0 ? '#4ade80' : '#f87171' }]}>
              {fmt(book.net_balance)}
            </Text>
          </View>
        </View>
      )}

      {/* ── Search + Filter ── */}
      <View style={s.toolbar}>
        <View style={s.searchBox}>
          <Text style={{ color: '#475569', marginRight: 6, fontSize: 14 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search entries…"
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ color: '#475569', fontSize: 16 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={s.filterRow}>
          {filterLabels.map(([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[s.filterBtn,
                filterType === val && (val === 'cash_in' ? s.filterBtnIn : val === 'cash_out' ? s.filterBtnOut : s.filterBtnAll)
              ]}
              onPress={() => setFilterType(val)}
            >
              <Text style={[s.filterBtnText, filterType === val && { color: '#fff' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Entries List ── */}
      <FlatList
        data={grouped}
        keyExtractor={keyExtractor}
        renderItem={renderGroup}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={8}
        windowSize={10}
        initialNumToRender={6}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>📋</Text>
            <Text style={s.emptyText}>
              {search || filterType !== 'all' ? 'No entries match your filter' : 'No entries yet.\nTap Cash In or Cash Out to begin.'}
            </Text>
          </View>
        }
      />

      {/* ── Bottom Action Bar ── */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.bottomBtn, { backgroundColor: '#16a34a' }]}
          onPress={() => { setEntryType('cash_in'); setShowModal(true); }}
          activeOpacity={0.85}
        >
          <Text style={s.bottomBtnText}>↑  CASH IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.bottomBtn, { backgroundColor: '#dc2626' }]}
          onPress={() => { setEntryType('cash_out'); setShowModal(true); }}
          activeOpacity={0.85}
        >
          <Text style={s.bottomBtnText}>↓  CASH OUT</Text>
        </TouchableOpacity>
      </View>

      {/* ══ Add Entry Modal ══ */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.sheetOverlay}>
            <View style={s.sheet}>
              <View style={[s.sheetHeader, { backgroundColor: entryType === 'cash_in' ? '#16a34a' : '#dc2626' }]}>
                <Text style={s.sheetHeaderText}>{entryType === 'cash_in' ? '↑ Cash In' : '↓ Cash Out'} Entry</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 26, lineHeight: 28 }}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={s.fieldLabel}>AMOUNT (₹) *</Text>
                <View style={s.amountRow}>
                  <Text style={s.amountPrefix}>₹</Text>
                  <TextInput
                    style={s.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#334155"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>

                {/* Date and other fields... */}
                <Text style={[s.fieldLabel, { marginTop: 18 }]}>DATE</Text>
                <TextInput
                  style={s.fieldInput}
                  value={entryDate}
                  onChangeText={setEntryDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#475569"
                />

                <Text style={[s.fieldLabel, { marginTop: 18 }]}>PAYMENT MODE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {PAYMENT_MODES.map(m => (
                    <TouchableOpacity
                      key={m} style={[s.modeChip, paymentMode === m && s.modeChipActive]}
                      onPress={() => setPaymentMode(m)}
                    >
                      <Text style={[s.modeChipText, paymentMode === m && { color: '#fff' }]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[s.fieldLabel, { marginTop: 18 }]}>REMARK / NOTE</Text>
                <TextInput
                  style={[s.fieldInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="What is this for?"
                  placeholderTextColor="#475569"
                  value={remark}
                  onChangeText={setRemark}
                  multiline
                />

                <TouchableOpacity
                  style={[s.submitBtn, { backgroundColor: entryType === 'cash_in' ? '#16a34a' : '#dc2626' }, formLoading && { opacity: 0.6 }]}
                  onPress={handleAddEntry}
                  disabled={formLoading}
                >
                  {formLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.submitBtnText}>Save {entryType === 'cash_in' ? 'Cash In' : 'Cash Out'}</Text>}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Delete Confirm Modal ══ */}
      <Modal visible={!!deleteEntry} transparent animationType="fade" onRequestClose={() => setDeleteEntry(null)}>
        <View style={s.centeredOverlay}>
          <View style={s.confirmCard}>
            <View style={s.confirmIconWrap}>
              <Text style={{ fontSize: 24 }}>🗑️</Text>
            </View>
            <Text style={s.confirmTitle}>Delete Entry?</Text>
            <Text style={s.confirmSub}>This cannot be undone.</Text>
            <View style={s.confirmAmount}>
              <Text style={[s.confirmAmountText, { color: deleteEntry?.type === 'cash_in' ? '#4ade80' : '#f87171' }]}>
                {deleteEntry?.type === 'cash_in' ? '+' : '-'}{fmt(deleteEntry?.amount || 0)}
              </Text>
              {deleteEntry?.remark ? <Text style={s.confirmRemark} numberOfLines={1}> · {deleteEntry.remark}</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setDeleteEntry(null)}>
                <Text style={s.cancelBtnText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteEntry}>
                <Text style={s.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ Report Modal ══ */}
      <Modal visible={showReport} transparent animationType="slide" onRequestClose={() => setShowReport(false)}>
        <View style={s.sheetOverlay}>
          <View style={[s.sheet, { maxHeight: '88%' }]}>
            {/* Report Header */}
            <View style={s.reportHeader}>
              <View>
                <Text style={s.reportHeaderTitle}>Generate Report</Text>
                <Text style={{ color: '#a5b4fc', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{book?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReport(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 26, lineHeight: 28 }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Row */}
            {book && (
              <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 12 }}>
                {[
                  { label: 'In', val: book.total_in, color: '#4ade80' },
                  { label: 'Out', val: book.total_out, color: '#f87171' },
                  { label: 'Net', val: book.net_balance, color: Number(book.net_balance) >= 0 ? '#4ade80' : '#f87171' },
                ].map(item => (
                  <View key={item.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={s.summaryLabel}>{item.label}</Text>
                    <Text style={{ color: item.color, fontWeight: 'bold', fontSize: 13 }}>{fmt(item.val)}</Text>
                  </View>
                ))}
              </View>
            )}

            <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              {/* Report Type Selection */}
              <Text style={s.reportSectionLabel}>SELECT REPORT TYPE</Text>
              {[
                { value: 'all_entries', label: 'All Entries Report', desc: 'Every transaction with full details', icon: '📋' },
                { value: 'day_wise', label: 'Day-wise Summary', desc: 'Daily totals of Cash In, Out & Net', icon: '📅' },
                { value: 'payment_mode', label: 'Payment Mode Summary', desc: 'Breakdown by Cash, Online & Bank', icon: '💳' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.reportOption, reportType === opt.value && s.reportOptionActive]}
                  onPress={() => setReportType(opt.value)}
                >
                  <Text style={{ fontSize: 20, marginRight: 4 }}>{opt.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.reportOptionLabel, reportType === opt.value && { color: '#818cf8' }]}>{opt.label}</Text>
                    <Text style={s.reportOptionDesc}>{opt.desc}</Text>
                  </View>
                  <View style={[s.radio, reportType === opt.value && s.radioActive]}>
                    {reportType === opt.value && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Export Buttons */}
              <Text style={[s.reportSectionLabel, { marginTop: 20 }]}>EXPORT FORMAT</Text>

              <TouchableOpacity
                style={[s.exportBtn, { backgroundColor: '#166534' }, exporting === 'excel' && s.exportBtnLoading]}
                onPress={handleDownloadExcel}
                disabled={!!exporting}
              >
                {exporting === 'excel'
                  ? <ActivityIndicator color="#fff" />
                  : <><Text style={s.exportBtnIcon}>📊</Text><Text style={s.exportBtnText}>GENERATE EXCEL (.xlsx)</Text></>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.exportBtn, { backgroundColor: '#4f46e5' }, exporting === 'pdf' && s.exportBtnLoading]}
                onPress={handleDownloadPDF}
                disabled={!!exporting}
              >
                {exporting === 'pdf'
                  ? <ActivityIndicator color="#fff" />
                  : <><Text style={s.exportBtnIcon}>📄</Text><Text style={s.exportBtnText}>GENERATE PDF</Text></>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.exportBtn, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }, exporting === 'csv' && s.exportBtnLoading]}
                onPress={handleDownloadCSV}
                disabled={!!exporting}
              >
                {exporting === 'csv'
                  ? <ActivityIndicator color="#94a3b8" />
                  : <><Text style={s.exportBtnIcon}>📎</Text><Text style={[s.exportBtnText, { color: '#94a3b8' }]}>DOWNLOAD CSV</Text></>
                }
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#94a3b8', fontSize: 20, lineHeight: 22 },
  headerTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 17 },
  headerSub: { color: '#64748b', fontSize: 11, marginTop: 1 },
  reportBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  summaryStrip: { flexDirection: 'row', backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  summaryItem: { flex: 1, padding: 12, alignItems: 'center' },
  summaryLabel: { color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  summaryVal: { fontWeight: 'bold', fontSize: 13 },
  summaryDivider: { width: 1, backgroundColor: '#334155', alignSelf: 'stretch' },
  toolbar: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, gap: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#334155' },
  searchInput: { flex: 1, color: '#f8fafc', paddingVertical: 11, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 6 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  filterBtnAll: { backgroundColor: '#312e81', borderColor: '#4f46e5' },
  filterBtnIn: { backgroundColor: '#14532d', borderColor: '#16a34a' },
  filterBtnOut: { backgroundColor: '#7f1d1d', borderColor: '#dc2626' },
  filterBtnText: { color: '#94a3b8', fontWeight: '700', fontSize: 12 },
  emptyWrap: { alignItems: 'center', paddingTop: 64 },
  emptyText: { color: '#475569', fontSize: 14, textAlign: 'center', paddingHorizontal: 32, lineHeight: 22 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dateText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  dateLine: { flex: 1, height: 1, backgroundColor: '#1e293b' },
  entryCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#334155' },
  entryIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  entryIconIn: { backgroundColor: 'rgba(74,222,128,0.12)' },
  entryIconOut: { backgroundColor: 'rgba(248,113,113,0.12)' },
  entryIconText: { fontSize: 20, fontWeight: 'bold' },
  entryRemark: { color: '#f8fafc', fontWeight: '600', fontSize: 14 },
  modeTag: { backgroundColor: '#0f172a', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  modeTagText: { color: '#64748b', fontSize: 11 },
  entryTime: { color: '#334155', fontSize: 11 },
  entryAmount: { fontWeight: 'bold', fontSize: 15, minWidth: 70, textAlign: 'right' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b' },
  bottomBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  bottomBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  // Overlays
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  centeredOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  // Add Entry
  fieldLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 16 },
  amountPrefix: { color: '#475569', fontSize: 24, fontWeight: 'bold', marginRight: 4 },
  amountInput: { flex: 1, color: '#f8fafc', fontSize: 28, fontWeight: 'bold', paddingVertical: 14 },
  fieldInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#f8fafc', fontSize: 14 },
  modeChip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  modeChipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  modeChipText: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  submitBtn: { marginTop: 20, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Confirm
  confirmCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155' },
  confirmIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#7f1d1d', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  confirmTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  confirmSub: { color: '#64748b', fontSize: 13, marginBottom: 16 },
  confirmAmount: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 10, padding: 12, marginBottom: 20 },
  confirmAmountText: { fontWeight: 'bold', fontSize: 16 },
  confirmRemark: { color: '#64748b', fontSize: 14 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  cancelBtnText: { color: '#94a3b8', fontWeight: '600' },
  deleteBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: 'bold' },
  // Reports
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#4f46e5', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  reportHeaderTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  reportSectionLabel: { color: '#475569', fontWeight: '700', fontSize: 11, letterSpacing: 1, marginBottom: 10 },
  reportOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 8 },
  reportOptionActive: { borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.12)' },
  reportOptionLabel: { color: '#e2e8f0', fontWeight: '600', fontSize: 14 },
  reportOptionDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#4f46e5' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4f46e5' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14, marginBottom: 10 },
  exportBtnLoading: { opacity: 0.6 },
  exportBtnIcon: { fontSize: 18, marginRight: 8 },
  exportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.3 },
});
