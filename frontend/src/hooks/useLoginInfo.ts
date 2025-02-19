// useLoginInfo.ts
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
          console.log('projects ahoy')
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    checkAuth()
  }, [loadProjects])

  const handleGoogleLogin = () => {
    const uiOrigin = encodeURIComponent(window.location.origin)

    const authUrl = `/auth/google?uiOrigin=${uiOrigin}`
    window.location.href = authUrl
  }

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

  const isLoginRoute = useIsLoginRoute()
  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login')
  }

  return { user, handleGoogleLogin, handleLogout, isLoginRoute, navigateToLogin }
}

// You probably just want to use a router, but I'm not going for anything that clean
const useIsLoginRoute = () => {
  const [isLoginRoute, setIsLoginRoute] = useState(() => {
    // Initialize with current path on mount
    return window.location.pathname === '/login'
  })

  useEffect(() => {
    // Function to check path
    const checkPath = () => {
      setIsLoginRoute(window.location.pathname === '/login')
    }

    // Listen for URL changes
    window.addEventListener('popstate', checkPath)

    // Handle manual URL changes (like history.pushState)
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
