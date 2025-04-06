export const encodeBase64Url = (input: string) => {
  return btoa(input)
    .replace(/\+/g, '-') // Replace `+` with `-`
    .replace(/\//g, '_') // Replace `/` with `_`
    .replace(/=+$/, '') // Remove `=`
}

export const decodeBase64Url = (input: string) => {
  // Replace Base64URL characters with standard Base64 characters
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if necessary
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  )
  return atob(paddedBase64)
}
