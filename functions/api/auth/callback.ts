import {
  buildSessionCookie,
  CONTENT_TYPE,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  HTTP_STATUS,
  OAUTH_STATE_PREFIX,
  SESSION_EXPIRY_DAYS,
  SESSION_EXPIRY_MS,
  SESSION_PREFIX,
} from '../../constants'
import type {
  GoogleUserInfo,
  OAuthState,
  PagesFunctionContext,
  Session,
  TokenResponse,
} from '../../types'
import {decodeBase64Url} from '../../utils/base64url'
import {getValidatedUiOrigin} from '../../utils/origin'

export const onRequest = async ({request, env}: PagesFunctionContext) => {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const rawState = url.searchParams.get('state')

    if (!code || !rawState) {
      throw new Error('Missing required parameters')
    }

    const decodedState = JSON.parse(decodeBase64Url(rawState)) as OAuthState
    const uiOrigin = getValidatedUiOrigin(decodedState.uiOrigin)

    if (!uiOrigin) {
      throw new Error('Invalid state parameter')
    }

    const storedState = await env.MY_KV.get(
      `${OAUTH_STATE_PREFIX}${decodedState.stateToken}`,
    )

    if (!storedState || storedState !== rawState) {
      throw new Error('Invalid state parameter')
    }

    await env.MY_KV.delete(`${OAUTH_STATE_PREFIX}${decodedState.stateToken}`)

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${uiOrigin}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(await tokenResponse.text())
    }

    const tokens = (await tokenResponse.json()) as TokenResponse

    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens['access_token']}`,
      },
    })

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const user = (await userInfoResponse.json()) as GoogleUserInfo

    if (!user.sub || !user.email || !user.name || !user['email_verified']) {
      throw new Error('Email not verified')
    }

    const sessionId = crypto.randomUUID()
    const session: Session = {
      userId: user.sub,
      email: user.email,
      name: user.name,
      expiresAt: Date.now() + SESSION_EXPIRY_MS,
    }

    await env.MY_KV.put(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(session), {
      expirationTtl: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    })

    return new Response(null, {
      status: HTTP_STATUS.FOUND,
      headers: {
        'Cache-Control': 'no-store',
        Location: uiOrigin,
        'Set-Cookie': buildSessionCookie(sessionId),
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: HTTP_STATUS.BAD_REQUEST,
        headers: {'Content-Type': CONTENT_TYPE.JSON},
      },
    )
  }
}
