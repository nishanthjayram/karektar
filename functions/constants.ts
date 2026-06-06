export const STATIC_ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
  'https://karektar.pages.dev',
  'https://karektar.newtrino.ink',
])

export const HTTP_STATUS = {
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  METHOD_NOT_ALLOWED: 405,
} as const

export const CONTENT_TYPE = {
  JSON: 'application/json',
} as const

export const RESPONSE_MESSAGES = {
  METHOD_NOT_ALLOWED: 'Method not allowed',
  NOT_AUTHENTICATED: 'Not authenticated',
} as const

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export const OAUTH_STATE_PREFIX = 'oauth_state:'
export const SESSION_PREFIX = 'session:'

export const OAUTH_STATE_TTL_SECONDS = 60 * 5
export const SESSION_EXPIRY_DAYS = 7
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * SESSION_EXPIRY_DAYS
export const SESSION_EXPIRY_MS = SESSION_MAX_AGE_SECONDS * 1000

export const buildSessionCookie = (sessionId: string) =>
  [
    `session=${sessionId}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ].join('; ')

export const buildExpiredSessionCookie = () =>
  [
    'session=',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
  ].join('; ')
