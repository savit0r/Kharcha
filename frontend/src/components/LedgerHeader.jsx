import { useNavigate } from "react-router-dom";

function LedgerHeader({ customer }) {
    const navigate = useNavigate();

    return (
        <div className="mb-6 flex items-center gap-4">
            <button onClick={() => navigate("/customers")} className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{customer.name}</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{customer.phone || "No phone added"}</p>
            </div>
        </div>
    );
}

export default LedgerHeader;
