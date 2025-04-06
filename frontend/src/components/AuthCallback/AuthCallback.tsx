import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const processOAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')

      if (!code || !state) {
        console.error('❌ Missing OAuth parameters')
        navigate('/login', { replace: true })
        return
      }

      console.log('🔄 OAuth callback detected! Exchanging code for session...')

      try {
        const response = await fetch(
          `/api/auth/callback?code=${code}&state=${state}`,
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const data = await response.json()
        console.log('✅ OAuth Success! Data:', data)

        // ✅ Store only user-relevant info
        localStorage.setItem('user', JSON.stringify(data.userData))

        // ✅ Clear URL params and redirect
        window.history.replaceState({}, '', '/')
        navigate('/', { replace: true })
      } catch (error) {
        console.error('❌ OAuth exchange failed:', error)
        navigate('/login', { replace: true })
      }
    }

    processOAuth()
  }, [navigate])

  return <p>Authenticating...</p>
}

export default AuthCallback
