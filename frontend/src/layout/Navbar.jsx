import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/dashboard": return "Dashboard";
            case "/add-expense": return "Add Expense";
            case "/analytics": return "Analytics";
            default: return "Kharcha";
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="h-16 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-700 flex flex-shrink-0 items-center justify-between px-6 z-10 transition-colors duration-300">
            <h1 className="text-xl font-medium tracking-wide text-neutral-900 dark:text-neutral-100">{getPageTitle()}</h1>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors duration-300"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
                <button
                    onClick={handleLogout}
                    className="bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-600/50 transition-colors focus:ring-2 focus:ring-neutral-500/50 focus:outline-none"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;