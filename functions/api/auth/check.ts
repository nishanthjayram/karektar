import { CONTENT_TYPE, HTTP_STATUS, RESPONSE_MESSAGES } from '../../constants'
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

  return new Response(JSON.stringify({ email: session.email, name: session.name }), {
    headers: { 'Content-Type': CONTENT_TYPE.JSON },
  })
}
