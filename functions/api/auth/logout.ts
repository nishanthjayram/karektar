import {
  buildExpiredSessionCookie,
  CONTENT_TYPE,
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  SESSION_PREFIX,
} from '../../constants'
import type {PagesFunctionContext} from '../../types'
import {getSessionId} from '../../utils/session'

export const onRequest = async ({request, env}: PagesFunctionContext) => {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({error: RESPONSE_MESSAGES.METHOD_NOT_ALLOWED}),
      {
        status: HTTP_STATUS.METHOD_NOT_ALLOWED,
        headers: {'Content-Type': CONTENT_TYPE.JSON},
      },
    )
  }

  const sessionId = getSessionId(request)

  if (sessionId) {
    await env.MY_KV.delete(`${SESSION_PREFIX}${sessionId}`)
  }

  return new Response(JSON.stringify({success: true}), {
    headers: {
      'Content-Type': CONTENT_TYPE.JSON,
      'Set-Cookie': buildExpiredSessionCookie(),
    },
  })
}
