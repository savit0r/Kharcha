import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const alterTables = async () => {
    try {
        console.log("Adding missing columns...");

        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'owner' CHECK (role IN ('owner', 'staff'));
            
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(1024);
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly'));
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS last_processed_date DATE;

            ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(1024);
        `);

        console.log("Columns added successfully");
    } catch (error) {
        console.error("Error altering tables:", error.message);
    } finally {
        await pool.end();
        process.exit();
    }
};

alterTables();
