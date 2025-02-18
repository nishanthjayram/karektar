// workers/src/index.ts
import { TSession, TProjectMetadata } from '@common/types';

const ALLOWED_ORIGINS = new Set([
	'https://karektar.pages.dev', // Your Pages preview URL
	'https://karektar.newtrino.ink', // Your custom domain
]);

const getCorsOrigin = (request: Request): string => {
	const origin = request.headers.get('Origin');
	if (origin && ALLOWED_ORIGINS.has(origin)) {
		return origin;
	}
	throw new Error('Invalid origin');
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
}

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
}

interface GoogleUserInfo {
	sub: string;
	email: string;
	name: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders(request),
			});
		}

		// Add CORS headers to all responses
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
				return new Response('Forbidden', {
					status: 403,
					headers: {
						'Content-Type': 'text/plain',
					},
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
			return handleResponse(new Response('Internal server error', { status: 500 }));
		}
	},
};

async function handleGoogleAuth(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const workerOrigin = url.origin;

	// Try to get the UI's origin from the Origin header; fallback to workerOrigin if not available.
	const uiOrigin = url.searchParams.get('uiOrigin') || request.headers.get('Origin') || workerOrigin;
	const redirectUri = `${workerOrigin}/auth/callback`;

	const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', 'email profile');
	authUrl.searchParams.set('access_type', 'offline');
	authUrl.searchParams.set('prompt', 'consent');
	// Pass the UI origin in the state parameter so it can be used on callback.
	authUrl.searchParams.set('state', uiOrigin);

	return new Response('', {
		status: 302,
		headers: {
			Location: authUrl.toString(),
			'Cache-Control': 'no-store',
		},
	});
}

async function handleCallback(request: Request, env: Env): Promise<Response> {
	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		if (!code) throw new Error('No code provided');

		console.log('Handling callback for auth, request origin:', url.origin);

		const redirectUri = `${url.origin}/auth/callback`;
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

		const tokens: TokenResponse = await tokenResponse.json();
		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: { Authorization: `Bearer ${tokens.access_token}` },
		});

		const userData: GoogleUserInfo = await userInfoResponse.json();
		const sessionId = crypto.randomUUID();
		const session: TSession = {
			userId: userData.sub,
			email: userData.email,
			name: userData.name,
			expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
		};

		await env.MY_KV.put(`session:${sessionId}`, JSON.stringify(session), {
			expirationTtl: 60 * 60 * 24 * 7,
		});

		// Retrieve UI origin from state parameter
		const uiOrigin = url.searchParams.get('state') || url.origin;
		console.log('Redirecting user back to:', uiOrigin);
		const setCookie = `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; Secure`;

		return new Response(null, {
			status: 302,
			headers: {
				'Set-Cookie': setCookie,
				'Access-Control-Allow-Credentials': 'true',
				Location: uiOrigin,
			},
		});
	} catch (error: any) {
		console.error('Auth error:', error);
		const uiOrigin = new URL(request.url).origin;
		return new Response(null, {
			status: 302,
			headers: {
				Location: `${uiOrigin}/login?error=auth_failed&reason=${encodeURIComponent(error.message)}`,
			},
		});
	}
}

async function authenticateRequest(request: Request, env: Env): Promise<TSession | null> {
	const sessionId = request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
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

	return new Response(
		JSON.stringify({
			email: session.email,
			name: session.name,
		}),
		{
			headers: { 'Content-Type': 'application/json' },
		}
	);
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
	const sessionId = request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
	if (sessionId) {
		await env.MY_KV.delete(`session:${sessionId}`);
	}

	return new Response(JSON.stringify({ success: true }), {
		headers: {
			'Content-Type': 'application/json',
			'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
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
		case 'list':
			const projectsList = await env.MY_KV.list({ prefix: `project:${session.userId}:` });
			const projects: Record<string, TProjectMetadata> = {};

			for (const key of projectsList.keys) {
				const projectData = await env.MY_KV.get(key.name);
				if (projectData) {
					const projectId = key.name.split(':')[2];
					projects[projectId] = JSON.parse(projectData);
				}
			}

			return new Response(JSON.stringify(projects), {
				headers: { 'Content-Type': 'application/json' },
			});

		case 'save':
			const { id, metadata } = (await request.json()) as {
				id: string;
				metadata: TProjectMetadata;
			};

			await env.MY_KV.put(`project:${session.userId}:${id}`, JSON.stringify(metadata));

			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': 'application/json' },
			});

		case 'delete':
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

		default:
			return new Response(JSON.stringify({ error: 'Invalid action' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
	}
}
