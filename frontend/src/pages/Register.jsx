import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if already logged in
        fetch(`${import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api"}/auth/me`, {
            credentials: "include"
        })
            .then(res => {
                if (res.ok) navigate("/books");
            })
            .catch(() => {});
    }, [navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api"}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Account created successfully!");
                setTimeout(() => navigate("/login"), 1500);
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch {
            toast.error("Something went wrong. Is the server running?");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200 p-4 selection:bg-indigo-500/30">
            <div className="bg-slate-800 border border-slate-700/50 p-10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
                <h2 className="text-3xl font-bold mb-8 text-center tracking-tight text-white">Create Account</h2>

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
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
