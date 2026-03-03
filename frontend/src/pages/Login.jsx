import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const [mode, setMode] = useState("password"); // "password" or "otp"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Password login
    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                navigate("/dashboard");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    // Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setOtpSent(true);
                setMessage(data.message);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                navigate("/dashboard");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    // Switch modes
    const toggleMode = () => {
        setMode(mode === "password" ? "otp" : "password");
        setError("");
        setMessage("");
        setOtpSent(false);
        setOtp("");
        setPassword("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200 p-4 selection:bg-indigo-500/30">
            <div className="bg-slate-800 border border-slate-700/50 p-10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
                <h2 className="text-3xl font-bold mb-8 text-center tracking-tight text-white">Welcome Back</h2>

                {/* Mode toggle */}
                <div className="flex bg-slate-700/30 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => { setMode("password"); setError(""); setMessage(""); setOtpSent(false); }}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "password" ? "bg-slate-600 text-white shadow-sm border border-slate-500/50" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => { setMode("otp"); setError(""); setMessage(""); }}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "otp" ? "bg-slate-600 text-white shadow-sm border border-slate-500/50" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        OTP Code
                    </button>
                </div>

                {message && <p className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg text-sm mb-6 text-center">{message}</p>}
                {error && <p className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-lg text-sm mb-6 text-center">{error}</p>}

                {/* Password Login Form */}
                {mode === "password" && (
                    <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                )}

                {/* OTP Login Form */}
                {mode === "otp" && !otpSent && (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending Code..." : "Send Verification Code"}
                        </button>
                    </form>
                )}

                {mode === "otp" && otpSent && (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                        <p className="text-sm text-slate-400 text-center mb-2">Code sent to <span className="text-slate-200">{email}</span></p>
                        <input
                            type="text"
                            placeholder="••••••"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-4 w-full text-center text-3xl tracking-[0.4em] text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none font-mono"
                            maxLength={6}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify & Sign In"}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(""); setError(""); setMessage(""); }}
                            className="text-sm text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors py-2"
                        >
                            Use a different email / Resend Code
                        </button>
                    </form>
                )}

                <p className="text-sm text-center mt-8 text-slate-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
