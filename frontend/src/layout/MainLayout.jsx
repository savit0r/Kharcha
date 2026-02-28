import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* Sidebar */}
            <Sidebar />

            {/* Right Side */}
            <div className="flex-1 flex flex-col">

                {/* Top Navbar */}
                <Navbar />

                {/* Page Content */}
                <main className="p-6 flex-1">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

export default MainLayout;