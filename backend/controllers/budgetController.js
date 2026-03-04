import pool from "../config/db.js";

// @desc    Get budgets and their current month spending
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id as category_id,
                c.name as category_name,
                c.type,
                b.monthly_limit,
                COALESCE(SUM(t.amount), 0) as current_spend
            FROM categories c
            LEFT JOIN budgets b ON c.id = b.category_id AND b.user_id = $1
            LEFT JOIN transactions t ON c.id = t.category_id 
                AND t.user_id = $1 
                AND t.type = 'expense'
                AND date_trunc('month', t.date) = date_trunc('month', CURRENT_DATE)
            WHERE (c.user_id = $1 OR c.is_default = true) AND c.type = 'expense'
            GROUP BY c.id, c.name, c.type, b.monthly_limit
            ORDER BY c.name;
        `;

        const result = await pool.query(query, [req.userId]);

        // Format to distinguish set budgets vs unset ones
        const formattedBudgets = result.rows.map(row => ({
            ...row,
            monthly_limit: row.monthly_limit ? parseFloat(row.monthly_limit) : null,
            current_spend: parseFloat(row.current_spend),
            over_budget: row.monthly_limit ? parseFloat(row.current_spend) > parseFloat(row.monthly_limit) : false
        }));

        res.status(200).json(formattedBudgets);
    } catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Set or update a budget limit
// @route   POST /api/budgets
// @access  Private
export const setBudget = async (req, res) => {
    try {
        const { category_id, monthly_limit } = req.body;

        if (!category_id || monthly_limit === undefined) {
            return res.status(400).json({ message: "Category ID and monthly limit are required" });
        }

        const numericLimit = parseFloat(monthly_limit);
        if (numericLimit < 0) {
            return res.status(400).json({ message: "Monthly limit cannot be negative" });
        }

        // Upsert budget
        const result = await pool.query(
            `INSERT INTO budgets (user_id, category_id, monthly_limit)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, category_id) 
             DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit, created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [req.userId, category_id, numericLimit]
        );

        res.status(200).json({
            message: "Budget successfully updated",
            budget: result.rows[0],
        });
    } catch (error) {
        console.error("Error setting budget:", error);
        res.status(500).json({ message: "Server error" });
    }
};
