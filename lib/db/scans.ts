import { query, queryOne } from './client';
import type { ScanResult } from '@/lib/accessibility/types';

export interface Scan {
  id: number;
  user_id: number;
  url: string;
  score: number;
  violations_count: number;
  critical_count: number;
  serious_count: number;
  moderate_count: number;
  minor_count: number;
  violations_json: string;
  scanned_at: string;
}

export interface ScanWithParsedViolations extends Omit<Scan, 'violations_json'> {
  violations: ScanResult['violations'];
}

/**
 * Save scan result to database
 * Returns scan ID
 */
export async function saveScan(userId: number, scanResult: ScanResult): Promise<number> {
  const result = await query<{ id: number }>(`
    INSERT INTO scans (
      user_id, url, score, violations_count,
      critical_count, serious_count, moderate_count, minor_count,
      violations_json
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `, [
    userId,
    scanResult.url,
    scanResult.score,
    scanResult.violations.length,
    scanResult.summary.critical,
    scanResult.summary.serious,
    scanResult.summary.moderate,
    scanResult.summary.minor,
    JSON.stringify(scanResult.violations)
  ]);

  return result[0].id;
}

/**
 * Get user's scan history
 * Returns most recent scans first
 */
export async function getUserScans(userId: number, limit = 10): Promise<ScanWithParsedViolations[]> {
  const scans = await query<Scan>(`
    SELECT * FROM scans
    WHERE user_id = $1
    ORDER BY scanned_at DESC
    LIMIT $2
  `, [userId, limit]);

  // Parse violations JSON
  return scans.map((scan) => ({
    ...scan,
    violations: JSON.parse(scan.violations_json),
  })) as ScanWithParsedViolations[];
}

/**
 * Get scan by ID
 */
export async function getScanById(scanId: number): Promise<ScanWithParsedViolations | null> {
  const scan = await queryOne<Scan>(
    'SELECT * FROM scans WHERE id = $1',
    [scanId]
  );

  if (!scan) return null;

  return {
    ...scan,
    violations: JSON.parse(scan.violations_json),
  };
}

/**
 * Get user's scan for specific URL
 * Returns most recent scan for that URL
 */
export async function getUserScanForUrl(
  userId: number,
  url: string
): Promise<ScanWithParsedViolations | null> {
  const scan = await queryOne<Scan>(`
    SELECT * FROM scans
    WHERE user_id = $1 AND url = $2
    ORDER BY scanned_at DESC
    LIMIT 1
  `, [userId, url]);

  if (!scan) return null;

  return {
    ...scan,
    violations: JSON.parse(scan.violations_json),
  };
}

/**
 * Get all scans count for a user
 */
export async function getUserScansCount(userId: number): Promise<number> {
  const result = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM scans WHERE user_id = $1',
    [userId]
  );
  return parseInt(result?.count || '0');
}

/**
 * Get average score for a user
 */
export async function getUserAverageScore(userId: number): Promise<number | null> {
  const result = await queryOne<{ avgScore: number | null }>(
    'SELECT AVG(score) as avgScore FROM scans WHERE user_id = $1',
    [userId]
  );
  return result?.avgScore || null;
}

/**
 * Get all scans (for admin)
 */
export async function getAllScans(limit = 100, offset = 0): Promise<Scan[]> {
  return await query<Scan>(`
    SELECT * FROM scans
    ORDER BY scanned_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
}

/**
 * Get total scans count (for admin)
 */
export async function getTotalScansCount(): Promise<number> {
  const result = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM scans'
  );
  return parseInt(result?.count || '0');
}

/**
 * Get scan statistics (for admin)
 */
export async function getScanStats(): Promise<{
  totalScans: number;
  avgScore: number;
  avgViolations: number;
}> {
  const result = await queryOne<{
    totalScans: string;
    avgScore: number;
    avgViolations: number;
  }>(`
    SELECT
      COUNT(*) as totalScans,
      AVG(score) as avgScore,
      AVG(violations_count) as avgViolations
    FROM scans
  `);

  return {
    totalScans: parseInt(result?.totalScans || '0'),
    avgScore: result?.avgScore || 0,
    avgViolations: result?.avgViolations || 0,
  };
}

/**
 * Delete scan (for testing/admin)
 */
export async function deleteScan(scanId: number): Promise<void> {
  await query('DELETE FROM scans WHERE id = $1', [scanId]);
}

/**
 * Delete all scans for a user (for testing/admin)
 */
export async function deleteUserScans(userId: number): Promise<void> {
  await query('DELETE FROM scans WHERE user_id = $1', [userId]);
}
