import { TSession } from '@common/types';
import { Env, TokenResponse, GoogleUserInfo } from '@/types';
import { buildCorsHeaders } from '@utils/cors';
import { authenticateRequest } from '@utils/session';
import {
	OAUTH_STATE_PREFIX,
	OAUTH_STATE_TTL,
	GOOGLE_AUTH_URL,
	GOOGLE_TOKEN_URL,
	GOOGLE_USERINFO_URL,
	SESSION_EXPIRY_MS,
	REFRESH_TOKEN_PREFIX,
	SESSION_PREFIX,
	SESSION_MAX_AGE_SECONDS,
	CONTENT_TYPE,
	HTTP_STATUS,
	RESPONSE_MESSAGES,
} from '@/constants';

export async function handleGoogleAuth(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const workerOrigin = env.WORKER_ORIGIN || url.origin;
	const uiOrigin = url.searchParams.get('uiOrigin');
	if (!uiOrigin || !buildCorsHeaders(request)['Access-Control-Allow-Origin'].includes(uiOrigin)) {
		return new Response('Invalid uiOrigin parameter', {
			status: HTTP_STATUS.BAD_REQUEST,
			headers: buildCorsHeaders(request),
		});
	}

	const stateToken = crypto.randomUUID();
	const stateObj = { uiOrigin, stateToken };
	const state = btoa(JSON.stringify(stateObj));

	await env.MY_KV.put(`${OAUTH_STATE_PREFIX}${stateToken}`, state, {
		expirationTtl: OAUTH_STATE_TTL,
	});

	const redirectUri = `${workerOrigin}/auth/callback`;
	const authUrl = new URL(GOOGLE_AUTH_URL);
	authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', 'email profile');
	authUrl.searchParams.set('access_type', 'offline');
	authUrl.searchParams.set('prompt', 'consent');
	authUrl.searchParams.set('state', state);

	return new Response(null, {
		status: 302,
		headers: {
			Location: authUrl.toString(),
			...buildCorsHeaders(request),
			'Cache-Control': 'no-store',
		},
	});
}

export async function handleCallback(request: Request, env: Env): Promise<Response> {
	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const stateParam = url.searchParams.get('state');

		if (!code || !stateParam) {
			throw new Error('Missing required parameters');
		}

		// Decode the state parameter.
		let stateObj;
		try {
			stateObj = JSON.parse(atob(stateParam));
		} catch (e) {
			throw new Error('Invalid state parameter format');
		}

		const { uiOrigin, stateToken } = stateObj;

		const storedState = await env.MY_KV.get(`${OAUTH_STATE_PREFIX}${stateToken}`);
		if (!storedState || storedState !== stateParam) {
			throw new Error('Invalid state parameter');
		}
		// Clean up the used state token.
		await env.MY_KV.delete(`${OAUTH_STATE_PREFIX}${stateToken}`);

		// Build the redirect URI using the production Worker origin if set.
		const workerOrigin = env.WORKER_ORIGIN || url.origin;
		const redirectUri = `${workerOrigin}/auth/callback`;

		// Exchange the authorization code for tokens with Google.
		const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: env.GOOGLE_CLIENT_ID,
				client_secret: env.GOOGLE_CLIENT_SECRET,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code',
			}),
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.text();
			throw new Error(`Token exchange failed: ${errorData}`);
		}
		const tokens: TokenResponse = await tokenResponse.json();

		// Fetch the user info from Google.
		const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
			headers: { Authorization: `Bearer ${tokens.access_token}` },
		});
		if (!userInfoResponse.ok) {
			throw new Error('Failed to fetch user info');
		}
		const userData: GoogleUserInfo = await userInfoResponse.json();

		if (!userData.email || !userData.email_verified) {
			throw new Error('Email not verified');
		}

		const sessionId = crypto.randomUUID();
		const session: TSession = {
			userId: userData.sub,
			email: userData.email,
			name: userData.name,
			expiresAt: Date.now() + SESSION_EXPIRY_MS,
		};

		// Store the refresh token if provided.
		if (tokens.refresh_token) {
			await env.MY_KV.put(`${REFRESH_TOKEN_PREFIX}${userData.sub}`, tokens.refresh_token);
		}

		await env.MY_KV.put(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(session), {
			expirationTtl: SESSION_MAX_AGE_SECONDS,
		});

		// Build the session cookie.
		const domain = new URL(uiOrigin).hostname;
		const setCookie = `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}; Secure; Domain=${domain}`;

		return new Response(null, {
			status: 302,
			headers: {
				'Set-Cookie': setCookie,
				'Access-Control-Allow-Origin': uiOrigin,
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				Location: uiOrigin,
				'Cache-Control': 'no-store',
			},
		});
	} catch (error: any) {
		console.error('Detailed callback error:', {
			message: error.message,
			stack: error.stack,
			name: error.name,
		});

		const url = new URL(request.url);
		const stateParam = url.searchParams.get('state');
		let uiOriginFallback = url.origin;
		if (stateParam) {
			try {
				const stateObj = JSON.parse(atob(stateParam));
				uiOriginFallback = stateObj.uiOrigin || uiOriginFallback;
			} catch (e) {
				console.error('Error parsing state for fallback', e);
			}
		}
		const errorUrl = new URL(`${uiOriginFallback}/login`);
		errorUrl.searchParams.set('error', 'auth_failed');
		errorUrl.searchParams.set('reason', error.message);
		return new Response(null, {
			status: 302,
			headers: {
				Location: errorUrl.toString(),
				'Cache-Control': 'no-store',
			},
		});
	}
}

export async function handleAuthCheck(request: Request, env: Env): Promise<Response> {
	const session = await authenticateRequest(request, env);
	if (!session) {
		return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.NOT_AUTHENTICATED }), {
			status: HTTP_STATUS.UNAUTHORIZED,
			headers: { 'Content-Type': CONTENT_TYPE.JSON },
		});
	}
	return new Response(JSON.stringify({ email: session.email, name: session.name }), {
		headers: { 'Content-Type': CONTENT_TYPE.JSON },
	});
}

export async function handleLogout(request: Request, env: Env): Promise<Response> {
	const cookieHeader = request.headers.get('Cookie') || '';
	const match = cookieHeader.match(/session=([^;]+)/);
	const sessionId = match ? match[1] : null;
	if (sessionId) {
		const sessionData = await env.MY_KV.get(`${SESSION_PREFIX}${sessionId}`);
		if (sessionData) {
			const session: TSession = JSON.parse(sessionData);
			await env.MY_KV.delete(`${REFRESH_TOKEN_PREFIX}${session.userId}`);
		}
		await env.MY_KV.delete(`${SESSION_PREFIX}${sessionId}`);
	}
	const origin = request.headers.get('Origin') || request.url;
	const domain = new URL(origin).hostname;
	const setCookie = `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Domain=${domain}`;
	return new Response(JSON.stringify({ success: true }), {
		headers: {
			'Content-Type': CONTENT_TYPE.JSON,
			'Set-Cookie': setCookie,
		},
	});
}
