import pool from "../config/db.js";

export const createBook = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;

        const result = await pool.query(
            "INSERT INTO books (name, created_by) VALUES ($1, $2) RETURNING *",
            [name, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBooks = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Aggregate net balance, total in, total out per book
        const result = await pool.query(`
            SELECT b.*, 
                   COALESCE(SUM(CASE WHEN e.type = 'cash_in' THEN e.amount ELSE 0 END), 0) AS total_in,
                   COALESCE(SUM(CASE WHEN e.type = 'cash_out' THEN e.amount ELSE 0 END), 0) AS total_out,
                   COALESCE(SUM(CASE WHEN e.type = 'cash_in' THEN e.amount ELSE -e.amount END), 0) AS net_balance
            FROM books b
            LEFT JOIN book_entries e ON b.id = e.book_id
            WHERE b.created_by = $1
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const result = await pool.query(`
            SELECT b.*, 
                   COALESCE(SUM(CASE WHEN e.type = 'cash_in' THEN e.amount ELSE 0 END), 0) AS total_in,
                   COALESCE(SUM(CASE WHEN e.type = 'cash_out' THEN e.amount ELSE 0 END), 0) AS total_out,
                   COALESCE(SUM(CASE WHEN e.type = 'cash_in' THEN e.amount ELSE -e.amount END), 0) AS net_balance
            FROM books b
            LEFT JOIN book_entries e ON b.id = e.book_id
            WHERE b.id = $1 AND b.created_by = $2
            GROUP BY b.id
        `, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, payment_mode, remark, date } = req.body;
        const userId = req.userId;

        // Verify book ownership
        const bookCheck = await pool.query("SELECT * FROM books WHERE id = $1 AND created_by = $2", [id, userId]);
        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        const result = await pool.query(
            `INSERT INTO book_entries (book_id, amount, type, payment_mode, remark, created_by, date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id, amount, type, payment_mode || 'Cash', remark, userId, date || new Date()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getEntries = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verify book ownership
        const bookCheck = await pool.query("SELECT * FROM books WHERE id = $1 AND created_by = $2", [id, userId]);
        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        const result = await pool.query(
            `SELECT e.*, u.name as created_by_name 
             FROM book_entries e
             LEFT JOIN users u ON e.created_by = u.id
             WHERE e.book_id = $1 
             ORDER BY e.date DESC, e.created_at DESC`,
            [id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const check = await pool.query("SELECT * FROM books WHERE id = $1 AND created_by = $2", [id, userId]);
        if (check.rows.length === 0) return res.status(404).json({ error: "Book not found" });
        await pool.query("DELETE FROM books WHERE id = $1", [id]);
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEntry = async (req, res) => {
    try {
        const { id, entryId } = req.params;
        const userId = req.userId;
        // Verify book ownership first
        const bookCheck = await pool.query("SELECT * FROM books WHERE id = $1 AND created_by = $2", [id, userId]);
        if (bookCheck.rows.length === 0) return res.status(404).json({ error: "Book not found" });
        await pool.query("DELETE FROM book_entries WHERE id = $1 AND book_id = $2", [entryId, id]);
        res.json({ message: "Entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.userId;
        const check = await pool.query("SELECT * FROM books WHERE id = $1 AND created_by = $2", [id, userId]);
        if (check.rows.length === 0) return res.status(404).json({ error: "Book not found" });
        const result = await pool.query(
            "UPDATE books SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
