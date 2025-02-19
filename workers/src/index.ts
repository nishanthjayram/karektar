import { TSession, TProjectMetadata } from '@common/types';

const ALLOWED_ORIGINS = new Set([
	'http://localhost:5173',
	'http://localhost:8787',
	'http://127.0.0.1:8787',
	'http://192.168.7.138:5173',
	'https://karektar.pages.dev',
	'https://karektar.newtrino.ink',
	'https://karektar-api.workers.dev',
]);

// Helper to determine CORS headers.
const getCorsOrigin = (request: Request): string => {
	const origin = request.headers.get('Origin');
	if (!origin) {
		const url = new URL(request.url);
		const uiOrigin = url.searchParams.get('uiOrigin');
		if (uiOrigin && ALLOWED_ORIGINS.has(uiOrigin)) return uiOrigin;
	}
	if (origin) {
		if (ALLOWED_ORIGINS.has(origin)) return origin;
		if (origin.startsWith('http://localhost:') || origin.startsWith('http://172.')) return origin;
	}
	return 'http://localhost:5173';
};

const corsHeaders = (request: Request) => ({
	'Access-Control-Allow-Origin': getCorsOrigin(request),
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Allow-Credentials': 'true',
});

interface Env {
	MY_KV: KVNamespace;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	// This variable should be set in your production environment (wrangler.toml)
	WORKER_ORIGIN?: string;
}

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	id_token?: string;
}

interface GoogleUserInfo {
	sub: string;
	email: string;
	name: string;
	email_verified?: boolean;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		console.log('Incoming request:', {
			method: request.method,
			url: request.url,
			headers: Object.fromEntries(request.headers.entries()),
		});
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders(request) });
		}

		const handleResponse = (response: Response) => {
			try {
				const newHeaders = new Headers(response.headers);
				Object.entries(corsHeaders(request)).forEach(([key, value]) => {
					newHeaders.set(key, value);
				});
				return new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers: newHeaders,
				});
			} catch (error) {
				console.error('Response handling error:', error);
				return new Response('Forbidden', {
					status: 403,
					headers: { 'Content-Type': 'text/plain' },
				});
			}
		};

		try {
			let response: Response;
			switch (url.pathname) {
				case '/auth/google':
					response = await handleGoogleAuth(request, env);
					break;
				case '/auth/callback':
					response = await handleCallback(request, env);
					break;
				case '/api/auth/check':
					response = await handleAuthCheck(request, env);
					break;
				case '/api/auth/logout':
					response = await handleLogout(request, env);
					break;
				case '/api/projects/list':
					response = await handleProjects(request, env, 'list');
					break;
				case '/api/projects/save':
					response = await handleProjects(request, env, 'save');
					break;
				case '/api/projects/delete':
					response = await handleProjects(request, env, 'delete');
					break;
				default:
					response = new Response('Not found', { status: 404 });
			}
			return handleResponse(response);
		} catch (error) {
			console.error('Request error:', error);
			return handleResponse(
				new Response('Internal server error', {
					status: 500,
					headers: { 'Content-Type': 'text/plain' },
				}),
			);
		}
	},
};

async function handleGoogleAuth(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	// Use the production Worker origin if set; otherwise, use the current URL's origin.
	const workerOrigin = env.WORKER_ORIGIN || url.origin;
	const uiOrigin = url.searchParams.get('uiOrigin');
	if (!uiOrigin || !ALLOWED_ORIGINS.has(uiOrigin)) {
		return new Response('Invalid uiOrigin parameter', {
			status: 400,
			headers: corsHeaders(request),
		});
	}

	// Generate a secure state parameter using JSON + base64 encoding.
	const stateToken = crypto.randomUUID();
	const stateObj = { uiOrigin, stateToken };
	const state = btoa(JSON.stringify(stateObj));

	// Store the state token in KV for a short time.
	await env.MY_KV.put(`oauth_state:${stateToken}`, uiOrigin, {
		expirationTtl: 60 * 5, // 5 minutes
	});

	// Build the redirect URI from the worker's public origin.
	const redirectUri = `${workerOrigin}/auth/callback`;
	console.log('Redirect URI:', redirectUri);

	const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
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
			...corsHeaders(request),
			'Cache-Control': 'no-store',
		},
	});
}

