import type { User } from '@/lib/db/users';

// ============================================
// Auth API Types
// ============================================

export interface CheckEmailRequest {
  email: string;
}

export interface CheckEmailResponse {
  exists: boolean;
  user?: User;
}

export interface RegisterRequest {
  email: string;
  name: string;
  whatsapp?: string;
  hasWebsite?: boolean;
  websiteUrl?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
}

// ============================================
// Error Response Types
// ============================================

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string>;
}

// ============================================
// Scan API Types (futuro)
// ============================================

export interface SaveScanRequest {
  userId: number;
  url: string;
  score: number;
  violationsCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  violationsJson: string;
}

export interface SaveScanResponse {
  success: boolean;
  scanId: number;
}

export interface GetScanHistoryRequest {
  userId: number;
  limit?: number;
}

export interface GetScanHistoryResponse {
  scans: Array<{
    id: number;
    url: string;
    score: number;
    violationsCount: number;
    scannedAt: string;
  }>;
}
