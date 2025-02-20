import { TSession } from '@common/types';
import { Env } from '../types';
import { SESSION_PREFIX } from '../constants';

export async function authenticateRequest(request: Request, env: Env): Promise<TSession | null> {
	const cookieHeader = request.headers.get('Cookie') || '';
	const match = cookieHeader.match(/session=([^;]+)/);
	const sessionId = match ? match[1] : null;
	if (!sessionId) return null;
	const sessionData = await env.MY_KV.get(`${SESSION_PREFIX}${sessionId}`);
	if (!sessionData) return null;
	const session: TSession = JSON.parse(sessionData);
	if (session.expiresAt < Date.now()) {
		await env.MY_KV.delete(`${SESSION_PREFIX}${sessionId}`);
		return null;
	}
	return session;
}
