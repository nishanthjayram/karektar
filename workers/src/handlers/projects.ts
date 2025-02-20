import { TProjectMetadata } from '@common/types';
import { Env } from '@/types';
import { authenticateRequest } from '@utils/session';
import { RESPONSE_MESSAGES, HTTP_STATUS, CONTENT_TYPE, PROJECT_PREFIX } from '@/constants';

export async function handleProjects(request: Request, env: Env, action: 'list' | 'save' | 'delete'): Promise<Response> {
	const session = await authenticateRequest(request, env);
	if (!session) {
		return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.NOT_AUTHENTICATED }), {
			status: HTTP_STATUS.UNAUTHORIZED,
			headers: { 'Content-Type': CONTENT_TYPE.JSON },
		});
	}
	switch (action) {
		case 'list': {
			const projectsList = await env.MY_KV.list({ prefix: `${PROJECT_PREFIX}:${session.userId}:` });
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
				headers: { 'Content-Type': CONTENT_TYPE.JSON },
			});
		}
		case 'save': {
			if (request.method !== 'POST') {
				return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.METHOD_NOT_ALLOWED }), {
					status: HTTP_STATUS.METHOD_NOT_ALLOWED,
					headers: { 'Content-Type': CONTENT_TYPE.JSON },
				});
			}
			const { id, metadata } = (await request.json()) as { id: string; metadata: TProjectMetadata };

			if (!id || !metadata) {
				return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.MISSING_FIELDS }), {
					status: HTTP_STATUS.BAD_REQUEST,
					headers: { 'Content-Type': CONTENT_TYPE.JSON },
				});
			}
			await env.MY_KV.put(`${PROJECT_PREFIX}:${session.userId}:${id}`, JSON.stringify(metadata));
			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': CONTENT_TYPE.JSON },
			});
		}
		case 'delete': {
			if (request.method !== 'DELETE') {
				return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.METHOD_NOT_ALLOWED }), {
					status: HTTP_STATUS.METHOD_NOT_ALLOWED,
					headers: { 'Content-Type': CONTENT_TYPE.JSON },
				});
			}
			const url = new URL(request.url);
			const projectId = url.searchParams.get('id');
			if (!projectId) {
				return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.NO_PROJECT_ID }), {
					status: HTTP_STATUS.BAD_REQUEST,
					headers: { 'Content-Type': CONTENT_TYPE.JSON },
				});
			}
			await env.MY_KV.delete(`${PROJECT_PREFIX}:${session.userId}:${projectId}`);
			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': CONTENT_TYPE.JSON },
			});
		}
		default:
			return new Response(JSON.stringify({ error: RESPONSE_MESSAGES.INVALID_ACTION }), {
				status: HTTP_STATUS.BAD_REQUEST,
				headers: { 'Content-Type': CONTENT_TYPE.JSON },
			});
	}
}
