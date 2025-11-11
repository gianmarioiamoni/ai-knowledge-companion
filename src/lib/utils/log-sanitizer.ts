/**
 * Log Sanitization Utility
 * 
 * Removes or masks sensitive information from logs to prevent data leakage.
 * 
 * Why sanitize logs?
 * - Prevent exposing user IDs, emails, tokens in logs
 * - Comply with GDPR/privacy regulations
 * - Reduce security risks from log aggregation tools
 * - Prevent accidental sensitive data exposure
 */

/**
 * Patterns to detect and redact sensitive data
 */
const SENSITIVE_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  
  // UUID (user IDs, document IDs)
  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  
  // JWT tokens
  jwt: /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*/g,
  
  // API keys (common patterns)
  apiKey: /\b(?:api[_-]?key|apikey|api[_-]?secret|access[_-]?token)["\s:=]+[A-Za-z0-9_-]{20,}\b/gi,
  
  // Credit card numbers
  creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  
  // IP addresses (partially mask)
  ip: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  
  // Bearer tokens
  bearer: /Bearer\s+[A-Za-z0-9-._~+/]+=*/gi,
  
  // Passwords in URLs or logs
  password: /password["\s:=]+[^&\s"]+/gi,
}

/**
 * Keys that should be completely removed from objects
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authorization',
  'auth',
  'creditCard',
  'credit_card',
  'ssn',
  'social_security',
])

/**
 * Keys that should be partially masked (show last 4 chars)
 */
const MASKABLE_KEYS = new Set([
  'userId',
  'user_id',
  'id',
  'email',
  'phone',
  'phoneNumber',
  'phone_number',
])

/**
 * Sanitization options
 */
export interface SanitizeOptions {
  /**
   * Mask UUIDs (show first 8 chars + ***)
   * @default true
   */
  maskUUIDs?: boolean

  /**
   * Mask emails (show first 2 chars + ***)
   * @default true
   */
  maskEmails?: boolean

  /**
   * Mask IPs (show last octet only)
   * @default true
   */
  maskIPs?: boolean

  /**
   * Remove sensitive keys entirely
   * @default true
   */
  removeSensitiveKeys?: boolean

  /**
   * Additional keys to remove
   */
  additionalSensitiveKeys?: string[]

  /**
   * Additional keys to mask
   */
  additionalMaskableKeys?: string[]
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  maskUUIDs: true,
  maskEmails: true,
  maskIPs: true,
  removeSensitiveKeys: true,
  additionalSensitiveKeys: [],
  additionalMaskableKeys: [],
}

/**
 * Sanitize a string by removing/masking sensitive patterns
 */
export function sanitizeString(
  input: string,
  options: SanitizeOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let sanitized = input

  // Remove JWT tokens
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.jwt, '[REDACTED_JWT]')

  // Remove API keys
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.apiKey, '[REDACTED_API_KEY]')

  // Remove bearer tokens
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.bearer, 'Bearer [REDACTED]')

  // Remove passwords
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.password, 'password=[REDACTED]')

  // Remove credit cards
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.creditCard, '[REDACTED_CC]')

  // Mask emails
  if (opts.maskEmails) {
    sanitized = sanitized.replace(SENSITIVE_PATTERNS.email, (match) => {
      const [local, domain] = match.split('@')
      return `${local.substring(0, 2)}***@${domain}`
    })
  }

  // Mask UUIDs
  if (opts.maskUUIDs) {
    sanitized = sanitized.replace(SENSITIVE_PATTERNS.uuid, (match) => {
      return `${match.substring(0, 8)}***`
    })
  }

  // Mask IPs
  if (opts.maskIPs) {
    sanitized = sanitized.replace(SENSITIVE_PATTERNS.ip, (match) => {
      const octets = match.split('.')
      return `***.***.***.${octets[3]}`
    })
  }

  return sanitized
}

/**
 * Sanitize an object by removing/masking sensitive fields
 */
export function sanitizeObject<T = any>(
  obj: T,
  options: SanitizeOptions = {}
): T {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Combine sensitive and maskable keys with additional ones
  const allSensitiveKeys = new Set([
    ...SENSITIVE_KEYS,
    ...(opts.additionalSensitiveKeys || []),
  ])
  const allMaskableKeys = new Set([
    ...MASKABLE_KEYS,
    ...(opts.additionalMaskableKeys || []),
  ])

  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options)) as any
  }

  const sanitized: any = {}

  for (const [key, value] of Object.entries(obj as any)) {
    // Remove sensitive keys
    if (opts.removeSensitiveKeys && allSensitiveKeys.has(key)) {
      sanitized[key] = '[REDACTED]'
      continue
    }

    // Mask maskable keys
    if (allMaskableKeys.has(key) && typeof value === 'string') {
      sanitized[key] = maskValue(value)
      continue
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options)
    }
    // Sanitize string values
    else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options)
    }
    // Keep other types as-is
    else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Mask a value (show first 2 chars, last 4 chars, rest as ***)
 */
function maskValue(value: string): string {
  if (value.length <= 6) {
    return '***'
  }

  const first = value.substring(0, 2)
  const last = value.substring(value.length - 4)
  return `${first}***${last}`
}

/**
 * Create a sanitized logger
 * 
 * @example
 * ```typescript
 * const logger = createSanitizedLogger()
 * 
 * logger.info('User logged in', {
 *   userId: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com',
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 * })
 * // Output: User logged in { userId: '123e4567***', email: 'us***@example.com', token: '[REDACTED]' }
 * ```
 */
export function createSanitizedLogger(options: SanitizeOptions = {}) {
  const sanitize = (args: any[]) => {
    return args.map((arg) => {
      if (typeof arg === 'string') {
        return sanitizeString(arg, options)
      }
      if (typeof arg === 'object') {
        return sanitizeObject(arg, options)
      }
      return arg
    })
  }

  return {
    log: (...args: any[]) => console.log(...sanitize(args)),
    info: (...args: any[]) => console.info(...sanitize(args)),
    warn: (...args: any[]) => console.warn(...sanitize(args)),
    error: (...args: any[]) => console.error(...sanitize(args)),
    debug: (...args: any[]) => console.debug(...sanitize(args)),
  }
}

/**
 * Quick sanitize function for inline use
 * 
 * @example
 * ```typescript
 * console.log('User data:', sanitize({ userId: 'abc-123', token: 'secret' }))
 * // Output: User data: { userId: 'abc-123', token: '[REDACTED]' }
 * ```
 */
export function sanitize<T = any>(data: T, options?: SanitizeOptions): T {
  if (typeof data === 'string') {
    return sanitizeString(data, options) as any
  }
  return sanitizeObject(data, options)
}

/**
 * Global sanitized logger instance
 */
export const logger = createSanitizedLogger()

