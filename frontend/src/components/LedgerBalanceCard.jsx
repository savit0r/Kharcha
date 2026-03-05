function LedgerBalanceCard({ netBalance }) {
    return (
        <div className={`p-6 rounded-2xl shadow-sm mb-6 border ${netBalance > 0 ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50" : netBalance < 0 ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50" : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"}`}>
            <div className="flex justify-between items-center text-center">
                <div className="w-full">
                    <p className={`text-sm font-medium mb-1 ${netBalance > 0 ? 'text-green-700 dark:text-green-500' : netBalance < 0 ? 'text-red-700 dark:text-red-500' : 'text-neutral-500'}`}>
                        {netBalance > 0 ? "You will get" : netBalance < 0 ? "You will give" : "Net Balance Settled"}
                    </p>
                    <h3 className={`text-4xl font-bold tracking-tight ${netBalance > 0 ? "text-green-600 dark:text-green-400" : netBalance < 0 ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-100"}`}>
                        ₹{Math.abs(netBalance).toLocaleString("en-IN")}
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default LedgerBalanceCard;
