function SummaryCards({ totalIncome, totalExpense }) {
    const balance = totalIncome - totalExpense;

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-2 w-full">
            <div className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Total Income</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{totalIncome.toFixed(2)}</p>
            </div>
            <div className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Total Expense</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">₹{totalExpense.toFixed(2)}</p>
            </div>
            <div className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Balance</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">₹{balance.toFixed(2)}</p>
            </div>
        </div>
    );
}

export default SummaryCards;
