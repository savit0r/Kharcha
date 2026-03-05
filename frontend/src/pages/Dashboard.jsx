import { useState, useEffect } from "react";
import SummaryCards from "../components/SummaryCards";
import FilterBar from "../components/FilterBar";
import TransactionTable from "../components/TransactionTable";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import CategoryPieChart from "../components/CategoryPieChart";
import ActivityFeed from "../components/ActivityFeed";

const API = "http://localhost:3000/api";

function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dashboard summary data from API
    const [dashData, setDashData] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Fetch dashboard summary (totals, charts)
    const fetchDashboard = () => {
        fetch(`${API}/dashboard`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data.totals) setDashData(data);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // Fetch categories once
    useEffect(() => {
        fetch(`${API}/categories`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(console.error);
    }, []);

    // Fetch transactions with filters (debounced)
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.set("search", search);
                if (typeFilter) params.set("type", typeFilter);
                if (categoryFilter) params.set("category", categoryFilter);
                if (startDate) params.set("startDate", startDate);
                if (endDate) params.set("endDate", endDate);

                const res = await fetch(`${API}/transactions?${params.toString()}`, {
                    credentials: "include",
                });
                const data = await res.json();
                if (Array.isArray(data)) setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchTransactions, 300);
        return () => clearTimeout(debounce);
    }, [search, typeFilter, categoryFilter, startDate, endDate]);

    // Delete transaction
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API}/transactions/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setTransactions(transactions.filter((t) => t.id !== id));
                fetchDashboard(); // Refresh totals & charts
            }
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const totalIncome = dashData?.totals?.income ?? 0;
    const totalExpense = dashData?.totals?.expense ?? 0;

    const hasActiveFilters = search || typeFilter || categoryFilter || startDate || endDate;

    const clearFilters = () => {
        setSearch("");
        setTypeFilter("");
        setCategoryFilter("");
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-100 tracking-tight">Dashboard</h2>

            <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} />

            {/* Top Row: Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2">
                    <MonthlyTrendChart data={dashData?.monthlyTrend} />
                </div>
                <div className="lg:col-span-1">
                    <ActivityFeed />
                </div>
            </div>

            <FilterBar
                search={search} setSearch={setSearch}
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                categories={categories}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
            />

            <TransactionTable
                loading={loading}
                transactions={transactions}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default Dashboard;
