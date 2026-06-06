export const encodeBase64Url = (input: string) =>
  btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export const decodeBase64Url = (input: string) => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  )

  return atob(paddedBase64)
}
