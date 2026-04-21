import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const API = `${import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api"}/books`;

function Cashbooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editBook, setEditBook] = useState(null); // { id, name } for renaming
    const [deleteConfirm, setDeleteConfirm] = useState(null); // book id to confirm delete
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#4f46e5");
    const [isArchived, setIsArchived] = useState(false);

    // UI state
    const [activeTab, setActiveTab] = useState("active"); // "active" | "archived"
    const [formLoading, setFormLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [openMenu, setOpenMenu] = useState(null);
    const menuRef = useRef(null);

    const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#64748b"];

    const fetchBooks = async () => {
        try {
            const res = await fetch(API, { credentials: "include" });
            const data = await res.json();
            if (Array.isArray(data)) setBooks(data);
            else if (!res.ok) toast.error("Session expired. Please login again.");
        } catch {
            toast.error("Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    // Close context menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleAddBook = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setFormLoading(true);
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: name.trim(), description: description.trim(), color }),
            });
            const data = await res.json();
            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchBooks();
                toast.success(`"${name.trim()}" created!`);
            } else {
                toast.error(data.error || "Failed to create book");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setFormLoading(false);
        }
    };

    const handleRename = async (e) => {
        e.preventDefault();
        if (!name.trim() || !editBook) return;
        setFormLoading(true);
        try {
            const res = await fetch(`${API}/${editBook.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: name.trim(), description: description.trim(), color, is_archived: isArchived }),
            });
            if (res.ok) {
                setEditBook(null);
                resetForm();
                fetchBooks();
                toast.success("Book updated successfully!");
            } else {
                toast.error("Failed to update book");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleArchive = async (book) => {
        try {
            const res = await fetch(`${API}/${book.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_archived: !book.is_archived }),
            });
            if (res.ok) {
                fetchBooks();
                toast.success(book.is_archived ? "Book unarchived" : "Book archived");
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setColor("#4f46e5");
        setIsArchived(false);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                setDeleteConfirm(null);
                fetchBooks();
                toast.success("Book deleted");
            } else {
                toast.error("Failed to delete book");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const searchedBooks = books.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

    // Filter active vs archived
    const activeBooks = searchedBooks.filter(b => !b.is_archived);
    const archivedBooks = searchedBooks.filter(b => b.is_archived);

    const displayBooks = activeTab === "active" ? activeBooks : archivedBooks;

    const totalIn = displayBooks.reduce((acc, b) => acc + Number(b.total_in), 0);
    const totalOut = displayBooks.reduce((acc, b) => acc + Number(b.total_out), 0);
    const totalNet = displayBooks.reduce((acc, b) => acc + Number(b.net_balance), 0);

    return (
        <div className="max-w-3xl mx-auto pb-16 px-1">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6 pt-1">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Books</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">{displayBooks.length} book{displayBooks.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                    onClick={() => { setEditBook(null); resetForm(); setShowModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/25 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    New Book
                </button>
            </div>

            {/* Overall Summary */}
            {!loading && books.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 mb-1 font-medium">Total In</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-500">₹{totalIn.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 mb-1 font-medium">Total Out</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">₹{totalOut.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 mb-1 font-medium">Net Balance</p>
                        <p className={`text-lg font-bold ${totalNet >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-400"}`}>
                            ₹{totalNet.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Tabs */}
            {!loading && books.length > 0 && (
                <div className="space-y-4 mb-5">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
                        />
                    </div>
                    {/* Active/Archived Tabs */}
                    <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-full sm:w-auto self-start">
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`flex-1 sm:px-6 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "active" ? "bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                }`}
                        >
                            Active ({activeBooks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("archived")}
                            className={`flex-1 sm:px-6 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === "archived" ? "bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                }`}
                        >
                            Archived ({archivedBooks.length})
                        </button>
                    </div>
                </div>
            )}

            {/* Books List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
                            </div>
                            <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : displayBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-5">
                        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    {search ? (
                        <p className="text-neutral-500">No books matching "<strong>{search}</strong>"</p>
                    ) : activeTab === "archived" ? (
                        <p className="text-neutral-500">No archived books</p>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No books yet</h3>
                            <p className="text-neutral-500 text-sm mb-5">Create your first book to start tracking transactions</p>
                            <button
                                onClick={() => { setEditBook(null); resetForm(); setShowModal(true); }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                            >
                                Create First Book
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-3 relative z-0">
                    {displayBooks.map((b) => (
                        <div key={b.id} className={`group relative bg-white dark:bg-neutral-800 border ${b.is_archived ? 'border-neutral-200 dark:border-neutral-700 opacity-75' : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-700'} rounded-2xl hover:shadow-md transition-all duration-200`}>
                            <Link to={`/books/${b.id}`} className="flex items-center gap-4 p-4 pr-12">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                                    style={{ backgroundColor: b.color || '#4f46e5' }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-2">
                                        {b.name}
                                        {b.is_archived && <span className="text-[10px] bg-neutral-100 dark:bg-neutral-700 text-neutral-500 px-1.5 py-0.5 rounded font-bold uppercase">Archived</span>}
                                    </h3>
                                    {b.description && <p className="text-xs text-neutral-500 truncate mt-0.5">{b.description}</p>}
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-green-600 dark:text-green-500 font-medium">+₹{Number(b.total_in).toLocaleString("en-IN")}</span>
                                        <span className="text-xs text-neutral-300 dark:text-neutral-600">·</span>
                                        <span className="text-xs text-red-500 dark:text-red-400 font-medium">-₹{Number(b.total_out).toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                                <div className="text-right mr-2 my-auto">
                                    <span className={`font-bold text-base ${Number(b.net_balance) >= 0 ? "text-green-600 dark:text-green-500" : "text-red-500"}`}>
                                        ₹{Number(b.net_balance).toLocaleString("en-IN")}
                                    </span>
                                    <p className="text-xs text-neutral-400 font-medium">Net</p>
                                </div>
                            </Link>
                            {/* Kebab menu - added z-10 so it's clickable and dropdown appears above the list */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10" ref={openMenu === b.id ? menuRef : null}>
                                <button
                                    onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === b.id ? null : b.id); }}
                                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                                </button>
                                {openMenu === b.id && (
                                    <div className="absolute right-0 top-10 w-40 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl py-1.5">
                                        <button
                                            onClick={() => { setEditBook(b); setName(b.name); setDescription(b.description || ""); setColor(b.color || "#4f46e5"); setIsArchived(b.is_archived); setOpenMenu(null); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={() => { handleToggleArchive(b); setOpenMenu(null); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                            {b.is_archived ? "Unarchive" : "Archive"}
                                        </button>
                                        <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1"></div>
                                        <button
                                            onClick={() => { setDeleteConfirm(b); setOpenMenu(null); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Rename Book Modal */}
            {(showModal || editBook) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="p-5 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                                {editBook ? "Edit Book" : "Create New Book"}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); setEditBook(null); resetForm(); }}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={editBook ? handleRename : handleAddBook} className="p-5 flex flex-col gap-5">
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5 uppercase tracking-wide">Book Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-all font-medium"
                                    placeholder="e.g. Office Expenses, Goa Trip 2025"
                                    autoFocus
                                    maxLength={60}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5 uppercase tracking-wide">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-all text-sm"
                                    placeholder="Brief details about this book..."
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-2 uppercase tracking-wide">Theme Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-neutral-800' : 'hover:scale-105'} shadow-sm`}
                                            style={{ backgroundColor: c }}
                                        >
                                            {color === c && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={formLoading || !name.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 mt-2 rounded-xl font-bold tracking-wide transition-colors shadow-md shadow-indigo-600/20"
                            >
                                {formLoading ? "Saving..." : (editBook ? "Save Changes" : "Create Book")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Delete Book?</h3>
                                <p className="text-sm text-neutral-500">This will remove all entries too</p>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3">
                            "<strong>{deleteConfirm.name}</strong>" and all its entries will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cashbooks;
