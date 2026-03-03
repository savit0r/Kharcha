import pool from "../config/db.js";

// @desc    Get categories (defaults + user's custom)
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM categories WHERE is_default = true OR user_id = $1 ORDER BY is_default DESC, name ASC",
            [req.userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Add custom category
// @route   POST /api/categories
// @access  Private
export const addCategory = async (req, res) => {
    try {
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: "Name and type are required" });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
        }

        // Check if user already has this custom category
        const existing = await pool.query(
            "SELECT id FROM categories WHERE user_id = $1 AND name = $2 AND type = $3",
            [req.userId, name, type]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const result = await pool.query(
            "INSERT INTO categories (user_id, name, type, is_default) VALUES ($1, $2, $3, false) RETURNING *",
            [req.userId, name, type]
        );

        res.status(201).json({
            message: "Category created",
            category: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete custom category (cannot delete defaults)
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await pool.query(
            "SELECT * FROM categories WHERE id = $1",
            [id]
        );

        if (category.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (category.rows[0].is_default) {
            return res.status(403).json({ message: "Cannot delete default categories" });
        }

        if (category.rows[0].user_id !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await pool.query("DELETE FROM categories WHERE id = $1", [id]);

        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
