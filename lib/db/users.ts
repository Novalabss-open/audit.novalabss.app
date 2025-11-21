import { query, queryOne } from './client';

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
export async function checkUserExists(email: string): Promise<User | null> {
  return await queryOne<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
}

/**
 * Create new user
 * Returns user ID
 */
export async function createUser(data: CreateUserData): Promise<number> {
  const result = await query<{ id: number }>(`
    INSERT INTO users (email, name, whatsapp, has_website, website_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [
    data.email,
    data.name,
    data.whatsapp || null,
    data.hasWebsite || false,
    data.websiteUrl || null
  ]);

  return result[0].id;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  return await queryOne<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return checkUserExists(email);
}

/**
 * Update user's last_seen timestamp
 * Also increments total_scans counter
 */
export async function updateLastSeen(userId: number): Promise<void> {
  await query(`
    UPDATE users
    SET last_seen = CURRENT_TIMESTAMP,
        total_scans = total_scans + 1
    WHERE id = $1
  `, [userId]);
}

/**
 * Update user information
 */
export async function updateUser(
  userId: number,
  data: Partial<Omit<CreateUserData, 'email'>>
): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCounter = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCounter++}`);
    values.push(data.name);
  }
  if (data.whatsapp !== undefined) {
    updates.push(`whatsapp = $${paramCounter++}`);
    values.push(data.whatsapp || null);
  }
  if (data.hasWebsite !== undefined) {
    updates.push(`has_website = $${paramCounter++}`);
    values.push(data.hasWebsite);
  }
  if (data.websiteUrl !== undefined) {
    updates.push(`website_url = $${paramCounter++}`);
    values.push(data.websiteUrl || null);
  }

  if (updates.length === 0) return;

  values.push(userId);

  await query(`
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramCounter}
  `, values);
}

/**
 * Get all users (for admin)
 * Returns paginated results
 */
export async function getAllUsers(limit = 100, offset = 0): Promise<User[]> {
  return await query<User>(`
    SELECT * FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
}

/**
 * Get total number of users
 */
export async function getUsersCount(): Promise<number> {
  const result = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM users'
  );
  return parseInt(result?.count || '0');
}

/**
 * Get user statistics (for admin)
 */
export async function getUserStats(): Promise<{
  totalUsers: number;
  totalScans: number;
  avgScansPerUser: number;
}> {
  const result = await queryOne<{
    totalUsers: string;
    totalScans: string;
    avgScansPerUser: number;
  }>(`
    SELECT
      COUNT(*) as totalUsers,
      SUM(total_scans) as totalScans,
      AVG(total_scans) as avgScansPerUser
    FROM users
  `);

  return {
    totalUsers: parseInt(result?.totalUsers || '0'),
    totalScans: parseInt(result?.totalScans || '0'),
    avgScansPerUser: result?.avgScansPerUser || 0,
  };
}

/**
 * Delete user (for testing/admin)
 * Also deletes all associated scans due to CASCADE
 */
export async function deleteUser(userId: number): Promise<void> {
  await query('DELETE FROM users WHERE id = $1', [userId]);
}
