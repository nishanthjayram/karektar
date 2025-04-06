import {
  CONTENT_TYPE,
  HTTP_STATUS,
  PROJECT_PREFIX,
  RESPONSE_MESSAGES,
} from '../../constants'
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

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: RESPONSE_MESSAGES.METHOD_NOT_ALLOWED }),
      {
        status: HTTP_STATUS.METHOD_NOT_ALLOWED,
        headers: { 'Content-Type': CONTENT_TYPE.JSON },
      },
    )
  }

  const { id, metadata } = (await request.json()) as { id: string; metadata: any }

  if (!id || !metadata) {
    return new Response(
      JSON.stringify({ error: RESPONSE_MESSAGES.MISSING_FIELDS }),
      {
        status: HTTP_STATUS.BAD_REQUEST,
        headers: { 'Content-Type': CONTENT_TYPE.JSON },
      },
    )
  }

  await env.MY_KV.put(
    `${PROJECT_PREFIX}:${session.userId}:${id}`,
    JSON.stringify(metadata),
  )
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': CONTENT_TYPE.JSON },
  })
}
