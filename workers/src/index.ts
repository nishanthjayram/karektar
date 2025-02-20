import { handleGoogleAuth, handleCallback, handleAuthCheck, handleLogout } from '@handlers/auth';
import { handleProjects } from '@handlers/projects';
import { Env } from '@/types';
import { buildCorsHeaders } from '@utils/cors';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		console.log('Incoming request:', {
			method: request.method,
			url: request.url,
			headers: Object.fromEntries(request.headers.entries()),
		});
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: buildCorsHeaders(request) });
		}

		const handleResponse = (response: Response) => {
			try {
				const newHeaders = new Headers(response.headers);
				Object.entries(buildCorsHeaders(request)).forEach(([key, value]) => {
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
