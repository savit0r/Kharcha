import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000/api";

function AddExpense() {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState("");
    const [warning, setWarning] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Recurring state
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringFrequency, setRecurringFrequency] = useState("monthly");

    // Custom category state
    const [showCustom, setShowCustom] = useState(false);
    const [customName, setCustomName] = useState("");

    // Receipt state
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);

    const navigate = useNavigate();

    // Fetch categories
    useEffect(() => {
        fetch(`${API}/categories`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(console.error);
    }, []);

    // Filter categories by selected type
    const filteredCategories = categories.filter((c) => c.type === type);

    // Reset category when type changes
    useEffect(() => {
        setCategoryId("");
    }, [type]);

    // Add custom category
    const handleAddCustom = async () => {
        if (!customName.trim()) return;

        try {
            const res = await fetch(`${API}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: customName.trim(), type }),
            });

            const data = await res.json();

            if (res.ok) {
                setCategories([...categories, data.category]);
                setCategoryId(data.category.id);
                setCustomName("");
                setShowCustom(false);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to add category");
        }
    };

    // Submit transaction
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setWarning("");
        setError("");
        setLoading(true);

        try {
            let receipt_url = null;

            // 1. Upload receipt if exists
            if (receiptFile) {
                const formData = new FormData();
                formData.append("receipt", receiptFile);

                const uploadRes = await fetch(`${API}/upload`, {
                    method: "POST",
                    credentials: "include",
                    body: formData
                });

                const uploadData = await uploadRes.json();

                if (uploadRes.ok) {
                    receipt_url = uploadData.filePath;
                } else {
                    throw new Error(uploadData.message || "Failed to upload receipt");
                }
            }

            // 2. Submit transaction data
            const res = await fetch(`${API}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    amount: parseFloat(amount),
                    type,
                    category_id: categoryId || null,
                    date,
                    receipt_url,
                    is_recurring: isRecurring,
                    recurring_frequency: isRecurring ? recurringFrequency : null
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.warning) {
                    setWarning(`Expense added, but you are ${data.warning}!`);
                } else {
                    setMessage(`${type === "income" ? "Income" : "Expense"} added!`);
                }
                setTitle("");
                setAmount("");
                setCategoryId("");
                setIsRecurring(false);
                setRecurringFrequency("monthly");
                setDate(new Date().toISOString().split("T")[0]);
                setReceiptFile(null);
                setReceiptPreview(null);
                setTimeout(() => {
                    setMessage("");
                    setWarning("");
                }, 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File is too large (max 5MB)");
                return;
            }
            setReceiptFile(file);
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="max-w-xl mx-auto pb-10">
            <h2 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-neutral-100 tracking-tight text-center">Add Transaction</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-2xl shadow-sm w-full flex flex-col gap-6 transition-colors duration-300">
                {message && <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-sm text-center font-medium shadow-sm">{message}</div>}
                {warning && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm text-center font-medium shadow-sm flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>{warning}</div>}
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm text-center font-medium shadow-sm">{error}</div>}

                {/* Type Toggle */}
                <div className="flex bg-neutral-100 dark:bg-neutral-700/50 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setType("expense")}
                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${type === "expense" ? "bg-white text-red-600 dark:bg-red-500/20 dark:text-red-400 shadow-sm border border-neutral-200 dark:border-red-500/20" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"}`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType("income")}
                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${type === "income" ? "bg-white text-green-600 dark:bg-green-500/20 dark:text-green-400 shadow-sm border border-neutral-200 dark:border-green-500/20" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"}`}
                    >
                        Income
                    </button>
                </div>

                <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Title</label>
                    <input
                        type="text"
                        placeholder="E.g. Groceries"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-3 w-full text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">₹</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-xl pl-8 pr-4 py-3 w-full text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                </div>

                {/* Category dropdown + custom */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">Category</label>
                        <button
                            type="button"
                            onClick={() => setShowCustom(!showCustom)}
                            className="text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Category
                        </button>
                    </div>
                    <div className="relative">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-3 w-full text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none appearance-none pr-10"
                        >
                            <option value="">Select Category</option>
                            {filteredCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-neutral-500 dark:text-neutral-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {showCustom && (
                    <div className="flex gap-2 bg-neutral-50 dark:bg-neutral-700/30 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700/50">
                        <input
                            type="text"
                            placeholder="New category name"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-2 w-full text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustom}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Save
                        </button>
                    </div>
                )}

                <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-3 w-full text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none dark:[color-scheme:dark]"
                    />
                </div>

                {/* Recurring Checkbox */}
                <div className="bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-700/50 p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="peer w-5 h-5 appearance-none border-2 border-neutral-300 dark:border-neutral-500 rounded text-indigo-600 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-all"
                            />
                            <svg className="absolute w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Set as recurring transaction</span>
                    </label>

                    {isRecurring && (
                        <div className="mt-4 pl-8">
                            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-2">Frequency</label>
                            <div className="relative">
                                <select
                                    value={recurringFrequency}
                                    onChange={(e) => setRecurringFrequency(e.target.value)}
                                    className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-2.5 w-full text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none appearance-none pr-10 text-sm"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-neutral-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Receipt Upload */}
                <div>
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Receipt (Optional)</label>

                    <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 dark:border-neutral-600 border-dashed rounded-xl cursor-pointer bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors ${receiptPreview ? 'border-indigo-500' : ''}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {receiptPreview ? (
                                    <div className="relative">
                                        <img src={receiptPreview} alt="Receipt preview" className="h-24 object-contain rounded" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs font-bold">Change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-8 h-8 mb-3 text-neutral-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400"><span className="font-semibold">Click to upload</span></p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">PNG, JPG or JPEG (MAX 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Saving..." : "Save Transaction"}
                </button>
            </form>
        </div>
    );
}

export default AddExpense;
