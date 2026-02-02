import { NextRequest } from 'next/server';
import { dbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const client = await dbPool.connect();
    await client.query('SELECT NOW()');
    client.release();

    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}