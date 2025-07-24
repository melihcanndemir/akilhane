import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

// Database file path
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/exam-training.db' 
  : './exam-training.db';

// Create SQLite database instance with error handling
let sqlite: Database;

try {
  sqlite = new Database(dbPath);
  
  // Enable WAL mode for better performance
  sqlite.pragma('journal_mode = WAL');
  
  console.log('✅ Database connection established');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  throw error;
}

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Migration function
export function runMigrations() {
  try {
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
}

// Initialize database tables
export function initializeDatabase() {
  try {
    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question_count INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_by TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        text TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL,
        formula TEXT,
        created_by TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS quiz_results (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        time_spent INTEGER NOT NULL,
        weak_topics TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS performance_analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        average_score REAL NOT NULL,
        total_tests INTEGER NOT NULL,
        average_time_spent REAL NOT NULL,
        weak_topics TEXT NOT NULL,
        last_updated INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS ai_recommendations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        recommended_difficulty TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS flashcard_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        card_id TEXT NOT NULL,
        is_known INTEGER NOT NULL DEFAULT 0,
        review_count INTEGER NOT NULL DEFAULT 0,
        last_reviewed INTEGER,
        next_review INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects (name);
      CREATE INDEX IF NOT EXISTS idx_subjects_category ON subjects (category);
      CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects (is_active);
      CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions (subject_id);
      CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions (subject);
      CREATE INDEX IF NOT EXISTS idx_quiz_results_user_subject ON quiz_results (user_id, subject);
      CREATE INDEX IF NOT EXISTS idx_performance_analytics_user_subject ON performance_analytics (user_id, subject);
      CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_subject ON ai_recommendations (user_id, subject);
      CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_subject ON flashcard_progress (user_id, subject);
    `);
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Close database connection
export function closeDatabase() {
  sqlite.close();
}

// Database health check
export function checkDatabaseHealth(): boolean {
  try {
    const result = sqlite.prepare('SELECT 1').get();
    return result !== null;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
} 