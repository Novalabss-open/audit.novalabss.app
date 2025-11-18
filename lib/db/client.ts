import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import path from 'path';

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

// Schema file path
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'db', 'schema.sql');

/**
 * Initialize SQLite database
 * Creates database file and runs schema if needed
 */
function initializeDatabase(): Database.Database {
  // Create database connection
  const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Read and execute schema
  try {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }

  return db;
}

// Singleton database instance
let dbInstance: Database.Database | null = null;

/**
 * Get database instance (singleton)
 * Initializes on first call
 */
export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

/**
 * Close database connection
 * Useful for testing and cleanup
 */
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Export db instance as default
export default getDb();
