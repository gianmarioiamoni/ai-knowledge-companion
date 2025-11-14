/**
 * Simple in-memory rate limiter for contact form
 * Prevents spam without requiring database storage
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Timestamp
}

// In-memory cache (resets on server restart, which is acceptable)
const rateLimitCache = new Map<string, RateLimitEntry>();

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL = 3600000; // 1 hour
const RATE_LIMIT_WINDOW = 86400000; // 24 hours in milliseconds
const MAX_REQUESTS_PER_DAY = 5; // Max 5 messages per email per day

/**
 * Start periodic cleanup of expired entries
 */
function startCleanup() {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of rateLimitCache.entries()) {
      if (entry.resetAt < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => rateLimitCache.delete(key));

    if (keysToDelete.length > 0) {
      console.info(`🧹 Rate limiter cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }, CLEANUP_INTERVAL);
}

// Start cleanup on module load
if (typeof window === 'undefined') {
  // Only run on server-side
  startCleanup();
}

/**
 * Check if email has exceeded rate limit
 * 
 * @param email - Email address to check
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(email: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const key = email.toLowerCase().trim();

  // Get existing entry or create new one
  let entry = rateLimitCache.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW,
    };
    rateLimitCache.set(key, entry);
  }

  // Check if limit exceeded
  const allowed = entry.count < MAX_REQUESTS_PER_DAY;
  const remaining = Math.max(0, MAX_REQUESTS_PER_DAY - entry.count);
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    retryAfter,
  };
}

/**
 * Record a contact form submission attempt
 * Call this AFTER successful email send
 * 
 * @param email - Email address that submitted
 */
export function recordSubmission(email: string): void {
  const now = Date.now();
  const key = email.toLowerCase().trim();

  let entry = rateLimitCache.get(key);

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    };
  } else {
    entry.count += 1;
  }

  rateLimitCache.set(key, entry);

  console.info(`📊 Rate limit: ${email} - ${entry.count}/${MAX_REQUESTS_PER_DAY} used`);
}

/**
 * Log contact form submission for monitoring
 * Minimal logging without database
 * 
 * @param data - Contact submission metadata
 */
export interface ContactSubmissionLog {
  email: string;
  category: string;
  isAuthenticated: boolean;
  emailSent: boolean;
  timestamp: string;
}

export function logContactSubmission(data: ContactSubmissionLog): void {
  // Log to console for monitoring/debugging
  // In production, this can be sent to logging service (Sentry, Datadog, etc.)
  
  const logEntry = {
    type: 'contact_form_submission',
    ...data,
    timestamp: data.timestamp || new Date().toISOString(),
  };

  console.info('📝 Contact submission:', JSON.stringify(logEntry));

  // Optional: Send to external logging service
  // await sendToLoggingService(logEntry);
}

/**
 * Get current rate limiter statistics
 * Useful for monitoring and debugging
 */
export function getRateLimiterStats(): {
  totalEntries: number;
  activeUsers: number;
  cacheSize: number;
} {
  const now = Date.now();
  const activeUsers = Array.from(rateLimitCache.values()).filter(
    (entry) => entry.resetAt > now
  ).length;

  return {
    totalEntries: rateLimitCache.size,
    activeUsers,
    cacheSize: rateLimitCache.size,
  };
}

/**
 * Clear all rate limit entries
 * Useful for testing or emergency reset
 */
export function clearRateLimits(): void {
  const size = rateLimitCache.size;
  rateLimitCache.clear();
  console.warn(`🗑️ Rate limiter cleared: ${size} entries removed`);
}

