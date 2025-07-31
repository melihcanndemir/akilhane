import { NextResponse } from 'next/server';
import { initializeDatabase, checkDatabaseHealth } from '@/lib/database/connection';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Initialize database
    initializeDatabase();

    // Check database health
    const isHealthy = await checkDatabaseHealth();

    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'Database initialized successfully',
        status: 'healthy',
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Check database health
    const isHealthy = await checkDatabaseHealth();

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      },
      { status: isHealthy ? 200 : 503 },
    );
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Database health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
