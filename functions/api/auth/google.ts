import {
  GOOGLE_AUTH_URL,
  HTTP_STATUS,
  OAUTH_STATE_PREFIX,
  OAUTH_STATE_TTL_SECONDS,
} from '../../constants'
import type {PagesFunctionContext} from '../../types'
import {encodeBase64Url} from '../../utils/base64url'
import {getValidatedUiOrigin} from '../../utils/origin'

export const onRequest = async ({request, env}: PagesFunctionContext) => {
  const url = new URL(request.url)
  const uiOrigin = getValidatedUiOrigin(url.searchParams.get('uiOrigin'))

  if (!uiOrigin) {
    return new Response('Invalid uiOrigin parameter', {
      status: HTTP_STATUS.BAD_REQUEST,
    })
  }

  const stateToken = crypto.randomUUID()
  const state = encodeBase64Url(JSON.stringify({uiOrigin, stateToken}))

  await env.MY_KV.put(`${OAUTH_STATE_PREFIX}${stateToken}`, state, {
    expirationTtl: OAUTH_STATE_TTL_SECONDS,
  })

  const authUrl = new URL(GOOGLE_AUTH_URL)
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', `${uiOrigin}/api/auth/callback`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'email profile')
  authUrl.searchParams.set('state', state)

  return new Response(null, {
    status: HTTP_STATUS.FOUND,
    headers: {
      'Cache-Control': 'no-store',
      Location: authUrl.toString(),
    },
  })
}
