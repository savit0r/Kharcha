import { useState, useEffect } from "react";

function LedgerEntryModal({ isOpen, onClose, onSubmit, entryType, customerName, error, formLoading }) {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        if (isOpen) {
            setAmount("");
            setNote("");
            setDate(new Date().toISOString().split("T")[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ amount: parseFloat(amount), type: entryType, note, date });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className={`p-5 text-center ${entryType === 'credit' ? 'bg-red-50 dark:bg-red-500/10' : 'bg-green-50 dark:bg-green-500/10'}`}>
                    <h3 className={`font-bold text-lg ${entryType === 'credit' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {entryType === 'credit' ? `You Gave ${customerName}` : `You Got from ${customerName}`}
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
                    {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">₹</span>
                        <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100 font-bold"
                            placeholder="Amount"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">Details (Optional)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100"
                            placeholder="Item name, bill no, etc."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100 dark:[color-scheme:dark]"
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 py-3 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formLoading}
                            className={`flex-1 text-white py-3 rounded-xl font-medium tracking-wide transition-colors disabled:opacity-50 ${entryType === 'credit' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {formLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LedgerEntryModal;
