import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

// Password validation rules — must mirror backend authValidation.js
const PASSWORD_RULES = [
    { id: "length",    label: "At least 8 characters",           test: (p) => p.length >= 8 },
    { id: "uppercase", label: "One uppercase letter (A-Z)",       test: (p) => /[A-Z]/.test(p) },
    { id: "lowercase", label: "One lowercase letter (a-z)",       test: (p) => /[a-z]/.test(p) },
    { id: "digit",     label: "One number (0-9)",                 test: (p) => /[0-9]/.test(p) },
    { id: "special",   label: "One special character (@$!%*?&#)", test: (p) => /[@$!%*?&#^_\-+=]/.test(p) },
];

function PasswordChecklist({ password }) {
    if (!password) return null;
    return (
        <ul className="mt-2 space-y-1 text-xs pl-1">
            {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                    <li key={rule.id} className={`flex items-center gap-2 transition-colors duration-200 ${passed ? "text-emerald-400" : "text-slate-500"}`}>
                        <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${passed ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500"}`}>
                            {passed ? "✓" : "✗"}
                        </span>
                        {rule.label}
                    </li>
                );
            })}
        </ul>
    );
}

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    useEffect(() => {
        // Redirect if already logged in
        fetch(`${import.meta.env.VITE_API_URL || "https://kharcha-4u5y.onrender.com/api"}/auth/me`, {
            credentials: "include"
        })
            .then((res) => { if (res.ok) navigate("/books"); })
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

        setLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                }
            );
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Account created successfully!");
                setTimeout(() => navigate("/login"), 1500);
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch {
            toast.error("Something went wrong. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200 p-4 selection:bg-indigo-500/30">
            <div className="bg-slate-800 border border-slate-700/50 p-10 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden backdrop-blur-sm">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>

                <h1 className="text-3xl font-bold mb-2 text-center tracking-tight text-white">Create Account</h1>
                <p className="text-slate-400 text-sm text-center mb-8">Join Spendora and take control of your finances</p>

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Full Name</label>
                        <input
                            type="text"
                            id="register-name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            id="register-email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="register-password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all outline-none pr-12"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Strength checklist */}
                        <PasswordChecklist password={password} />

                        {/* Strength bar */}
                        {password.length > 0 && (
                            <div className="mt-3">
                                <div className="flex gap-1">
                                    {PASSWORD_RULES.map((rule, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                rule.test(password)
                                                    ? i < 2 ? "bg-red-400" : i < 4 ? "bg-yellow-400" : "bg-emerald-400"
                                                    : "bg-slate-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs mt-1 text-slate-500">
                                    {PASSWORD_RULES.filter((r) => r.test(password)).length === 5
                                        ? <span className="text-emerald-400">Strong password ✓</span>
                                        : PASSWORD_RULES.filter((r) => r.test(password)).length >= 3
                                        ? <span className="text-yellow-400">Moderate — add more complexity</span>
                                        : <span className="text-red-400">Weak password</span>
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                id="register-confirm-password"
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`bg-slate-800/50 border rounded-xl px-4 py-3 w-full text-slate-200 placeholder-slate-500 focus:ring-2 transition-all outline-none pr-12 ${
                                    confirmPassword.length > 0
                                        ? passwordsMatch
                                            ? "border-emerald-500/50 focus:ring-emerald-500/30"
                                            : "border-red-500/50 focus:ring-red-500/30"
                                        : "border-slate-600 focus:ring-indigo-500/50 focus:border-indigo-500/30"
                                }`}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirm ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="text-xs text-red-400 mt-1.5 ml-1">Passwords do not match</p>
                        )}
                        {confirmPassword.length > 0 && passwordsMatch && (
                            <p className="text-xs text-emerald-400 mt-1.5 ml-1">Passwords match ✓</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        id="register-submit"
                        disabled={loading || !allRulesPassed || !passwordsMatch}
                        className="mt-2 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Creating account…
                            </span>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="text-sm text-center mt-8 text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
