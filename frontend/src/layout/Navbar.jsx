function Navbar() {
    return (
        <div className="h-16 bg-white shadow flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold">Expense Tracker</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Logout
            </button>
        </div>
    );
}

export default Navbar;