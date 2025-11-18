import { getDb } from './client';

export interface User {
  id: number;
  email: string;
  name: string;
  whatsapp: string | null;
  has_website: boolean;
  website_url: string | null;
  created_at: string;
  last_seen: string;
  total_scans: number;
}

export interface CreateUserData {
  email: string;
  name: string;
  whatsapp?: string;
  hasWebsite?: boolean;
  websiteUrl?: string;
}

/**
 * Check if user exists by email
 * Returns user data if found, null otherwise
 */
export function checkUserExists(email: string): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as User | undefined;
  return user || null;
}

/**
 * Create new user
 * Returns user ID
 */
export function createUser(data: CreateUserData): number {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO users (email, name, whatsapp, has_website, website_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.email,
    data.name,
    data.whatsapp || null,
    data.hasWebsite ? 1 : 0,
    data.websiteUrl || null
  );

  return result.lastInsertRowid as number;
}

/**
 * Get user by ID
 */
export function getUserById(id: number): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id) as User | undefined;
  return user || null;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | null {
  return checkUserExists(email);
}

/**
 * Update user's last_seen timestamp
 * Also increments total_scans counter
 */
export function updateLastSeen(userId: number): void {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE users
    SET last_seen = CURRENT_TIMESTAMP,
        total_scans = total_scans + 1
    WHERE id = ?
  `);
  stmt.run(userId);
}

/**
 * Update user information
 */
export function updateUser(
  userId: number,
  data: Partial<Omit<CreateUserData, 'email'>>
): void {
  const db = getDb();

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.whatsapp !== undefined) {
    updates.push('whatsapp = ?');
    values.push(data.whatsapp || null);
  }
  if (data.hasWebsite !== undefined) {
    updates.push('has_website = ?');
    values.push(data.hasWebsite ? 1 : 0);
  }
  if (data.websiteUrl !== undefined) {
    updates.push('website_url = ?');
    values.push(data.websiteUrl || null);
  }

  if (updates.length === 0) return;

  values.push(userId);

  const stmt = db.prepare(`
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = ?
  `);
  stmt.run(...values);
}

/**
 * Get all users (for admin)
 * Returns paginated results
 */
export function getAllUsers(limit = 100, offset = 0): User[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM users
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset) as User[];
}

/**
 * Get total number of users
 */
export function getUsersCount(): number {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const result = stmt.get() as { count: number };
  return result.count;
}

/**
 * Get user statistics (for admin)
 */
export function getUserStats(): {
  totalUsers: number;
  totalScans: number;
  avgScansPerUser: number;
} {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as totalUsers,
      SUM(total_scans) as totalScans,
      AVG(total_scans) as avgScansPerUser
    FROM users
  `);
  const result = stmt.get() as {
    totalUsers: number;
    totalScans: number;
    avgScansPerUser: number;
  };
  return result;
}

/**
 * Delete user (for testing/admin)
 * Also deletes all associated scans due to CASCADE
 */
export function deleteUser(userId: number): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(userId);
}
