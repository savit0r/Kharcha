import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-indigo-500/30 transition-colors duration-300 flex flex-col overflow-hidden relative">

            {/* Background decorative blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-400/10 dark:bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

            {/* Navbar */}
            <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-300">
                        Spendora
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                    <Link to="/login" className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        Log in
                    </Link>
                    <Link to="/register" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2.5 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex items-center justify-center">
                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Copy */}
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Smart Finance Tracker
                        </div>

                        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 leading-[1.1]">
                            Take control of <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                                your money.
                            </span>
                        </h1>

                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-xl leading-relaxed">
                            Effortlessly track expenses, manage granular budgets, and maintain personal ledgers with your friends—all in one beautiful place.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link to="/register" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 text-lg">
                                Start Tracking Free
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                            <Link to="/login" className="flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 px-8 py-4 rounded-xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm hover:shadow text-lg">
                                Sign In
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-neutral-400 dark:text-neutral-500 font-medium text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>No Credit Card</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>100% Free Core</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>Secure</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Illustration */}
                    <div className="relative w-full aspect-square max-w-[550px] mx-auto lg:mr-0 xl:scale-110">
                        {/* Glow Behind SVG */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 rounded-full blur-3xl transform scale-75"></div>

                        {/* SVG Illustration */}
                        <svg className="w-full h-full drop-shadow-2xl relative z-10" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Dashboard Backdrop */}
                            <rect x="50" y="80" width="400" height="280" rx="16" fill="currentColor" className="text-white dark:text-neutral-800" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
                            {/* Dashboard Header */}
                            <path d="M50 96C50 87.1634 57.1634 80 66 80H434C442.837 80 450 87.1634 450 96V120H50V96Z" fill="currentColor" className="text-neutral-50 dark:text-neutral-900" />
                            <circle cx="70" cy="100" r="4" fill="#ef4444" />
                            <circle cx="85" cy="100" r="4" fill="#eab308" />
                            <circle cx="100" cy="100" r="4" fill="#22c55e" />

                            {/* Main Graph Area */}
                            <rect x="70" y="140" width="220" height="130" rx="8" fill="currentColor" className="text-neutral-50 dark:text-neutral-900" />
                            {/* Graph bars */}
                            <rect x="90" y="210" width="20" height="40" rx="4" fill="#6366f1" />
                            <rect x="130" y="170" width="20" height="80" rx="4" fill="#22c55e" />
                            <rect x="170" y="220" width="20" height="30" rx="4" fill="#ef4444" />
                            <rect x="210" y="150" width="20" height="100" rx="4" fill="#6366f1" />
                            <rect x="250" y="180" width="20" height="70" rx="4" fill="#06b6d4" />

                            {/* Donut Chart Component */}
                            <rect x="310" y="140" width="120" height="130" rx="8" fill="currentColor" className="text-neutral-50 dark:text-neutral-900" />
                            <circle cx="370" cy="205" r="35" stroke="#3b82f6" strokeWidth="12" strokeDasharray="160 50" strokeLinecap="round" fill="none" transform="rotate(-90 370 205)" />
                            <circle cx="370" cy="205" r="35" stroke="#f43f5e" strokeWidth="12" strokeDasharray="50 160" strokeLinecap="round" fill="none" transform="rotate(70 370 205)" />
                            <circle cx="370" cy="205" r="35" stroke="#10b981" strokeWidth="12" strokeDasharray="40 170" strokeLinecap="round" fill="none" transform="rotate(180 370 205)" />

                            {/* Transactions Layout Below */}
                            <rect x="70" y="290" width="360" height="20" rx="4" fill="currentColor" className="text-neutral-100 dark:text-neutral-700/50" />
                            <rect x="70" y="320" width="360" height="20" rx="4" fill="currentColor" className="text-neutral-100 dark:text-neutral-700/50" />

                            {/* Floating Mobile Element */}
                            <g className="animate-[bounce_6s_ease-in-out_infinite] transform-gpu origin-center">
                                <rect x="300" y="230" width="160" height="250" rx="24" fill="currentColor" className="text-white dark:text-neutral-800 border-neutral-100 dark:border-neutral-700" stroke="#cbd5e1" strokeWidth="2" style={{ filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' }} />
                                <rect x="310" y="240" width="140" height="30" rx="8" fill="#6366f1" className="opacity-90" />
                                <circle cx="380" cy="320" r="40" fill="url(#grad2)" />
                                <path d="M380 300C380 300 395 315 395 320C395 328.284 388.284 335 380 335C371.716 335 365 328.284 365 320C365 315 380 300 380 300Z" fill="white" className="opacity-90" />
                                <rect x="320" y="380" width="120" height="15" rx="4" fill="#22c55e" className="opacity-80" />
                                <rect x="320" y="405" width="120" height="15" rx="4" fill="#ef4444" className="opacity-80" />
                                <rect x="320" y="430" width="120" height="15" rx="4" fill="#eab308" className="opacity-80" />
                            </g>

                            {/* Floating Card Element */}
                            <g className="animate-[bounce_8s_ease-in-out_infinite_reverse] transform-gpu origin-center">
                                <rect x="10" y="260" width="180" height="110" rx="16" fill="url(#grad1)" style={{ filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.2))' }} transform="rotate(-15 100 315)" />
                                <rect x="30" y="290" width="40" height="25" rx="4" fill="white" className="opacity-70" transform="rotate(-15 100 315)" />
                                <path d="M120 330L160 330" stroke="white" strokeWidth="6" strokeLinecap="round" transform="rotate(-15 100 315)" className="opacity-50" />
                                <path d="M120 350L140 350" stroke="white" strokeWidth="6" strokeLinecap="round" transform="rotate(-15 100 315)" className="opacity-50" />
                            </g>

                            {/* Definitions for Gradients */}
                            <defs>
                                <linearGradient id="grad1" x1="10" y1="260" x2="190" y2="370" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="grad2" x1="340" y1="280" x2="420" y2="360" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#10b981" />
                                    <stop offset="1" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Landing;
