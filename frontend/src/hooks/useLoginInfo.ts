import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'

export type TUser = {
  email: string
  name: string
}

export type TLoginInfo = {
  user: TUser | null
  handleGoogleLogin: () => void
  handleLogout: () => Promise<void>
  loading: boolean
}

export const useLoginInfo = (): TLoginInfo => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<TUser | null>(null)

  const navigate = useNavigate()
  const loadProjects = useProjectStore(state => state.loadProjects)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔄 Running authentication check...')
        const response = await fetch(`/api/auth/check`, { credentials: 'include' })
        console.log('Response status:', response.status)

        if (response.ok) {
          const userData = await response.json()
          console.log('✅ User authenticated:', userData)
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          await loadProjects()
        } else {
          console.log('❌ User not authenticated, clearing session')
          setUser(null)
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('⚠️ Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [loadProjects])

  useEffect(() => {
    console.log('🔍 Checking redirect conditions:')
    console.log('- loading:', loading)
    console.log('- user:', user)

    if (!loading && user === null) {
      console.log('🔄 Redirecting to login page...')
      navigate('/login', { replace: true }) // Redirect once after loading completes
    }
  }, [loading, user])

  const handleGoogleLogin = () => {
    console.log('🌐 Redirecting to Google Login')
    const uiOrigin = encodeURIComponent(window.location.origin)
    window.location.href = `/api/auth/google?uiOrigin=${uiOrigin}`
  }

  const handleLogout = async () => {
    console.log('🚪 Logging out...')
    try {
      await fetch(`/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('❌ Logout failed:', error)
    }
  }

  return {
    user,
    loading,
    handleGoogleLogin,
    handleLogout,
  }
}
