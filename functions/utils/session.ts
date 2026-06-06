import {SESSION_PREFIX} from '../constants'
import type {Env, Session} from '../types'

const SESSION_COOKIE_REGEX = /(?:^|;\s*)session=([^;]+)/

export const getSessionId = (request: Request) => {
  const cookieHeader = request.headers.get('Cookie') ?? ''
  const match = cookieHeader.match(SESSION_COOKIE_REGEX)

  return match ? match[1] : null
}

export const authenticateRequest = async (
  request: Request,
  env: Env,
): Promise<Session | null> => {
  const sessionId = getSessionId(request)

  if (!sessionId) {
    return null
  }

  const session = await env.MY_KV.get<Session>(`${SESSION_PREFIX}${sessionId}`, 'json')

  if (!session) {
    return null
  }

  if (session.expiresAt < Date.now()) {
    await env.MY_KV.delete(`${SESSION_PREFIX}${sessionId}`)
    return null
  }

  return session
}
