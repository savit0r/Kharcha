import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

import { useTheme } from "../context/ThemeContext";

const COLORS = [
    "#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6",
    "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4",
];

function CategoryPieChart({ data }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const textColor = isDark ? "#a1a1aa" : "#52525b"; // neutral-400 or neutral-500
    const borderColor = isDark ? "#171717" : "#ffffff";
    const tooltipBg = isDark ? "rgba(23, 23, 23, 0.9)" : "rgba(255, 255, 255, 0.9)";
    const tooltipText = isDark ? "#f5f5f5" : "#171717";
    const expenseData = data ? data.filter((d) => d.type === "expense") : [];

    if (expenseData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm py-8">No expense data</p>
            </div>
        );
    }

    const chartData = {
        labels: expenseData.map((d) => d.category_name),
        datasets: [
            {
                data: expenseData.map((d) => d.total),
                backgroundColor: expenseData.map((_, i) => COLORS[i % COLORS.length]),
                borderWidth: 2,
                borderColor: borderColor,
                hoverOffset: 4
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        color: textColor,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    color: textColor,
                    boxWidth: 12,
                    padding: 14,
                    font: { size: 12 },
                    generateLabels: (chart) => {
                        const dataset = chart.data.datasets[0];
                        const total = dataset.data.reduce((a, b) => a + b, 0);
                        return chart.data.labels.map((label, i) => {
                            const value = dataset.data[i];
                            const pct = ((value / total) * 100).toFixed(1);
                            return {
                                text: `${label}: ₹${value.toLocaleString("en-IN")} (${pct}%)`,
                                fillStyle: dataset.backgroundColor[i],
                                strokeStyle: dataset.borderColor,
                                lineWidth: dataset.borderWidth,
                                fontColor: textColor,
                                index: i,
                            };
                        });
                    },
                },
            },
            tooltip: {
                backgroundColor: tooltipBg,
                titleColor: tooltipText,
                bodyColor: tooltipText,
                borderColor: "rgba(163, 163, 163, 0.4)", // neutral-400
                borderWidth: 1,
                callbacks: {
                    label: (ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = ((ctx.raw / total) * 100).toFixed(1);
                        return ` ₹${ctx.raw.toLocaleString("en-IN")} (${pct}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-sm font-semibold mb-4 text-neutral-600 dark:text-neutral-300 tracking-tight flex-shrink-0">Expense by Category</h3>
            <div className="flex-1 w-full relative min-h-[220px]">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
}

export default CategoryPieChart;
