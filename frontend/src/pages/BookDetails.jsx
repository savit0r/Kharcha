import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/books`;

function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all"); // all | cash_in | cash_out

    // Add Entry Modal
    const [showModal, setShowModal] = useState(false);
    const [entryType, setEntryType] = useState("cash_in");
    const [formLoading, setFormLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [remark, setRemark] = useState("");
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);

    // Delete Entry Confirm
    const [deleteEntry, setDeleteEntry] = useState(null);

    // Report Modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState("all_entries");

    const fetchBookData = async () => {
        try {
            const [bookRes, entriesRes] = await Promise.all([
                fetch(`${API}/${id}`, { credentials: "include" }),
                fetch(`${API}/${id}/entries`, { credentials: "include" }),
            ]);
            if (!bookRes.ok) { toast.error("Book not found"); navigate("/books"); return; }
            const [bookData, entriesData] = await Promise.all([bookRes.json(), entriesRes.json()]);
            setBook(bookData);
            if (Array.isArray(entriesData)) setEntries(entriesData);
        } catch {
            toast.error("Failed to load book");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookData(); }, [id]);

    // Filtered entries
    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const matchType = filterType === "all" || e.type === filterType;
            const matchSearch = !search || (e.remark || "").toLowerCase().includes(search.toLowerCase()) || String(e.amount).includes(search);
            return matchType && matchSearch;
        });
    }, [entries, filterType, search]);

    // Group entries by date
    const groupedEntries = useMemo(() => {
        const groups = {};
        filteredEntries.forEach(e => {
            const dateKey = new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
            if (!groups[dateKey]) groups[dateKey] = { entries: [], in: 0, out: 0 };
            groups[dateKey].entries.push(e);
            if (e.type === "cash_in") groups[dateKey].in += Number(e.amount);
            else groups[dateKey].out += Number(e.amount);
        });
        return groups;
    }, [filteredEntries]);

    const handleAddEntry = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
        setFormLoading(true);
        try {
            const res = await fetch(`${API}/${id}/entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ amount: Number(amount), type: entryType, remark, payment_mode: paymentMode, date: entryDate }),
            });
            if (res.ok) {
                setShowModal(false);
                setAmount(""); setRemark(""); setPaymentMode("Cash");
                setEntryDate(new Date().toISOString().split("T")[0]);
                fetchBookData();
                toast.success("Entry added!");
            } else {
                const d = await res.json();
                toast.error(d.error || "Failed to add entry");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setFormLoading(false); }
    };

    const handleDeleteEntry = async () => {
        if (!deleteEntry) return;
        try {
            const res = await fetch(`${API}/${id}/entries/${deleteEntry.id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                setDeleteEntry(null);
                fetchBookData();
                toast.success("Entry deleted");
            } else {
                toast.error("Failed to delete entry");
            }
        } catch { toast.error("Something went wrong"); }
    };

    const openModal = (type) => {
        setEntryType(type);
        setShowModal(true);
    };

    // —— Report Generation ——
    const getReportData = () => {
        const data = filterType === "all" ? entries : entries.filter(e => e.type === filterType);
        switch (reportType) {
            case "all_entries": return data.map(e => ({
                Date: new Date(e.date).toLocaleDateString("en-IN"),
                Type: e.type === "cash_in" ? "Cash In" : "Cash Out",
                Amount: Number(e.amount),
                "Payment Mode": e.payment_mode || "Cash",
                Remark: e.remark || "-",
                "Entered By": e.created_by_name || "Unknown",
            }));
            case "day_wise": {
                const map = {};
                data.forEach(e => {
                    const d = new Date(e.date).toLocaleDateString("en-IN");
                    if (!map[d]) map[d] = { Date: d, "Cash In (₹)": 0, "Cash Out (₹)": 0, "Net (₹)": 0 };
                    if (e.type === "cash_in") map[d]["Cash In (₹)"] += Number(e.amount);
                    else map[d]["Cash Out (₹)"] += Number(e.amount);
                    map[d]["Net (₹)"] = map[d]["Cash In (₹)"] - map[d]["Cash Out (₹)"];
                });
                return Object.values(map);
            }
            case "payment_mode": {
                const map = {};
                data.forEach(e => {
                    const m = e.payment_mode || "Cash";
                    if (!map[m]) map[m] = { "Payment Mode": m, "Cash In (₹)": 0, "Cash Out (₹)": 0, "Net (₹)": 0 };
                    if (e.type === "cash_in") map[m]["Cash In (₹)"] += Number(e.amount);
                    else map[m]["Cash Out (₹)"] += Number(e.amount);
                    map[m]["Net (₹)"] = map[m]["Cash In (₹)"] - map[m]["Cash Out (₹)"];
                });
                return Object.values(map);
            }
            default: return [];
        }
    };

    const getReportTitle = () => ({ all_entries: "All Entries", day_wise: "Day-wise Summary", payment_mode: "Payment Mode Summary" }[reportType]);

    const handleDownloadCSV = () => {
        const data = getReportData();
        if (!data.length) { toast.error("No data to export"); return; }
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${book.name}_${getReportTitle()}.csv`;
        a.click();
        toast.success("CSV downloaded!");
    };

    const handleDownloadExcel = () => {
        const data = getReportData();
        if (!data.length) { toast.error("No data to export"); return; }
        const ws = XLSX.utils.json_to_sheet(data);
        ws["!cols"] = Object.keys(data[0]).map(k => ({ wch: Math.max(k.length + 2, 16) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, getReportTitle());
        const summary = [
            { Item: "Book Name", Value: book.name },
            { Item: "Report Type", Value: getReportTitle() },
            { Item: "Generated On", Value: new Date().toLocaleString("en-IN") },
            { Item: "Total In (₹)", Value: Number(book.total_in) },
            { Item: "Total Out (₹)", Value: Number(book.total_out) },
            { Item: "Net Balance (₹)", Value: Number(book.net_balance) },
        ];
        const wsSum = XLSX.utils.json_to_sheet(summary);
        wsSum["!cols"] = [{ wch: 22 }, { wch: 28 }];
        XLSX.utils.book_append_sheet(wb, wsSum, "Summary");
        XLSX.writeFile(wb, `${book.name}_${getReportTitle()}.xlsx`);
        toast.success("Excel downloaded!");
    };

    const handleDownloadPDF = () => {
        const data = getReportData();
        if (!data.length) { toast.error("No data to export"); return; }
        const doc = new jsPDF();
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16); doc.setFont("helvetica", "bold");
        doc.text("Spendora", 14, 13);
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text(`${book.name}  ·  ${getReportTitle()}`, 14, 23);
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9); doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 38);
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74); doc.text(`In: ₹${Number(book.total_in).toLocaleString("en-IN")}`, 14, 47);
        doc.setTextColor(220, 38, 38); doc.text(`Out: ₹${Number(book.total_out).toLocaleString("en-IN")}`, 70, 47);
        const nb = Number(book.net_balance);
        doc.setTextColor(nb >= 0 ? 22 : 220, nb >= 0 ? 163 : 38, nb >= 0 ? 74 : 38);
        doc.text(`Net: ₹${nb.toLocaleString("en-IN")}`, 130, 47);
        autoTable(doc, {
            head: [Object.keys(data[0])],
            body: data.map(r => Object.values(r).map(v => String(v))),
            startY: 55,
            theme: "striped",
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: "bold" },
            bodyStyles: { fontSize: 8, textColor: 40 },
            alternateRowStyles: { fillColor: [245, 244, 255] },
            margin: { left: 14, right: 14 },
        });
        doc.save(`${book.name}_${getReportTitle()}.pdf`);
        toast.success("PDF downloaded!");
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-300 dark:border-neutral-700 border-t-indigo-600" />
                </div>
            </div>
        );
    }
    if (!book) return null;

    return (
        <div className="max-w-3xl mx-auto pb-28 relative min-h-screen">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 sticky top-0 bg-neutral-50 dark:bg-neutral-900 py-3 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-transparent">
                <Link to="/books" className="p-2 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-500 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">{book.name}</h2>
                    <p className="text-xs text-neutral-500">{entries.length} entr{entries.length !== 1 ? "ies" : "y"}</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-700">
                    <div className="p-4 text-center">
                        <p className="text-xs text-neutral-500 font-medium mb-1">Total In</p>
                        <p className="text-base font-bold text-green-600 dark:text-green-500">₹{Number(book.total_in).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-xs text-neutral-500 font-medium mb-1">Total Out</p>
                        <p className="text-base font-bold text-red-600 dark:text-red-400">₹{Number(book.total_out).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-xs text-neutral-500 font-medium mb-1">Net Balance</p>
                        <p className={`text-base font-bold ${Number(book.net_balance) >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-400"}`}>
                            ₹{Number(book.net_balance).toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-2.5 flex justify-end">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:text-indigo-500 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        VIEW REPORTS
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Search entries…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
                    />
                </div>
                <div className="flex bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden flex-shrink-0">
                    {[["all","All"],["cash_in","In"],["cash_out","Out"]].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setFilterType(val)}
                            className={`px-3 py-2 text-xs font-semibold transition-colors ${filterType === val
                                ? val === "cash_in" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    : val === "cash_out" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                        : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Entries */}
            {filteredEntries.length === 0 ? (
                <div className="text-center py-14">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <p className="text-neutral-500 text-sm">{search || filterType !== "all" ? "No entries match your filter" : "No entries yet. Add your first transaction!"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedEntries).map(([date, group]) => (
                        <div key={date}>
                            {/* Date header */}
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{date}</span>
                                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                                <div className="flex items-center gap-2">
                                    {group.in > 0 && <span className="text-xs text-green-600 dark:text-green-500 font-medium">+₹{group.in.toLocaleString("en-IN")}</span>}
                                    {group.out > 0 && <span className="text-xs text-red-500 font-medium">-₹{group.out.toLocaleString("en-IN")}</span>}
                                </div>
                            </div>
                            {/* Entries for this date */}
                            <div className="space-y-2">
                                {group.entries.map(entry => (
                                    <div key={entry.id} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 flex items-center gap-3 group">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${entry.type === "cash_in" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                                            {entry.type === "cash_in"
                                                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                                                {entry.remark || (entry.type === "cash_in" ? "Cash Received" : "Cash Paid")}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">{entry.payment_mode || "Cash"}</span>
                                                <span className="text-xs text-neutral-400">{new Date(entry.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-base ${entry.type === "cash_in" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-400"}`}>
                                                {entry.type === "cash_in" ? "+" : "-"}₹{Number(entry.amount).toLocaleString("en-IN")}
                                            </span>
                                            <button
                                                onClick={() => setDeleteEntry(entry)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                title="Delete entry"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Fixed Bottom Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 dark:from-neutral-900 via-neutral-50/90 dark:via-neutral-900/90 to-transparent md:pl-64 z-20 pointer-events-none">
                <div className="max-w-3xl mx-auto flex gap-3 pointer-events-auto">
                    <button
                        onClick={() => openModal("cash_in")}
                        className="flex-1 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/25"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        CASH IN
                    </button>
                    <button
                        onClick={() => openModal("cash_out")}
                        className="flex-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/25"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                        CASH OUT
                    </button>
                </div>
            </div>

            {/* Add Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto">
                        <div className={`p-5 flex justify-between items-center ${entryType === "cash_in" ? "bg-green-600" : "bg-red-600"}`}>
                            <h3 className="font-bold text-lg text-white">
                                {entryType === "cash_in" ? "Cash In" : "Cash Out"} Entry
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddEntry} className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Amount (₹) *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-lg">₹</span>
                                    <input
                                        type="number" required min="0.01" step="0.01"
                                        value={amount} onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100 font-bold text-xl"
                                        placeholder="0.00" autoFocus
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Date</label>
                                <input
                                    type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)}
                                    max={new Date().toISOString().split("T")[0]}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Payment Mode</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Cash", "Online", "Bank Transfer"].map(m => (
                                        <button key={m} type="button" onClick={() => setPaymentMode(m)}
                                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${paymentMode === m ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-indigo-400"}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Remark / Note</label>
                                <textarea
                                    value={remark} onChange={e => setRemark(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none h-20 text-sm"
                                    placeholder="What is this for?"
                                />
                            </div>
                            <button
                                type="submit" disabled={formLoading}
                                className={`w-full py-3.5 rounded-xl font-bold tracking-wide transition-colors disabled:opacity-50 text-white ${entryType === "cash_in" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"}`}
                            >
                                {formLoading ? "Saving..." : `Save ${entryType === "cash_in" ? "Cash In" : "Cash Out"}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Entry Confirm */}
            {deleteEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Delete Entry?</h3>
                                <p className="text-sm text-neutral-500">This cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3 mb-5">
                            {deleteEntry.type === "cash_in" ? "+" : "-"}₹{Number(deleteEntry.amount).toLocaleString("en-IN")} · {deleteEntry.remark || "No remark"}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteEntry(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Cancel</button>
                            <button onClick={handleDeleteEntry} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-5 bg-indigo-600 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-white">Generate Report</h3>
                                <p className="text-indigo-200 text-xs mt-0.5">For: <span className="text-white font-semibold">{book.name}</span></p>
                            </div>
                            <button onClick={() => setShowReportModal(false)} className="text-white/70 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                            <div className="p-3 text-center"><p className="text-xs text-neutral-500 mb-0.5">Total In</p><p className="font-bold text-green-600 dark:text-green-500 text-sm">₹{Number(book.total_in).toLocaleString("en-IN")}</p></div>
                            <div className="p-3 text-center"><p className="text-xs text-neutral-500 mb-0.5">Total Out</p><p className="font-bold text-red-600 dark:text-red-400 text-sm">₹{Number(book.total_out).toLocaleString("en-IN")}</p></div>
                            <div className="p-3 text-center"><p className="text-xs text-neutral-500 mb-0.5">Net</p><p className={`font-bold text-sm ${Number(book.net_balance) >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600"}`}>₹{Number(book.net_balance).toLocaleString("en-IN")}</p></div>
                        </div>
                        <div className="p-5">
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Select Report Type</p>
                            <div className="space-y-2 mb-5">
                                {[
                                    { value: "all_entries", label: "All Entries Report", desc: "Every transaction with full details" },
                                    { value: "day_wise", label: "Day-wise Summary", desc: "Daily totals of Cash In, Out & Net" },
                                    { value: "payment_mode", label: "Payment Mode Summary", desc: "Breakdown by Cash, Online & Bank" },
                                ].map(opt => (
                                    <button key={opt.value} onClick={() => setReportType(opt.value)}
                                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${reportType === opt.value ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`}>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${reportType === opt.value ? "border-indigo-600" : "border-neutral-400"}`}>
                                            {reportType === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${reportType === opt.value ? "text-indigo-700 dark:text-indigo-400" : "text-neutral-800 dark:text-neutral-200"}`}>{opt.label}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <button onClick={handleDownloadExcel} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    GENERATE EXCEL (.xlsx)
                                </button>
                                <button onClick={handleDownloadPDF} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    GENERATE PDF
                                </button>
                                <button onClick={handleDownloadCSV} className="w-full flex items-center justify-center gap-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 py-3 rounded-xl font-semibold text-sm transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    DOWNLOAD CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookDetails;
