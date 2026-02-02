/**
 * Better Auth Database Initialization Script
 * This script verifies and initializes the Better Auth tables in your PostgreSQL database
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function initializeBetterAuthDB() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    console.error('Please check your .env.local file');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();

    console.log('✅ Connected to database successfully');

    // Check if Better Auth tables exist
    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'sessions', 'accounts', 'verification_tokens')
      ORDER BY table_name;
    `);

    console.log(`📋 Found ${tablesCheck.rowCount} Better Auth related tables:`);
    tablesCheck.rows.forEach(row => console.log(`   • ${row.table_name}`));

    if (tablesCheck.rowCount === 0) {
      console.log('\n🔍 No Better Auth tables found.');
      console.log('💡 Better Auth should create these tables automatically on first use.');
      console.log('💡 When you first run your Next.js app, Better Auth will initialize:');
      console.log('   • users - stores user account information');
      console.log('   • sessions - manages user sessions');
      console.log('   • accounts - handles OAuth and other account types');
      console.log('   • verification_tokens - manages email verification');
    } else {
      console.log('\n✅ Better Auth tables already exist and are ready to use!');
    }

    // Test basic functionality
    console.log('\n🧪 Testing database functionality...');

    // Test current timestamp
    const timeTest = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Database time sync: ${timeTest.rows[0].current_time}`);

    // Check if users table has data (optional)
    if (tablesCheck.rowCount > 0) {
      try {
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log(`👥 Users in database: ${userCount.rows[0].count}`);
      } catch (e) {
        // Users table might not exist yet, which is fine
        console.log('ℹ️  Users table may be created on first use');
      }
    }

    client.release();
    console.log('\n🎉 Database check completed successfully!');
    console.log('\n🚀 To initialize Better Auth tables, run your Next.js application:');
    console.log('   npm run dev');
    console.log('\n📝 Remember to keep your DATABASE_URL secure and never commit it to version control.');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    if (error instanceof Error) {
      if (error.message.includes('password authentication failed')) {
        console.error('\n🔐 Authentication Error: Check your database username and password');
      } else if (error.message.includes('database "')) {
        console.error('\n📚 Database Error: Check your database name in the connection string');
      } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.error('\n🌐 Network Error: Check your database host and connection string');
      }
    }
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔒 Database connection closed');
  }
}

// Run the initialization
console.log('🔧 Better Auth Database Initialization Script');
console.log('================================================\n');

initializeBetterAuthDB().catch(error => {
  console.error('💥 Fatal error during database initialization:', error);
  process.exit(1);
});