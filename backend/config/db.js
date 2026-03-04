import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,                       // max connections in pool
    idleTimeoutMillis: 30000,      // close idle connections after 30s
});

// Prevent app crash on unexpected errors
pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

// Graceful shutdown — close all connections before exiting
const shutdown = async () => {
    console.log("Closing database pool...");
    await pool.end();
    process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default pool;
