import {
  OAUTH_STATE_PREFIX,
  SESSION_EXPIRY_DAYS,
  SESSION_PREFIX,
} from '../../constants'

export const onRequest = async context => {
  const { request, env } = context

  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const stateParam = url.searchParams.get('state')

    if (!code || !stateParam) {
      throw new Error('Missing required parameters')
    }

    // Decode the state parameter
    let stateObj
    try {
      const decodedState = Buffer.from(stateParam, 'base64url').toString()
      stateObj = JSON.parse(decodedState)
    } catch {
      throw new Error('Invalid state parameter format')
    }

    const { uiOrigin, stateToken } = stateObj

    // Retrieve state from KV
    const storedState = await env.MY_KV.get(`${OAUTH_STATE_PREFIX}${stateToken}`, {
      type: 'text',
    })

    if (!storedState || storedState !== stateParam) {
      throw new Error('Invalid state parameter')
    }

    // Clean up state
    await env.MY_KV.delete(`${OAUTH_STATE_PREFIX}${stateToken}`)

    // Exchange the code for tokens from Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${uiOrigin}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${errorData}`)
    }

    const tokens = await tokenResponse.json()

    // Fetch user info
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    )
    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const userData = await userInfoResponse.json()

    if (!userData.email || !userData.email_verified) {
      throw new Error('Email not verified')
    }

    // ✅ Generate a session ID and store it in KV
    const sessionId = crypto.randomUUID()
    console.log('Setting session cookie:', sessionId)

    await env.MY_KV.put(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(userData), {
      expirationTtl: SESSION_EXPIRY_DAYS * 24 * 60 * 60, // Expire in X days
    })

    // ✅ Set session cookie
    const headers = new Headers({
      'Set-Cookie': `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_EXPIRY_DAYS * 24 * 60 * 60}`,
      'Location': uiOrigin || '/', // Redirect to home page after successful login
    })

    return new Response(null, { status: 302, headers })
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
