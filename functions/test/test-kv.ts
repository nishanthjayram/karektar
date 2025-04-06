export const onRequest = async context => {
  const { env } = context
  const testKey = 'test-key'

  // Store a test value
  await env.MY_KV.put(testKey, 'Hello KV!', { expirationTtl: 600 })

  // Retrieve the test value
  const value = await env.MY_KV.get(testKey, { type: 'text' })

  return new Response(`Stored value: ${value}`)
}
