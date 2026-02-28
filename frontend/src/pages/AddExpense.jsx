import { useState } from "react";

function AddExpense() {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add actual expense creation logic
        console.log({ title, amount, category });
        setTitle("");
        setAmount("");
        setCategory("");
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Expense Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2"
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2"
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Add Expense
                </button>
            </form>
        </div>
    );
}

export default AddExpense;
