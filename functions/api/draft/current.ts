import {
  CONTENT_TYPE,
  CURRENT_DRAFT_PREFIX,
  HTTP_STATUS,
  RESPONSE_MESSAGES,
} from '../../constants'
import type {PagesFunctionContext} from '../../types'
import {normalizeStoredFontDraft} from '../../utils/draft'
import {authenticateRequest} from '../../utils/session'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': CONTENT_TYPE.JSON},
  })

export const onRequest = async ({request, env}: PagesFunctionContext) => {
  if (request.method !== 'GET' && request.method !== 'PUT') {
    return jsonResponse(
      {error: RESPONSE_MESSAGES.METHOD_NOT_ALLOWED},
      HTTP_STATUS.METHOD_NOT_ALLOWED,
    )
  }

  const session = await authenticateRequest(request, env)

  if (!session) {
    return jsonResponse(
      {error: RESPONSE_MESSAGES.NOT_AUTHENTICATED},
      HTTP_STATUS.UNAUTHORIZED,
    )
  }

  const key = `${CURRENT_DRAFT_PREFIX}${session.userId}`

  if (request.method === 'GET') {
    const storedDraft = await env.MY_KV.get<unknown>(key, 'json')
    const currentDraft = normalizeStoredFontDraft(storedDraft)

    if (!currentDraft) {
      return jsonResponse(
        {error: RESPONSE_MESSAGES.NOT_FOUND},
        HTTP_STATUS.NOT_FOUND,
      )
    }

    return jsonResponse(currentDraft)
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return jsonResponse(
      {error: RESPONSE_MESSAGES.INVALID_REQUEST},
      HTTP_STATUS.BAD_REQUEST,
    )
  }

  const draft = normalizeStoredFontDraft(payload)

  if (!draft) {
    return jsonResponse(
      {error: RESPONSE_MESSAGES.INVALID_DRAFT_PAYLOAD},
      HTTP_STATUS.BAD_REQUEST,
    )
  }

  await env.MY_KV.put(key, JSON.stringify({...draft, updatedAt: Date.now()}))

  return jsonResponse({success: true})
}
