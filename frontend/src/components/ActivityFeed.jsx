import { useState, useEffect } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/activity`;

function ActivityFeed() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch(`${API}?limit=5`, { credentials: "include" });
                const data = await res.json();
                if (Array.isArray(data)) setActivities(data);
            } catch (error) {
                console.error("Failed to fetch activity logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 h-64 flex justify-center items-center shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 dark:border-neutral-600 border-t-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm overflow-hidden h-full">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-neutral-900 dark:text-neutral-100 tracking-tight">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Recent Activity
            </h3>

            {activities.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm py-4">No recent activity.</p>
            ) : (
                <div className="space-y-4">
                    {activities.map((log) => {
                        // Extract time (e.g. "10:30 AM") and date (e.g. "Today" or "Oct 24")
                        const dateObj = new Date(log.created_at);
                        const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
                        const isToday = new Date().toDateString() === dateObj.toDateString();
                        const dateStr = isToday ? "Today" : dateObj.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' });

                        // Determine icon color based on action type
                        let dotColor = "bg-neutral-300 dark:bg-neutral-600";
                        if (log.action.includes('ADD')) dotColor = "bg-green-500";
                        if (log.action.includes('DELETE')) dotColor = "bg-red-500";
                        if (log.action.includes('UPDATE')) dotColor = "bg-blue-500";
                        if (log.action.includes('LOGIN')) dotColor = "bg-purple-500";

                        return (
                            <div key={log.id} className="relative pl-6 pb-4 border-l border-neutral-100 dark:border-neutral-700/50 last:border-0 last:pb-0 group">
                                <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${dotColor} ring-4 ring-white dark:ring-neutral-800 transition-transform group-hover:scale-125`}></div>
                                <div className="flex justify-between items-start gap-4">
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-tight">
                                        {log.description}
                                    </p>
                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium whitespace-nowrap bg-neutral-50 dark:bg-neutral-900/50 px-2 py-0.5 rounded-sm">
                                        {dateStr}, {timeStr}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ActivityFeed;
