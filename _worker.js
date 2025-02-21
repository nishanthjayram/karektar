__NODE_VERSION__ = '20.9.0'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/auth')) {
    try {
      const workerUrl = process.env.WORKER_URL

      if (!workerUrl) {
        return new Response('Worker URL not configured', { status: 500 })
      }

      const workerOrigin = new URL(workerUrl)

      const targetUrl = new URL(request.url)
      targetUrl.protocol = workerOrigin.protocol
      targetUrl.hostname = workerOrigin.hostname
      targetUrl.pathname = url.pathname
      targetUrl.search = url.search

      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow', // Important: Follow redirects
      })

      const response = await fetch(modifiedRequest)

      const headers = new Headers(response.headers)

      if (response.status >= 300 && response.status < 400) {
        let redirectUrl = response.headers.get('Location')
        if (redirectUrl) {
          const redirectUrlParsed = new URL(redirectUrl)
          if (redirectUrlParsed.hostname !== url.hostname) {
            redirectUrlParsed.hostname = url.hostname
            headers.set('Location', redirectUrlParsed.toString())
          }
        }
      }

      return new Response(response.body, {
        status: response.status,
        headers: headers,
      })
    } catch (error) {
      console.error('Error in auth proxy function:', error)
      return new Response('Internal error', { status: 500 })
    }
  } else {
    return fetch(request)
  }
}
