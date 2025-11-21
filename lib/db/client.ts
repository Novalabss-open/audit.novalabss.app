import { Pool } from 'pg';
import { readFileSync } from 'fs';
import path from 'path';

// Schema file path
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'db', 'schema.sql');

/**
 * PostgreSQL connection pool configuration
 */
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 2000, // timeout when establishing connection
};

/**
 * Initialize PostgreSQL database
 * Creates tables and runs schema if needed
 */
async function initializeDatabase(pool: Pool): Promise<void> {
  try {
    // Read and execute schema
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    await pool.query(schema);

    if (process.env.NODE_ENV === 'development') {
      console.log('✓ PostgreSQL database schema initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// Singleton pool instance
let poolInstance: Pool | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Get database pool instance (singleton)
 * Initializes on first call
 */
export async function getPool(): Promise<Pool> {
  if (!poolInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    poolInstance = new Pool(poolConfig);

    // Handle pool errors
    poolInstance.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });

    // Initialize schema only once
    if (!initPromise) {
      initPromise = initializeDatabase(poolInstance);
    }
    await initPromise;
  }

  return poolInstance;
}

/**
 * Execute a query with the pool
 * Helper function for common queries
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = await getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Execute a query that returns a single row
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Close database connection pool
 * Useful for testing and cleanup
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    initPromise = null;
  }
}
