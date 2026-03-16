import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsScreen() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, income, expense
  const [data, setData] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this from /api/transactions
    setTimeout(() => {
      setData([
        { id: '1', title: 'Salary', amount: 45000, type: 'income', date: '2026-03-01', category: 'Income' },
        { id: '2', title: 'Groceries', amount: 2500, type: 'expense', date: '2026-03-02', category: 'Food' },
        { id: '3', title: 'Internet Bill', amount: 800, type: 'expense', date: '2026-03-05', category: 'Bills' },
        { id: '4', title: 'Freelance work', amount: 15000, type: 'income', date: '2026-03-08', category: 'Income' },
        { id: '5', title: 'Dinner', amount: 1200, type: 'expense', date: '2026-03-09', category: 'Food' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredData = filter === 'all' ? data : data.filter(t => t.type === filter);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isIncome = item.type === 'income';
    return (
      <View className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700/50 flex-row justify-between items-center">
        <View>
          <Text className="text-white font-bold text-lg">{item.title}</Text>
          <Text className="text-slate-400 text-sm mt-1">{item.category} • {item.date}</Text>
        </View>
        <Text className={`font-bold text-lg ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isIncome ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 p-6 pt-12">
      <Text className="text-3xl font-bold text-white mb-6">Transactions</Text>
      
      {/* Filters */}
      <View className="flex-row gap-2 mb-6">
        {['all', 'income', 'expense'].map(f => (
          <TouchableOpacity 
            key={f}
            onPress={() => setFilter(f)}
            className={`px-5 py-2 rounded-full border ${filter === f ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}
          >
            <Text className={`capitalize ${filter === f ? 'text-white font-bold' : 'text-slate-400'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList 
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="text-slate-500 text-center mt-10">No transactions found</Text>}
      />
    </SafeAreaView>
  );
}
