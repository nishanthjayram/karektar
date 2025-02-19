export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  // Define your worker's URL (the dynamic backend)
  const workerOrigin = 'https://karektar-api.nishanthjayram.workers.dev'

  // Construct the target URL by replacing the host with your worker's host.
  // This keeps the same pathname and query.
  url.hostname = new URL(workerOrigin).hostname
  url.protocol = new URL(workerOrigin).protocol

  // Optionally, log the target URL for debugging
  // console.log("Proxying request to:", url.toString());

  // Forward the request to your Worker
  return fetch(url.toString(), request)
}
