import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const API = "http://localhost:3000/api/ledger";

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${API}/customers`, { credentials: "include" });
            const data = await res.json();
            if (Array.isArray(data)) setCustomers(data);
        } catch (error) {
            toast.error("Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const res = await fetch(`${API}/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, phone }),
            });
            const data = await res.json();

            if (res.ok) {
                setShowModal(false);
                setName("");
                setPhone("");
                fetchCustomers();
                toast.success("Customer added successfully!");
            } else {
                toast.error(data.message || "Failed to add customer");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setFormLoading(false);
        }
    };

    const netOwings = customers.reduce((acc, c) => acc + c.net_balance, 0);

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Ledger</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Track money given and received</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Customer
                </button>
            </div>

            {/* Overall Balance Summary Card */}
            {!loading && customers.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm p-6 mb-8 flex justify-between items-center transition-colors">
                    <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Net Balance Overview</p>
                        <h3 className={`text-2xl font-bold mt-1 ${netOwings > 0 ? "text-green-600 dark:text-green-400" : netOwings < 0 ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-100"}`}>
                            {netOwings > 0 ? `You will get ₹${Math.abs(netOwings).toLocaleString("en-IN")}` : netOwings < 0 ? `You will give ₹${Math.abs(netOwings).toLocaleString("en-IN")}` : "Settled"}
                        </h3>
                    </div>
                </div>
            )}

            {/* Customer List */}
            {loading ? (
                <div className="flex justify-center items-center py-20 min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 dark:border-neutral-600 border-t-indigo-500"></div>
                </div>
            ) : customers.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm p-12 text-center transition-colors">
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">You haven't added any customers to your ledger yet.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 transition-colors"
                    >
                        + Add your first customer
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden transition-colors">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
                        {customers.map((c) => (
                            <Link
                                to={`/customers/${c.id}`}
                                key={c.id}
                                className="block p-4 sm:p-5 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg">
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">{c.name}</h3>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{c.phone || "No phone number"}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {c.net_balance > 0 ? (
                                            <div>
                                                <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">You will get</p>
                                                <span className="text-green-600 dark:text-green-400 font-bold">₹{Math.abs(c.net_balance).toLocaleString("en-IN")}</span>
                                            </div>
                                        ) : c.net_balance < 0 ? (
                                            <div>
                                                <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">You will give</p>
                                                <span className="text-red-600 dark:text-red-400 font-bold">₹{Math.abs(c.net_balance).toLocaleString("en-IN")}</span>
                                            </div>
                                        ) : (
                                            <span className="text-neutral-500 dark:text-neutral-400 font-medium text-sm border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 rounded-lg">Settled</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Customer Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-5 border-b border-neutral-100 dark:border-neutral-700/50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">Add Customer</h3>
                            <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddCustomer} className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100"
                                    placeholder="Enter customer name"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-neutral-100"
                                    placeholder="Mobile number"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium tracking-wide transition-colors disabled:opacity-50"
                            >
                                {formLoading ? "Adding..." : "Save Customer"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customers;
