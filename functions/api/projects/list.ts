import {
  CONTENT_TYPE,
  HTTP_STATUS,
  PROJECT_PREFIX,
  RESPONSE_MESSAGES,
} from '../../constants'
import { authenticateRequest } from '../../utils/session'

export const onRequest = async context => {
  const { request, env } = context

  const session = await authenticateRequest(request, env)
  if (!session) {
    return new Response(
      JSON.stringify({ error: RESPONSE_MESSAGES.NOT_AUTHENTICATED }),
      {
        status: HTTP_STATUS.UNAUTHORIZED,
        headers: { 'Content-Type': CONTENT_TYPE.JSON },
      },
    )
  }

  const projectsList = await env.MY_KV.list({
    prefix: `${PROJECT_PREFIX}:${session.userId}:`,
  })
  const projects: Record<string, any> = {}
  for (const key of projectsList.keys) {
    const projectData = await env.MY_KV.get(key.name, { type: 'text' })
    if (projectData) {
      const parts = key.name.split(':')
      const projectId = parts.slice(2).join(':')
      projects[projectId] = JSON.parse(projectData)
    }
  }

  return new Response(JSON.stringify(projects), {
    headers: { 'Content-Type': CONTENT_TYPE.JSON },
  })
}
