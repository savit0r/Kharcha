import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setTimeout(() => navigate("/login"), 1500);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong. Is the server running?");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200 p-4 selection:bg-indigo-500/30">
            <div className="bg-slate-800 border border-slate-700/50 p-10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
                <h2 className="text-3xl font-bold mb-8 text-center tracking-tight text-white">Create Account</h2>

                {message && <p className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg text-sm mb-6 text-center">{message}</p>}
                {error && <p className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-lg text-sm mb-6 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-2 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 font-medium tracking-wide transition-all"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-sm text-center mt-8 text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
