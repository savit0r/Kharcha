import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet, NavLink } from "react-router-dom";

function MainLayout() {
    return (
        <div className="flex min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300">

            {/* Sidebar */}
            <Sidebar />

            {/* Right Side */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Top Navbar */}
                <Navbar />

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto pb-20 md:pb-8">
                    <Outlet />
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex justify-around items-center h-16 px-2 z-50">
                    {[
                        { path: "/books", label: "Books", icon: <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> }
                    ].map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${isActive
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

            </div>
        </div>
    );
}

export default MainLayout;