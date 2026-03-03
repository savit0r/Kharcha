function TransactionTable({ loading, transactions, hasActiveFilters, clearFilters, onDelete }) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 dark:border-neutral-600 border-t-indigo-500"></div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Loading transactions…</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                <p className="text-neutral-900 dark:text-neutral-300 text-lg font-medium">No expenses found</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm">
                    {hasActiveFilters
                        ? "Try adjusting your filters or search terms."
                        : "Start by adding your first transaction."}
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="mt-4 text-sm bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600/50 px-5 py-2.5 rounded-xl transition-all font-medium focus:ring-2 focus:ring-neutral-500/50 focus:outline-none"
                    >
                        Reset Filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-x-auto transition-colors duration-300">
            <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-300">
                    <tr>
                        <th className="text-left px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider text-xs">Date</th>
                        <th className="text-left px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider text-xs">Title</th>
                        <th className="text-left px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider text-xs">Category</th>
                        <th className="text-left px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider text-xs">Type</th>
                        <th className="text-right px-6 py-4 text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider text-xs">Amount</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/50 uppercase-x">
                    {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors group">
                            <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                {new Date(t.date).toLocaleDateString("en-IN", {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </td>
                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{t.title}</td>
                            <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                                <span className="bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-full text-xs border border-neutral-200 dark:border-neutral-600">
                                    {t.category_name || "—"}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${t.type === "income"
                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                                    : "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                    }`}>
                                    {t.type}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                }`}>
                                {t.type === "income" ? "+" : "-"}₹{parseFloat(t.amount).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onDelete(t.id)}
                                    className="text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                                    title="Delete Transaction"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionTable;
