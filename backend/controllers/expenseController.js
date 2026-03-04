import pool from "../config/db.js";

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = async (req, res) => {
    try {
        const { title, amount, type, category_id, date } = req.body;

        if (!title || !amount || !type) {
            return res.status(400).json({ message: "Title, amount, and type are required" });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
        }

        const result = await pool.query(
            `INSERT INTO transactions (user_id, title, amount, type, category_id, date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.userId, title, amount, type, category_id || null, date || new Date()]
        );

        let isOverBudget = false;

        // Check if this expense pushed us over the budget limit
        if (type === "expense" && category_id) {
            // Get current month spend + this new transaction
            const spendRes = await pool.query(
                `SELECT SUM(amount) as total_spend 
                 FROM transactions 
                 WHERE user_id = $1 AND category_id = $2 AND type = 'expense'
                 AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE)`,
                [req.userId, category_id]
            );

            const budgetRes = await pool.query(
                `SELECT monthly_limit FROM budgets WHERE user_id = $1 AND category_id = $2`,
                [req.userId, category_id]
            );

            if (budgetRes.rows.length > 0) {
                const totalSpend = parseFloat(spendRes.rows[0].total_spend || 0);
                const limit = parseFloat(budgetRes.rows[0].monthly_limit);
                if (totalSpend > limit) {
                    isOverBudget = true;
                }
            }
        }

        res.status(201).json({
            message: "Transaction added",
            transaction: result.rows[0],
            warning: isOverBudget ? "Over Budget" : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get transactions with filters
// @route   GET /api/transactions?type=&category=&search=&startDate=&endDate=
// @access  Private
export const getTransactions = async (req, res) => {
    try {
        const { type, category, search, startDate, endDate } = req.query;

        let query = `
            SELECT t.*, c.name AS category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
        `;
        const params = [req.userId];
        let paramIndex = 2;

        // Type filter
        if (type && ["income", "expense"].includes(type)) {
            query += ` AND t.type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        // Category filter
        if (category) {
            query += ` AND t.category_id = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        // Search filter (title)
        if (search) {
            query += ` AND t.title ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Date range filter
        if (startDate) {
            query += ` AND t.date >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += ` AND t.date <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        query += " ORDER BY t.date DESC, t.created_at DESC";

        const result = await pool.query(query, params);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await pool.query(
            "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
            [id, req.userId]
        );

        if (transaction.rows.length === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        await pool.query("DELETE FROM transactions WHERE id = $1", [id]);

        res.status(200).json({ message: "Transaction deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
