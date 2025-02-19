export async function onRequest(context) {
  try {
    const { request } = context
    const originalUrl = new URL(request.url)

    const workerOrigin = new URL('https://karektar-api.nishanthjayram.workers.dev')

    const targetUrl = new URL(request.url)
    targetUrl.protocol = workerOrigin.protocol
    targetUrl.hostname = workerOrigin.hostname

    return await fetch(targetUrl.toString(), request)
  } catch (error) {
    console.error('Error in auth proxy function:', error)
    return new Response('Internal error', { status: 500 })
  }
}
