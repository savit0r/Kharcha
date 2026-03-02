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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Kharcha</h2>

                {/* Mode toggle */}
                <div className="flex mb-6 border rounded overflow-hidden">
                    <button
                        onClick={() => { setMode("password"); setError(""); setMessage(""); setOtpSent(false); }}
                        className={`flex-1 py-2 text-sm font-medium ${mode === "password" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600"}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => { setMode("otp"); setError(""); setMessage(""); }}
                        className={`flex-1 py-2 text-sm font-medium ${mode === "otp" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600"}`}
                    >
                        OTP
                    </button>
                </div>

                {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

                {/* Password Login Form */}
                {mode === "password" && (
                    <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                )}

                {/* OTP Login Form */}
                {mode === "otp" && !otpSent && (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {mode === "otp" && otpSent && (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                        <p className="text-sm text-gray-600 text-center">OTP sent to <strong>{email}</strong></p>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2 text-center text-lg tracking-widest"
                            maxLength={6}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(""); setError(""); setMessage(""); }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                <p className="text-sm text-center mt-4 text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
