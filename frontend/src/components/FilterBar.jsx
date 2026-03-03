function FilterBar({
    search, setSearch,
    typeFilter, setTypeFilter,
    categoryFilter, setCategoryFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    categories,
    hasActiveFilters,
    clearFilters,
}) {
    return (
        <div className="bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-5 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-4 items-end backdrop-blur z-10 relative">
            <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 ">Search</label>
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 w-full text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 ">Type</label>
                <div className="relative">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none appearance-none pr-10 min-w-[120px]"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-neutral-500 dark:text-neutral-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 ">Category</label>
                <div className="relative">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none appearance-none pr-10 min-w-[140px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-neutral-500 dark:text-neutral-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 ">From</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none dark:[color-scheme:dark]"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 ">To</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none dark:[color-scheme:dark]"
                />
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="text-sm bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-600/50 text-neutral-600 dark:text-neutral-300 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium focus:ring-2 focus:ring-neutral-500/50 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reset
                </button>
            )}
        </div>
    );
}

export default FilterBar;
