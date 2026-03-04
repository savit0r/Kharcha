import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS otps (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp_hash VARCHAR(255) NOT NULL,
                attempts INT DEFAULT 0,
                max_attempts INT DEFAULT 5,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
                is_default BOOLEAN DEFAULT false
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category_id INT REFERENCES categories(id) ON DELETE SET NULL,
                title VARCHAR(255) NOT NULL,
                amount DECIMAL(12, 2) NOT NULL,
                type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS budgets (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
                monthly_limit DECIMAL(12, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, category_id)
            );
        `);

        // Seed default categories (only if none exist)
        const existing = await pool.query(
            "SELECT COUNT(*) FROM categories WHERE is_default = true"
        );

        if (parseInt(existing.rows[0].count) === 0) {
            const defaults = [
                // Expense categories
                ['Food & Dining', 'expense'],
                ['Transport', 'expense'],
                ['Shopping', 'expense'],
                ['Bills & Utilities', 'expense'],
                ['Entertainment', 'expense'],
                ['Health', 'expense'],
                ['Education', 'expense'],
                ['Rent', 'expense'],
                ['Other Expense', 'expense'],
                // Income categories
                ['Salary', 'income'],
                ['Freelance', 'income'],
                ['Investment', 'income'],
                ['Business', 'income'],
                ['Other Income', 'income'],
            ];

            for (const [name, type] of defaults) {
                await pool.query(
                    "INSERT INTO categories (name, type, is_default, user_id) VALUES ($1, $2, true, NULL)",
                    [name, type]
                );
            }
            console.log("Default categories seeded");
        }

        console.log("Tables created successfully");
    } catch (error) {
        console.error("Error creating tables:", error.message);
    } finally {
        await pool.end();
        process.exit();
    }
};

createTables();
