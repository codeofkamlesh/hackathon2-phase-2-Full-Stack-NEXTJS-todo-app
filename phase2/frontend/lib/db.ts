import { Pool } from 'pg';

// Create a database connection pool with optimized settings for Neon
export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon DB
  },
  // Connection pool settings for serverless/development
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '5'), // Increase slightly for production
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout after 5 seconds
  keepAlive: true, // Enable keep-alive for persistent connections
});

// Test the connection
export const testConnection = async () => {
  try {
    const client = await dbPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Initialize tables if they don't exist (Better Auth should do this, but we'll verify)
export const initializeTables = async () => {
  try {
    const client = await dbPool.connect();

    // Check if users table exists (Better Auth should create this)
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    if (!result.rows[0].exists) {
      console.log('Better Auth tables do not exist, attempting to initialize...');
      // Better Auth should create tables automatically, but we'll log this for debugging
    }

    client.release();
  } catch (error) {
    console.error('Error checking/initializing tables:', error);
    throw error;
  }
};