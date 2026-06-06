export type AuthUser = {
  email: string
  name: string
}

export const checkAuth = async () => {
  const response = await fetch('/api/auth/check', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to check session')
  }

  return (await response.json()) as AuthUser
}

export const beginGoogleLogin = () => {
  const loginUrl = new URL('/api/auth/google', window.location.origin)
  loginUrl.searchParams.set('uiOrigin', window.location.origin)
  window.location.href = loginUrl.toString()
}

export const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to log out')
  }
}
