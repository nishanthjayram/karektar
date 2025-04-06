import { SESSION_PREFIX } from '../constants'
import { Env, Session } from '../types'

export async function authenticateRequest(
  request: Request,
  env: Env,
): Promise<Session | null> {
  const cookieHeader = request.headers.get('Cookie') || ''
  const match = cookieHeader.match(/session=([^;]+)/)
  const sessionId = match ? match[1] : null
  console.log(`sessionId: ${sessionId}`)
  if (!sessionId) return null
  console.log('Checking session for:', sessionId)
  const sessionData = await env.MY_KV.get(`${SESSION_PREFIX}${sessionId}`)
  if (!sessionData) return null
  const session: Session = JSON.parse(sessionData)
  if (session.expiresAt < Date.now()) {
    await env.MY_KV.delete(`${SESSION_PREFIX}${sessionId}`)
    return null
  }
  return session
}
