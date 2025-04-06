import {
  CONTENT_TYPE,
  HTTP_STATUS,
  PROJECT_PREFIX,
  RESPONSE_MESSAGES,
} from '../../constants'
import { Env } from '../../types'
import { authenticateRequest } from '../../utils/session'

export const onRequest = async context => {
  const { request, env } = context

  const session = await authenticateRequest(request, env)
  if (!session) {
    return new Response(
      JSON.stringify({ error: RESPONSE_MESSAGES.NOT_AUTHENTICATED }),
      {
        status: HTTP_STATUS.UNAUTHORIZED,
        headers: { 'Content-Type': CONTENT_TYPE.JSON },
      },
    )
  }

  if (request.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ error: RESPONSE_MESSAGES.METHOD_NOT_ALLOWED }),
      {
        status: HTTP_STATUS.METHOD_NOT_ALLOWED,
        headers: { 'Content-Type': CONTENT_TYPE.JSON },
      },
    )
  }

  const url = new URL(request.url)
  const projectId = url.searchParams.get('id')
  if (!projectId) {
    return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.NO_PROJECT_ID }), {
      status: HTTP_STATUS.BAD_REQUEST,
      headers: { 'Content-Type': CONTENT_TYPE.JSON },
    })
  }

  await env.MY_KV.delete(`${PROJECT_PREFIX}:${session.userId}:${projectId}`)
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': CONTENT_TYPE.JSON },
  })
}
