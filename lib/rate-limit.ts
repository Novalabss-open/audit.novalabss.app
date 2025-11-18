/**
 * Simple in-memory rate limiter
 * Tracks requests per IP address
 *
 * Configuration via environment variables:
 * - RATE_LIMIT_REQUESTS: Number of requests allowed (default: 5)
 * - RATE_LIMIT_WINDOW: Time window in milliseconds (default: 60000 = 1 minute)
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
// In production, consider using Redis or similar
const store = new Map<string, RateLimitRecord>();

// Configuration
const REQUESTS_LIMIT = parseInt(process.env.RATE_LIMIT_REQUESTS || '5', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10);

/**
 * Clean up expired records periodically
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);

/**
 * Check if IP is rate limited
 * Returns true if limit is exceeded
 *
 * @param identifier - Usually IP address
 * @returns Object with isLimited status and remaining count
 */
export function checkRateLimit(identifier: string): {
  isLimited: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = store.get(identifier);

  // No record yet, create one
  if (!record) {
    store.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      isLimited: false,
      remaining: REQUESTS_LIMIT - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  // Record expired, reset
  if (now > record.resetAt) {
    store.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      isLimited: false,
      remaining: REQUESTS_LIMIT - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  // Increment count
  record.count += 1;

  // Check if limit exceeded
  if (record.count > REQUESTS_LIMIT) {
    return {
      isLimited: true,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  return {
    isLimited: false,
    remaining: REQUESTS_LIMIT - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get IP address from request
 * Handles proxies and Vercel forwarding
 */
export function getClientIp(request: Request): string {
  // Try x-forwarded-for first (Vercel)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Try x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to a default
  return 'unknown';
}

/**
 * Reset rate limit for specific identifier
 * Useful for testing or manual overrides
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}
