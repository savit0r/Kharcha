import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch this from /api/dashboard using the token
    setTimeout(() => {
      setSummary({ totalIncome: 45000, totalExpense: 12000, balance: 33000 });
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [500, 1000, 250, 800, 1500, 300, 0] }]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="p-6">
        <Text className="text-3xl font-bold text-white mb-6">Overview</Text>

        {/* Summary Cards */}
        <View className="bg-indigo-600 rounded-2xl p-6 mb-6 shadow-lg shadow-indigo-500/20 px-8 py-8">
            <Text className="text-indigo-200 text-sm font-medium">Total Balance</Text>
            <Text className="text-white text-4xl font-bold mt-2">₹{summary.balance.toLocaleString('en-IN')}</Text>
        </View>

        <View className="flex-row justify-between mb-8 gap-4">
            <View className="flex-1 bg-slate-800 p-5 rounded-2xl border border-slate-700">
                <Text className="text-slate-400 text-sm">Income</Text>
                <Text className="text-emerald-400 text-xl font-bold mt-1">+₹{summary.totalIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View className="flex-1 bg-slate-800 p-5 rounded-2xl border border-slate-700">
                <Text className="text-slate-400 text-sm">Expense</Text>
                <Text className="text-rose-400 text-xl font-bold mt-1">-₹{summary.totalExpense.toLocaleString('en-IN')}</Text>
            </View>
        </View>

        {/* Charts */}
        <Text className="text-xl font-bold text-white mb-4">Weekly Spending</Text>
        <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-8 items-center">
          {chartData && (
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 80} // from react-native
              height={220}
              chartConfig={{
                backgroundColor: "#1e293b",
                backgroundGradientFrom: "#1e293b",
                backgroundGradientTo: "#1e293b",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "5", strokeWidth: "2", stroke: "#818cf8" }
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
