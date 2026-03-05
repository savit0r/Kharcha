function LedgerActionButtons({ onOpenModal }) {
    return (
        <div className="flex gap-4 mb-8">
            <button
                onClick={() => onOpenModal('credit')}
                className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 py-4 rounded-xl font-bold tracking-wide transition-all uppercase text-sm shadow-sm"
            >
                You Gave ₹
            </button>
            <button
                onClick={() => onOpenModal('debit')}
                className="flex-1 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 py-4 rounded-xl font-bold tracking-wide transition-all uppercase text-sm shadow-sm"
            >
                You Got ₹
            </button>
        </div>
    );
}

export default LedgerActionButtons;
