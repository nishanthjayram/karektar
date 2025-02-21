import { useEffect, useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'

export type TUser = {
  email: string
  name: string
}

export type TLoginInfo = {
  user: TUser | null
  handleGoogleLogin: () => void
  handleLogout: () => Promise<void>
  isLoginRoute: boolean
  navigateToLogin: () => void
}

export const useLoginInfo = (): TLoginInfo => {
  const [user, setUser] = useState<TUser | null>(null)
  const loadProjects = useProjectStore(state => state.loadProjects)

  // On mount, check if the user is already authenticated.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/check`, {
          credentials: 'include',
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          await loadProjects()
          console.log('Projects loaded')
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    checkAuth()
  }, [loadProjects])

  // Initiate OAuth by redirecting to the Worker endpoint.
  const handleGoogleLogin = () => {
    // Capture the UI's origin for later redirection.
    const uiOrigin = encodeURIComponent(window.location.origin)
    // Redirect to your Worker endpoint (e.g. /auth/google) that builds the Google OAuth URL.
    const authUrl = `/auth/google?uiOrigin=${uiOrigin}`
    window.location.href = authUrl
  }

  // Log out the user by calling the logout endpoint.
  const handleLogout = async () => {
    try {
      await fetch(`/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Helper hook to detect if the current route is '/login'.
  const isLoginRoute = useIsLoginRoute()
  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login')
  }

  return { user, handleGoogleLogin, handleLogout, isLoginRoute, navigateToLogin }
}

const useIsLoginRoute = () => {
  const [isLoginRoute, setIsLoginRoute] = useState(
    () => window.location.pathname === '/login',
  )

  useEffect(() => {
    const checkPath = () => {
      setIsLoginRoute(window.location.pathname === '/login')
    }

    // Listen to URL changes
    window.addEventListener('popstate', checkPath)
    const originalPushState = window.history.pushState
    window.history.pushState = function (
      state: any,
      unused: string,
      url?: string | URL | null,
    ) {
      originalPushState.call(this, state, unused, url)
      checkPath()
    }

    return () => {
      window.removeEventListener('popstate', checkPath)
      window.history.pushState = originalPushState
    }
  }, [])

  return isLoginRoute
}
