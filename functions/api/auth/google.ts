import {
  GOOGLE_AUTH_URL,
  HTTP_STATUS,
  OAUTH_STATE_PREFIX,
  OAUTH_STATE_TTL,
} from '../../constants'
import { buildCorsHeaders } from '../../utils/cors'
import { encodeBase64Url } from '../../utils/url'

export const onRequest = async context => {
  const { request, env } = context

  const url = new URL(request.url)
  const uiOrigin = url.searchParams.get('uiOrigin')

  if (
    !uiOrigin ||
    !buildCorsHeaders(request)['Access-Control-Allow-Origin'].includes(uiOrigin)
  ) {
    return new Response('Invalid uiOrigin parameter', {
      status: HTTP_STATUS.BAD_REQUEST,
      headers: buildCorsHeaders(request),
    })
  }

  const stateToken = crypto.randomUUID()
  const stateObj = { uiOrigin, stateToken }
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url')

  // Store state token in KV
  await env.MY_KV.put(`${OAUTH_STATE_PREFIX}${stateToken}`, state, {
    expirationTtl: OAUTH_STATE_TTL,
  })
  console.log('Stored state token:', `${OAUTH_STATE_PREFIX}${stateToken}`, state)

  // Define redirect URL
  const redirectUri = `${uiOrigin}/api/auth/callback`
  console.log(`Redirect URI: ${redirectUri}`)

  const authUrl = new URL(GOOGLE_AUTH_URL)
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'email profile')
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')
  authUrl.searchParams.set('state', state)

  return new Response(null, {
    status: 302,
    headers: {
      'Location': authUrl.toString(),
      ...buildCorsHeaders(request),
      'Cache-Control': 'no-store',
    },
  })
}
