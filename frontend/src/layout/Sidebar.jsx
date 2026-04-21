import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Sidebar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/me`, {
                    credentials: "include"
                });
                if (res.ok) setUser(await res.json());
            } catch {
                console.error("Failed to fetch user");
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/logout`, {
                method: "POST", credentials: "include",
            });
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItems = [
        {
            path: "/books",
            label: "Books",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
    ];

    return (
        <div className="w-60 hidden md:flex bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex-col flex-shrink-0 h-screen">
            {/* Logo */}
            <div className="h-16 flex items-center px-5 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">HisabFlow</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100"
                            }`
                        }
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                {user ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex flex-shrink-0 items-center justify-center font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Logout"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="animate-pulse flex items-center gap-3 p-2">
                        <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                            <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;