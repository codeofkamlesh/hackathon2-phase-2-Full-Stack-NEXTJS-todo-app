import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

// Optimized Pool Configuration for Neon DB with proper SSL settings
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon DB
    },
    // Optimized settings for serverless environments
    max: 10, // Maximum number of connections in the pool
    min: 0,  // Minimum number of connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Timeout after 10 seconds
    maxUses: 750, // Close connections after 750 uses to prevent memory leaks
    keepAlive: true, // Send periodic TCP keepalive packets
});

export const auth = betterAuth({
    database: pool,
    emailAndPassword: {
        enabled: true,
    },
    plugins: [nextCookies()],
    secret: process.env.BETTER_AUTH_SECRET,
});