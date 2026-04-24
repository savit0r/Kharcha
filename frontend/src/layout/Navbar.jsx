import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL } from "../api";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const getPageTitle = () => {
        if (location.pathname.startsWith("/books/")) return "Book Details";
        if (location.pathname === "/books") return "My Books";
        return "HisabFlow";
    };

    const handleLogout = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                console.error("Logout request failed:", res.status);
            }
            navigate("/?login=true", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex flex-shrink-0 items-center justify-between px-6 z-10 transition-colors">
            <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{getPageTitle()}</h1>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    aria-label="Toggle theme"
                    title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                >
                    {theme === "dark" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    title="Logout"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;