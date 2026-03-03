import pool from "../config/db.js";

// @desc    Get dashboard summary (totals, monthly trend, category breakdown)
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Totals
        const totalsResult = await pool.query(
            `SELECT type, COALESCE(SUM(amount), 0) AS total
             FROM transactions
             WHERE user_id = $1
             GROUP BY type`,
            [userId]
        );

        const totals = { income: 0, expense: 0, balance: 0 };
        for (const row of totalsResult.rows) {
            totals[row.type] = parseFloat(row.total);
        }
        totals.balance = totals.income - totals.expense;

        // 2. Monthly trend (last 6 months)
        const monthlyResult = await pool.query(
            `SELECT
                TO_CHAR(date, 'YYYY-MM') AS month,
                type,
                COALESCE(SUM(amount), 0) AS total
             FROM transactions
             WHERE user_id = $1
               AND date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
             GROUP BY month, type
             ORDER BY month ASC`,
            [userId]
        );

        // Build a map: { "2026-01": { income: 0, expense: 0 } }
        const monthMap = {};
        for (const row of monthlyResult.rows) {
            if (!monthMap[row.month]) {
                monthMap[row.month] = { month: row.month, income: 0, expense: 0 };
            }
            monthMap[row.month][row.type] = parseFloat(row.total);
        }
        const monthlyTrend = Object.values(monthMap);

        // 3. Category summary
        const categoryResult = await pool.query(
            `SELECT
                COALESCE(c.name, 'Uncategorized') AS category_name,
                t.type,
                SUM(t.amount) AS total
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = $1
             GROUP BY c.name, t.type
             ORDER BY total DESC`,
            [userId]
        );

        const categorySummary = categoryResult.rows.map((r) => ({
            category_name: r.category_name,
            type: r.type,
            total: parseFloat(r.total),
        }));

        res.status(200).json({ totals, monthlyTrend, categorySummary });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
