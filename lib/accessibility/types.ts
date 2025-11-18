import type { Result as AxeResult, NodeResult } from 'axe-core';

export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

export interface Violation {
  id: string;
  impact: Severity;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: ViolationNode[];
}

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface ScanSummary {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  total: number;
}

export interface ScanResult {
  url: string;
  score: number;
  timestamp: string;
  violations: Violation[];
  passes: number;
  incomplete: number;
  summary: ScanSummary;
}

export interface ScanError {
  error: string;
  message: string;
  url?: string;
}
