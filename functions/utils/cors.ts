import { STATIC_ALLOWED_ORIGINS } from '../constants'

export const isAllowedOrigin = (origin: string): boolean => {
  if (STATIC_ALLOWED_ORIGINS.has(origin)) return true

  const previewRegex = /^https:\/\/[^.]+\.karektar\.pages\.dev$/
  if (previewRegex.test(origin)) return true

  // Allow additional localhost variations.
  if (origin.startsWith('http://localhost:')) return true

  return false
}

export const getCorsOrigin = (request: Request): string => {
  const headerOrigin = request.headers.get('Origin')
  if (headerOrigin && isAllowedOrigin(headerOrigin)) {
    return headerOrigin
  }

  const url = new URL(request.url)
  const uiOrigin = url.searchParams.get('uiOrigin')
  if (uiOrigin && isAllowedOrigin(uiOrigin)) {
    return uiOrigin
  }

  // Fallback: return the first allowed origin from the static set.
  return Array.from(STATIC_ALLOWED_ORIGINS)[0]
}

/**
 * Builds the CORS headers.
 */
export const buildCorsHeaders = (request: Request): Record<string, string> => ({
  'Access-Control-Allow-Origin': getCorsOrigin(request),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
})
