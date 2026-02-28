import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <div className="w-64 bg-white shadow-md p-5">
            <h2 className="text-2xl font-bold mb-8">Kharcha</h2>

            <nav className="flex flex-col gap-4">
                <Link to="/dashboard" className="hover:text-blue-600">
                    Dashboard
                </Link>
                <Link to="/add-expense" className="hover:text-blue-600">
                    Add Expense
                </Link>
                <Link to="/analytics" className="hover:text-blue-600">
                    Analytics
                </Link>
            </nav>
        </div>
    );
}

export default Sidebar;