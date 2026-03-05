import { useState, useEffect } from "react";
import SummaryCards from "../components/SummaryCards";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import CategoryPieChart from "../components/CategoryPieChart";

const API = "http://localhost:3000/api";

const EXPENSE_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6"];
const INCOME_COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6"];

function Analytics() {
    const [dashData, setDashData] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, budgetRes] = await Promise.all([
                    fetch(`${API}/dashboard`, { credentials: "include" }),
                    fetch(`${API}/budgets`, { credentials: "include" })
                ]);
                const dash = await dashRes.json();
                const budg = await budgetRes.json();

                if (dash.totals) setDashData(dash);
                if (Array.isArray(budg)) setBudgets(budg);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Analytics</h2>
                <a
                    href={`${API}/export/transactions/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Statement
                </a>
            </div>

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
                                const budgetData = budgets.find(b => b.category_id === cat.category_id);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-2">
                                                {cat.category_name}
                                                {budgetData?.over_budget && <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">Over Budget</span>}
                                            </span>
                                            <span className="text-red-600 dark:text-red-400 font-semibold tracking-wide">₹{cat.total.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 dark:bg-neutral-700/50 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${budgetData?.over_budget ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}`}
                                                style={{
                                                    width: `${pct}%`,
                                                    backgroundColor: budgetData?.over_budget ? undefined : EXPENSE_COLORS[i % EXPENSE_COLORS.length]
                                                }}
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
