function LedgerEntriesList({ entries, customerName }) {
    return (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-900/50 flex justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <span>Entries</span>
            </div>
            {entries.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                    No transactions recorded with {customerName} yet.
                </div>
            ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
                    {entries.map((entry) => (
                        <div key={entry.id} className="p-5 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-700/20 transition-colors">
                            <div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                                    {new Date(entry.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                                <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                                    {entry.note || (entry.type === 'credit' ? 'Money Given' : 'Money Received')}
                                </p>
                            </div>
                            <div className={`font-bold ${entry.type === 'credit' ? 'text-red-500' : 'text-green-500'}`}>
                                {entry.type === 'credit' ? '-' : '+'}₹{parseFloat(entry.amount).toLocaleString("en-IN")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LedgerEntriesList;
