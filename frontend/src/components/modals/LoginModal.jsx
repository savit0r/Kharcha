import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function LoginModal({ onClose, onSwitchToRegister }) {
    const [mode, setMode] = useState("password"); // "password" or "otp"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in (optional in modal, but kept for parity if desired)
    // Actually, skipping the useEffect here to avoid unexpected navigations while on the landing page.

    // Password login
    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api"}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                // Rate limiter or non-JSON response
                toast.error(res.status === 429
                    ? "Too many login attempts. Please try again later."
                    : "Unexpected server response. Please try again.");
                return;
            }

            if (res.ok) {
                toast.success(data.message || "Login successful");
                onClose();
                navigate("/books");
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch {
            toast.error("Something went wrong. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    // Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api"}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "login" }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                toast.error(res.status === 429
                    ? "Too many OTP requests. Please try again later."
                    : "Unexpected server response. Please try again.");
                return;
            }

            if (res.ok) {
                setOtpSent(true);
                toast.success(data.message || "OTP sent to your email");
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch {
            toast.error("Something went wrong. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api"}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, otp, type: "login" }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                toast.error(res.status === 429
                    ? "Too many verification attempts. Please try again later."
                    : "Unexpected server response. Please try again.");
                return;
            }

            if (res.ok) {
                toast.success(data.message || "OTP Verified Successfully");
                onClose();
                navigate("/books");
            } else {
                toast.error(data.message || "Verification failed");
            }
        } catch {
            toast.error("Something went wrong. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity overflow-y-auto">
            {/* Modal backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <div className="bg-slate-800 border border-slate-700/50 p-10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden backdrop-blur-sm z-10 m-auto mt-10 mb-10">
                <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
                <h2 className="text-3xl font-bold mb-8 text-center tracking-tight text-white">Welcome Back</h2>

                {/* Mode toggle */}
                <div className="flex bg-slate-700/30 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => { setMode("password"); setOtpSent(false); }}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "password" ? "bg-slate-600 text-white shadow-sm border border-slate-500/50" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => { setMode("otp"); }}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "otp" ? "bg-slate-600 text-white shadow-sm border border-slate-500/50" : "text-slate-400 hover:text-slate-200"}`}
                    >
                        OTP Code
                    </button>
                </div>

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
                            onClick={() => { setOtpSent(false); setOtp(""); }}
                            className="text-sm text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors py-2"
                        >
                            Use a different email / Resend Code
                        </button>
                    </form>
                )}

                <p className="text-sm text-center mt-8 text-slate-400">
                    Don't have an account?{" "}
                    <button type="button" onClick={onSwitchToRegister} className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors">Register</button>
                </p>
            </div>
        </div>
    );
}

export default LoginModal;
