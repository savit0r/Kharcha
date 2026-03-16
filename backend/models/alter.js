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

            -- Add new book tracking columns
            ALTER TABLE books ADD COLUMN IF NOT EXISTS description VARCHAR(255);
            ALTER TABLE books ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#4f46e5';
            ALTER TABLE books ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

            -- Drop old ledger tables
            DROP TABLE IF EXISTS ledger_entries CASCADE;
            DROP TABLE IF EXISTS customers CASCADE;
        `);

        console.log("Columns added successfully");
    } catch (error) {
        console.error("Error altering tables:", error);
    } finally {
        await pool.end();
        process.exit();
    }
};

alterTables();
