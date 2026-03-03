import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { useTheme } from "../context/ThemeContext";

function MonthlyTrendChart({ data }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const textColor = isDark ? "#a1a1aa" : "#52525b"; // neutral-400 or neutral-500
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm py-8">No data yet</p>
            </div>
        );
    }

    const labels = data.map((d) => {
        const [year, month] = d.month.split("-");
        return new Date(year, month - 1).toLocaleString("default", {
            month: "short",
            year: "2-digit",
        });
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: "Income",
                data: data.map((d) => d.income),
                backgroundColor: "rgba(34, 197, 94, 0.7)",
                borderColor: "rgb(34, 197, 94)",
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: "Expense",
                data: data.map((d) => d.expense),
                backgroundColor: "rgba(239, 68, 68, 0.7)",
                borderColor: "rgb(239, 68, 68)",
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        color: textColor,
        plugins: {
            legend: {
                position: "top",
                labels: { color: textColor }
            },
            title: { display: false },
        },
        scales: {
            x: {
                grid: { color: gridColor },
                ticks: { color: textColor }
            },
            y: {
                beginAtZero: true,
                grid: { color: gridColor },
                ticks: {
                    color: textColor,
                    callback: (val) => "₹" + val.toLocaleString("en-IN"),
                },
            },
        },
    };

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-sm font-semibold mb-4 text-neutral-600 dark:text-neutral-300 tracking-tight flex-shrink-0">Monthly Trend</h3>
            <div className="flex-1 w-full relative min-h-[220px]">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}

export default MonthlyTrendChart;
