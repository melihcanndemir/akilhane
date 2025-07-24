import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, checkDatabaseHealth } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    // Initialize database
    initializeDatabase();
    
    // Check database health
    const isHealthy = checkDatabaseHealth();
    
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Database initialized successfully',
        status: 'healthy'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check database health
    const isHealthy = checkDatabaseHealth();
    
    return NextResponse.json(
      { 
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error('❌ Database health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Database health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
} 