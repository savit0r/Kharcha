import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <div className="w-64 hidden md:flex bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex-col flex-shrink-0 h-screen transition-all duration-300">
            <div className="p-6 h-16 flex items-center border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 bg-clip-text">Spendora</h2>
            </div>

            <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
                {[
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/add-expense", label: "Add Expense" },
                    { path: "/analytics", label: "Analytics" },
                    { path: "/budgets", label: "Budgets" },
                    { path: "/customers", label: "Ledger" }
                ].map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

export default Sidebar;