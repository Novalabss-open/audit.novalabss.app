import type { Violation, ScanSummary } from './types';

/**
 * Calculate accessibility score from 0-100 based on violations
 *
 * Algorithm:
 * - Start with 100 points
 * - Critical violations: -10 points each
 * - Serious violations: -5 points each
 * - Moderate violations: -3 points each
 * - Minor violations: -1 point each
 * - Minimum score: 0
 * - Maximum score: 100
 */
export function calculateScore(violations: Violation[]): number {
  let score = 100;

  for (const violation of violations) {
    const impact = violation.impact;
    const count = violation.nodes.length;

    switch (impact) {
      case 'critical':
        score -= count * 10;
        break;
      case 'serious':
        score -= count * 5;
        break;
      case 'moderate':
        score -= count * 3;
        break;
      case 'minor':
        score -= count * 1;
        break;
    }
  }

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate summary statistics from violations
 */
export function calculateSummary(violations: Violation[]): ScanSummary {
  const summary: ScanSummary = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    total: 0,
  };

  for (const violation of violations) {
    const count = violation.nodes.length;

    switch (violation.impact) {
      case 'critical':
        summary.critical += count;
        break;
      case 'serious':
        summary.serious += count;
        break;
      case 'moderate':
        summary.moderate += count;
        break;
      case 'minor':
        summary.minor += count;
        break;
    }

    summary.total += count;
  }

  return summary;
}

/**
 * Get color coding for score visualization
 */
export function getScoreColor(score: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (score >= 90) return 'green';
  if (score >= 70) return 'yellow';
  if (score >= 50) return 'orange';
  return 'red';
}

/**
 * Get score label in Spanish
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Bueno';
  if (score >= 50) return 'Requiere Atención';
  return 'Crítico';
}