async function handleCallback(request: Request, env: Env): Promise<Response> {
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

		const storedOrigin = await env.MY_KV.get(`oauth_state:${stateToken}`);
		if (!storedOrigin || storedOrigin !== uiOrigin) {
			throw new Error('Invalid state parameter');
		}
		// Clean up the used state token.
		await env.MY_KV.delete(`oauth_state:${stateToken}`);

		// Build the redirect URI using the production Worker origin if set.
		const workerOrigin = env.WORKER_ORIGIN || url.origin;
		const redirectUri = `${workerOrigin}/auth/callback`;

		// Exchange the authorization code for tokens with Google.
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
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
			expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
		};

		// Store the refresh token if provided.
		if (tokens.refresh_token) {
			await env.MY_KV.put(`refresh_token:${userData.sub}`, tokens.refresh_token);
		}

		await env.MY_KV.put(`session:${sessionId}`, JSON.stringify(session), {
			expirationTtl: 60 * 60 * 24 * 7, // 7 days
		});

		// Build the session cookie.
		const domain = new URL(uiOrigin).hostname;
		const setCookie = `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; Secure; Domain=${domain}`;

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

async function authenticateRequest(request: Request, env: Env): Promise<TSession | null> {
	const cookieHeader = request.headers.get('Cookie') || '';
	const match = cookieHeader.match(/session=([^;]+)/);
	const sessionId = match ? match[1] : null;
	if (!sessionId) return null;
	const sessionData = await env.MY_KV.get(`session:${sessionId}`);
	if (!sessionData) return null;
	const session: TSession = JSON.parse(sessionData);
	if (session.expiresAt < Date.now()) {
		await env.MY_KV.delete(`session:${sessionId}`);
		return null;
	}
	return session;
}

async function handleAuthCheck(request: Request, env: Env): Promise<Response> {
	const session = await authenticateRequest(request, env);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Not authenticated' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	return new Response(JSON.stringify({ email: session.email, name: session.name }), {
		headers: { 'Content-Type': 'application/json' },
	});
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
	const cookieHeader = request.headers.get('Cookie') || '';
	const match = cookieHeader.match(/session=([^;]+)/);
	const sessionId = match ? match[1] : null;
	if (sessionId) {
		const sessionData = await env.MY_KV.get(`session:${sessionId}`);
		if (sessionData) {
			const session: TSession = JSON.parse(sessionData);
			await env.MY_KV.delete(`refresh_token:${session.userId}`);
		}
		await env.MY_KV.delete(`session:${sessionId}`);
	}
	const origin = request.headers.get('Origin') || request.url;
	const domain = new URL(origin).hostname;
	const setCookie = `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Domain=${domain}`;
	return new Response(JSON.stringify({ success: true }), {
		headers: {
			'Content-Type': 'application/json',
			'Set-Cookie': setCookie,
		},
	});
}

async function handleProjects(request: Request, env: Env, action: 'list' | 'save' | 'delete'): Promise<Response> {
	const session = await authenticateRequest(request, env);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Not authenticated' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	switch (action) {
		case 'list': {
			const projectsList = await env.MY_KV.list({ prefix: `project:${session.userId}:` });
			const projects: Record<string, TProjectMetadata> = {};
			for (const key of projectsList.keys) {
				const projectData = await env.MY_KV.get(key.name);
				if (projectData) {
					const parts = key.name.split(':');
					const projectId = parts.slice(2).join(':');
					projects[projectId] = JSON.parse(projectData);
				}
			}
			return new Response(JSON.stringify(projects), {
				headers: { 'Content-Type': 'application/json' },
			});
		}
		case 'save': {
			if (request.method !== 'POST') {
				return new Response(JSON.stringify({ error: 'Method not allowed' }), {
					status: 405,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			const { id, metadata } = (await request.json()) as { id: string; metadata: TProjectMetadata };

			if (!id || !metadata) {
				return new Response(JSON.stringify({ error: 'Missing required fields' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			await env.MY_KV.put(`project:${session.userId}:${id}`, JSON.stringify(metadata));
			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}
		case 'delete': {
			if (request.method !== 'DELETE') {
				return new Response(JSON.stringify({ error: 'Method not allowed' }), {
					status: 405,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			const url = new URL(request.url);
			const projectId = url.searchParams.get('id');
			if (!projectId) {
				return new Response(JSON.stringify({ error: 'No project ID provided' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			await env.MY_KV.delete(`project:${session.userId}:${projectId}`);
			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}
		default:
			return new Response(JSON.stringify({ error: 'Invalid action' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
	}
}
