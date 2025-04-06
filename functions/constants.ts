// Allowed origins for CORS, as a Set for fast lookups.
export const STATIC_ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:8787',
  'https://karektar.pages.dev',
  'https://karektar.newtrino.ink',
  'https://karektar-api.workers.dev',
  'https://save-importable-bitmap-forma.karektar.pages.dev/',
])

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// Content-Type constants
export const CONTENT_TYPE = {
  JSON: 'application/json',
} as const

// Project-related KV key prefix
export const PROJECT_PREFIX = 'project' as const

// Standardized response messages for common errors or responses.
export const RESPONSE_MESSAGES = {
  NOT_AUTHENTICATED: 'Not authenticated',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  MISSING_FIELDS: 'Missing required fields',
  NO_PROJECT_ID: 'No project ID provided',
  INVALID_ACTION: 'Invalid action',
} as const

// OAuth-related constants
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

// Session-related constants
export const SESSION_EXPIRY_DAYS = 7
export const SESSION_EXPIRY_MS = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * SESSION_EXPIRY_DAYS

// KV storage constants for namespacing keys
export const OAUTH_STATE_PREFIX = 'oauth_state:'
export const REFRESH_TOKEN_PREFIX = 'refresh_token:'
export const SESSION_PREFIX = 'session:'
export const OAUTH_STATE_TTL = 300 // 5 minutes (in seconds)
