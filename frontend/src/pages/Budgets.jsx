import { useState, useEffect } from "react";
import SummaryCards from "../components/SummaryCards";

const API = "http://localhost:3000/api";

function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editCategory, setEditCategory] = useState(null);
    const [newLimit, setNewLimit] = useState("");
    const [message, setMessage] = useState("");

    const fetchBudgets = async () => {
        try {
            const res = await fetch(`${API}/budgets`, { credentials: "include" });
            const data = await res.json();
            if (Array.isArray(data)) setBudgets(data);
        } catch (error) {
            console.error("Failed to fetch budgets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSaveBudget = async (categoryId) => {
        try {
            setMessage("");
            const res = await fetch(`${API}/budgets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    category_id: categoryId,
                    monthly_limit: parseFloat(newLimit)
                }),
            });
            if (res.ok) {
                setMessage("Budget updated!");
                setEditCategory(null);
                fetchBudgets();
                setTimeout(() => setMessage(""), 2000);
            }
        } catch (error) {
            console.error("Failed to save budget:", error);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto pb-10">
                <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-100 tracking-tight">Budgets</h2>
                <div className="flex justify-center items-center py-20 min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 dark:border-neutral-600 border-t-indigo-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <h2 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-neutral-100 tracking-tight">Monthly Budgets</h2>

            {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-sm text-center font-medium">{message}</div>}

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm p-6 overflow-hidden transition-colors duration-300">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                    Set monthly limits for your expense categories. We'll warn you if you go over budget!
                </p>

                <div className="space-y-6">
                    {budgets.map((b) => {
                        const hasBudget = b.monthly_limit !== null;
                        const pct = hasBudget ? Math.min((b.current_spend / b.monthly_limit) * 100, 100) : 0;
                        const isOver = b.over_budget;
                        const isEditing = editCategory === b.category_id;

                        return (
                            <div key={b.category_id} className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-700/50 bg-neutral-50/50 dark:bg-neutral-900/30">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isOver ? 'bg-red-500' : hasBudget ? 'bg-indigo-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}></div>
                                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{b.category_name}</h3>
                                    </div>

                                    {!isEditing ? (
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {hasBudget ? (
                                                    <div>
                                                        <span className={`text-sm font-semibold ${isOver ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                            ₹{b.current_spend.toLocaleString("en-IN")}
                                                        </span>
                                                        <span className="text-xs text-neutral-500 dark:text-neutral-400"> / ₹{b.monthly_limit.toLocaleString("en-IN")}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-500 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-md">No Limit</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => { setEditCategory(b.category_id); setNewLimit(b.monthly_limit || ""); }}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
                                            >
                                                {hasBudget ? 'Edit' : 'Set'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-neutral-500 text-sm">₹</span>
                                            <input
                                                type="number"
                                                value={newLimit}
                                                onChange={(e) => setNewLimit(e.target.value)}
                                                className="w-24 px-2 py-1 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg outline-none focus:border-indigo-500 text-neutral-900 dark:text-neutral-100"
                                                placeholder="Amount"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveBudget(b.category_id)}
                                                className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors"
                                            >Save</button>
                                            <button
                                                onClick={() => setEditCategory(null)}
                                                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-xs px-2"
                                            >Cancel</button>
                                        </div>
                                    )}
                                </div>

                                {hasBudget && !isEditing && (
                                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${isOver ? "bg-red-500" : "bg-indigo-500"}`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                )}
                                {isOver && !isEditing && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium bg-red-500/10 inline-block px-2 py-0.5 rounded-md">
                                        Over budget by ₹{(b.current_spend - b.monthly_limit).toLocaleString("en-IN")}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Budgets;
