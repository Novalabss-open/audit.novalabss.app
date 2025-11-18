import { getDb } from './client';
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
export function saveScan(userId: number, scanResult: ScanResult): number {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO scans (
      user_id, url, score, violations_count,
      critical_count, serious_count, moderate_count, minor_count,
      violations_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    scanResult.url,
    scanResult.score,
    scanResult.violations.length,
    scanResult.summary.critical,
    scanResult.summary.serious,
    scanResult.summary.moderate,
    scanResult.summary.minor,
    JSON.stringify(scanResult.violations)
  );

  return result.lastInsertRowid as number;
}

/**
 * Get user's scan history
 * Returns most recent scans first
 */
export function getUserScans(userId: number, limit = 10): ScanWithParsedViolations[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM scans
    WHERE user_id = ?
    ORDER BY scanned_at DESC
    LIMIT ?
  `);

  const scans = stmt.all(userId, limit) as Scan[];

  // Parse violations JSON
  return scans.map((scan) => ({
    ...scan,
    violations: JSON.parse(scan.violations_json),
  })) as ScanWithParsedViolations[];
}

/**
 * Get scan by ID
 */
export function getScanById(scanId: number): ScanWithParsedViolations | null {
  const db = getDb();

  const stmt = db.prepare('SELECT * FROM scans WHERE id = ?');
  const scan = stmt.get(scanId) as Scan | undefined;

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
export function getUserScanForUrl(
  userId: number,
  url: string
): ScanWithParsedViolations | null {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM scans
    WHERE user_id = ? AND url = ?
    ORDER BY scanned_at DESC
    LIMIT 1
  `);

  const scan = stmt.get(userId, url) as Scan | undefined;

  if (!scan) return null;

  return {
    ...scan,
    violations: JSON.parse(scan.violations_json),
  };
}

/**
 * Get all scans count for a user
 */
export function getUserScansCount(userId: number): number {
  const db = getDb();

  const stmt = db.prepare('SELECT COUNT(*) as count FROM scans WHERE user_id = ?');
  const result = stmt.get(userId) as { count: number };
  return result.count;
}

/**
 * Get average score for a user
 */
export function getUserAverageScore(userId: number): number | null {
  const db = getDb();

  const stmt = db.prepare('SELECT AVG(score) as avgScore FROM scans WHERE user_id = ?');
  const result = stmt.get(userId) as { avgScore: number | null };
  return result.avgScore;
}

/**
 * Get all scans (for admin)
 */
export function getAllScans(limit = 100, offset = 0): Scan[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM scans
    ORDER BY scanned_at DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(limit, offset) as Scan[];
}

/**
 * Get total scans count (for admin)
 */
export function getTotalScansCount(): number {
  const db = getDb();

  const stmt = db.prepare('SELECT COUNT(*) as count FROM scans');
  const result = stmt.get() as { count: number };
  return result.count;
}

/**
 * Get scan statistics (for admin)
 */
export function getScanStats(): {
  totalScans: number;
  avgScore: number;
  avgViolations: number;
} {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT
      COUNT(*) as totalScans,
      AVG(score) as avgScore,
      AVG(violations_count) as avgViolations
    FROM scans
  `);

  const result = stmt.get() as {
    totalScans: number;
    avgScore: number;
    avgViolations: number;
  };

  return result;
}

/**
 * Delete scan (for testing/admin)
 */
export function deleteScan(scanId: number): void {
  const db = getDb();

  const stmt = db.prepare('DELETE FROM scans WHERE id = ?');
  stmt.run(scanId);
}

/**
 * Delete all scans for a user (for testing/admin)
 */
export function deleteUserScans(userId: number): void {
  const db = getDb();

  const stmt = db.prepare('DELETE FROM scans WHERE user_id = ?');
  stmt.run(userId);
}
