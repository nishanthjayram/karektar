import {STATIC_ALLOWED_ORIGINS} from '../constants'

const PREVIEW_REGEX = /^https:\/\/[^.]+\.karektar\.pages\.dev$/

const normalizeOrigin = (value: string | null) => {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export const isAllowedOrigin = (origin: string) => {
  if (STATIC_ALLOWED_ORIGINS.has(origin)) {
    return true
  }

  if (PREVIEW_REGEX.test(origin)) {
    return true
  }

  return origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
}

export const getValidatedUiOrigin = (value: string | null) => {
  const origin = normalizeOrigin(value)

  if (!origin || !isAllowedOrigin(origin)) {
    return null
  }

  return origin
}
