import { useState, useEffect } from "react";
import SummaryCards from "../components/SummaryCards";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import CategoryPieChart from "../components/CategoryPieChart";

const API = "http://localhost:3000/api";

const EXPENSE_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6"];
const INCOME_COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6"];

function Analytics() {
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/dashboard`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data.totals) setDashData(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalIncome = dashData?.totals?.income ?? 0;
    const totalExpense = dashData?.totals?.expense ?? 0;

    // Top expense categories
    const topExpenseCategories = dashData?.categorySummary
        ?.filter((c) => c.type === "expense")
        ?.sort((a, b) => b.total - a.total)
        ?.slice(0, 5) ?? [];

    // Top income categories
    const topIncomeCategories = dashData?.categorySummary
        ?.filter((c) => c.type === "income")
        ?.sort((a, b) => b.total - a.total)
        ?.slice(0, 5) ?? [];

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto pb-10">
                <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-100 tracking-tight">Analytics</h2>
                <div className="flex justify-center items-center py-20 min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 dark:border-neutral-600 border-t-indigo-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-100 tracking-tight">Analytics</h2>

            {/* Summary Cards */}
            <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <MonthlyTrendChart data={dashData?.monthlyTrend} />
                <CategoryPieChart data={dashData?.categorySummary} />
            </div>

            {/* Top Categories Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Expense Categories */}
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm p-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold mb-6 text-neutral-900 dark:text-neutral-100 tracking-tight">Top Expense Categories</h3>
                    {topExpenseCategories.length === 0 ? (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-4">No expense data</p>
                    ) : (
                        <div className="space-y-4">
                            {topExpenseCategories.map((cat, i) => {
                                const maxTotal = topExpenseCategories[0]?.total || 1;
                                const pct = (cat.total / maxTotal) * 100;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-neutral-700 dark:text-neutral-300 font-medium">{cat.category_name}</span>
                                            <span className="text-red-600 dark:text-red-400 font-semibold tracking-wide">₹{cat.total.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 dark:bg-neutral-700/50 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Income Categories */}
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm p-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold mb-6 text-neutral-900 dark:text-neutral-100 tracking-tight">Top Income Sources</h3>
                    {topIncomeCategories.length === 0 ? (
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-4">No income data</p>
                    ) : (
                        <div className="space-y-4">
                            {topIncomeCategories.map((cat, i) => {
                                const maxTotal = topIncomeCategories[0]?.total || 1;
                                const pct = (cat.total / maxTotal) * 100;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-neutral-700 dark:text-neutral-300 font-medium">{cat.category_name}</span>
                                            <span className="text-green-600 dark:text-green-400 font-semibold tracking-wide">₹{cat.total.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 dark:bg-neutral-700/50 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: INCOME_COLORS[i % INCOME_COLORS.length] }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
