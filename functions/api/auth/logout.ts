import { CONTENT_TYPE, REFRESH_TOKEN_PREFIX, SESSION_PREFIX } from '../../constants'
import { Env, Session } from '../../types'

export const onRequest = async context => {
  const { request, env } = context

  const cookieHeader = request.headers.get('Cookie') || ''
  const match = cookieHeader.match(/session=([^;]+)/)
  const sessionId = match ? match[1] : null

  if (sessionId) {
    const sessionData = await env.MY_KV.get(`${SESSION_PREFIX}${sessionId}`)
    if (sessionData) {
      const session: Session = JSON.parse(sessionData)
      await env.MY_KV.delete(`${REFRESH_TOKEN_PREFIX}${session.userId}`)
    }
    await env.MY_KV.delete(`${SESSION_PREFIX}${sessionId}`)
  }

  const origin = request.headers.get('Origin') || request.url
  const domain = new URL(origin).hostname
  const setCookie = `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0;` //Domain=${domain}`

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': CONTENT_TYPE.JSON,
      'Set-Cookie': setCookie,
    },
  })
}
