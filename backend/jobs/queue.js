import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const USE_REDIS = process.env.REDIS_URL && process.env.REDIS_URL !== "false";

let connection = null;
let emailQueue = null;
let reportQueue = null;
let recurringTransactionQueue = null;

if (USE_REDIS) {
    // Create a robust Redis connection
    connection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            if (times > 5) {
                console.error("[Redis] Could not connect to Redis. Disabling background jobs.");
                return null; // Stop retrying
            }
            return delay;
        }
    });

    connection.on("error", (err) => {
        // Suppress spammy connection errors
        if (err.code !== 'ECONNREFUSED') {
            console.error(`[Redis Error]: ${err.message}`);
        }
    });

    connection.on("ready", () => {
        console.log("[Redis] Connected successfully.");
    });

    // Initialize queues
    emailQueue = new Queue("emailQueue", { connection });
    reportQueue = new Queue("reportQueue", { connection });
    recurringTransactionQueue = new Queue("recurringTransactionQueue", { connection });
} else {
    console.log("[Redis] REDIS_URL not provided. Background jobs will run synchronously or be ignored.");

    // Mock queues for synchronous fallback where possible
    const mockQueue = {
        add: async (name, data) => {
            console.log(`[Mock Queue] Job ${name} added (ignoring since Redis is disabled)`);
            return { id: Date.now() };
        }
    };

    emailQueue = mockQueue;
    reportQueue = mockQueue;
    recurringTransactionQueue = mockQueue;
}

export { connection, emailQueue, reportQueue, recurringTransactionQueue, USE_REDIS };
