import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || 'postgresql://localhost:5432/dummy';

// Create PostgreSQL connection with better error handling
let client: any;
let db: any;

try {
  client = postgres(connectionString, {
    max: 10, // Maximum connections in pool
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
  
  // Create Drizzle instance
  db = drizzle(client, { schema });
} catch (error) {
  console.warn('⚠️ Database connection could not be established (build time)', error);
  // Create a dummy client for build time
  client = null;
  db = null;
}

export { db };

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  if (!client) return false;
  try {
    await client`SELECT 1`;
    console.log('✅ Database connection is healthy');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Initialize database (create tables if needed)
export async function initializeDatabase() {
  if (!client) return;
  try {
    // Check if tables exist by querying one
    await client`SELECT 1 FROM users LIMIT 1`;
    console.log('✅ Database tables already exist');
  } catch (error) {
    console.log('📦 Database tables not found, they will be created via Supabase migrations');
  }
}

// Close database connection (for cleanup)
export async function closeDatabase() {
  if (client) {
    await client.end();
  }
}

// Test connection
export async function testConnection() {
  if (!client) return false;
  try {
    const result = await client`SELECT version()`;
    console.log('✅ Connected to PostgreSQL:', result[0].version);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    return false;
  }
} 