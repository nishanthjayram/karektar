export async function onRequest(context) {
  try {
    const { request } = context
    const originalUrl = new URL(request.url)

    // Set the target worker URL
    const workerOrigin = new URL('https://karektar-api.nishanthjayram.workers.dev')

    // Build a new URL using the original pathname and query,
    // but replace the host and protocol with that of the worker.
    const targetUrl = new URL(request.url)
    targetUrl.protocol = workerOrigin.protocol
    targetUrl.hostname = workerOrigin.hostname

    // Forward the request to the worker.
    return await fetch(targetUrl.toString(), request)
  } catch (error) {
    console.error('Error in auth proxy function:', error)
    return new Response('Internal error', { status: 500 })
  }
}
