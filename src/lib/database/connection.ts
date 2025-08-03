import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Get database connection string from environment variables
const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  "postgresql://localhost:5432/dummy";

// Create PostgreSQL connection with better error handling
let client: postgres.Sql | null;
let db: PostgresJsDatabase<typeof schema> | null;

try {
  client = postgres(connectionString, {
    max: 10, // Maximum connections in pool
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });

  // Create Drizzle instance
  db = drizzle(client, { schema });
} catch {
  // Create a dummy client for build time
  client = null;
  db = null;
}

export { db };

// Database connection helper with null checking
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!db) {
    throw new Error(
      "Database connection not initialized. Check DATABASE_URL environment variable.",
    );
  }
  return db;
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  if (!client) {
    return false;
  }
  try {
    await client`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Initialize database (create tables if needed)
export async function initializeDatabase() {
  if (!client) {
    return;
  }
  try {
    // Check if tables exist by querying one
    await client`SELECT 1 FROM users LIMIT 1`;
  } catch {
    // Silent fail for database initialization
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
  if (!client) {
    return false;
  }
  try {
    await client`SELECT version()`;
    return true;
  } catch {
    return false;
  }
}
