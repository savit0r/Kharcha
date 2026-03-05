import pool from "../config/db.js";

// @desc    Add a new customer
// @route   POST /api/ledger/customers
// @access  Private
export const addCustomer = async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Customer name is required" });
        }

        const result = await pool.query(
            "INSERT INTO customers (user_id, name, phone) VALUES ($1, $2, $3) RETURNING *",
            [req.userId, name, phone || null]
        );

        res.status(201).json({
            message: "Customer added successfully",
            customer: result.rows[0],
        });
    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all customers with running balances
// @route   GET /api/ledger/customers
// @access  Private
export const getCustomers = async (req, res) => {
    try {
        // Calculate net balance (credit - debit)
        // credit: You give money to customer (they owe you -> positive balance)
        // debit: You get money from customer (you owe them -> negative balance)
        const query = `
            SELECT 
                c.id, c.name, c.phone, c.created_at,
                COALESCE(SUM(CASE WHEN l.type = 'credit' THEN l.amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN l.type = 'debit' THEN l.amount ELSE 0 END), 0) as net_balance
            FROM customers c
            LEFT JOIN ledger_entries l ON c.id = l.customer_id
            WHERE c.user_id = $1
            GROUP BY c.id, c.name, c.phone, c.created_at
            ORDER BY c.name;
        `;

        const result = await pool.query(query, [req.userId]);

        const formatted = result.rows.map(row => ({
            ...row,
            net_balance: parseFloat(row.net_balance)
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Add a ledger entry (give/receive)
// @route   POST /api/ledger/customers/:id/entries
// @access  Private
export const addLedgerEntry = async (req, res) => {
    try {
        const customerId = req.params.id;
        const { amount, type, note, date } = req.body;

        if (!amount || !type) {
            return res.status(400).json({ message: "Amount and type are required" });
        }

        if (type !== 'credit' && type !== 'debit') {
            return res.status(400).json({ message: "Type must be 'credit' or 'debit'" });
        }

        // Verify customer belongs to user
        const customerCheck = await pool.query(
            "SELECT id FROM customers WHERE id = $1 AND user_id = $2",
            [customerId, req.userId]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const result = await pool.query(
            "INSERT INTO ledger_entries (customer_id, amount, type, note, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [customerId, amount, type, note || null, date || new Date()]
        );

        res.status(201).json({
            message: "Entry added successfully",
            entry: result.rows[0],
        });
    } catch (error) {
        console.error("Error adding ledger entry:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get ledger entries for a customer
// @route   GET /api/ledger/customers/:id/entries
// @access  Private
export const getLedgerByCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;

        // Verify customer exists and belongs to user
        const customerCheck = await pool.query(
            "SELECT * FROM customers WHERE id = $1 AND user_id = $2",
            [customerId, req.userId]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const customer = customerCheck.rows[0];

        // Fetch entries
        const entriesQuery = await pool.query(
            "SELECT * FROM ledger_entries WHERE customer_id = $1 ORDER BY date DESC, created_at DESC",
            [customerId]
        );

        // Calculate net balance
        const balanceQuery = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as net_balance
            FROM ledger_entries
            WHERE customer_id = $1
        `, [customerId]);

        res.status(200).json({
            customer,
            net_balance: parseFloat(balanceQuery.rows[0].net_balance),
            entries: entriesQuery.rows
        });
    } catch (error) {
        console.error("Error fetching ledger entries:", error);
        res.status(500).json({ message: "Server error" });
    }
};
