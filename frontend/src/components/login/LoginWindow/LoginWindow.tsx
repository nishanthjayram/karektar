// LoginWindow.tsx
import { TLoginInfo, TUser } from '@/hooks/useLoginInfo'
import Window, { TWindowConfig } from '../../ui/Window/Window'
import styles from './LoginWindow.module.css'

const loginWindowConfig: TWindowConfig = {
  header: {
    title: 'Login',
    showLines: true,
    showSquare: true,
  },
}

type TLoginWindowProps = {
  loginInfo: TLoginInfo
}

const LoginWindow: React.FC<TLoginWindowProps> = ({ loginInfo }) => (
  <Window config={loginWindowConfig}>
    <Login
      user={loginInfo.user}
      handleGoogleLogin={loginInfo.handleGoogleLogin}
      handleLogout={loginInfo.handleLogout}
    />
  </Window>
)

type TLoginProps = {
  user: TUser | null
  handleGoogleLogin: () => void
  handleLogout: () => void
}

const Login: React.FC<TLoginProps> = ({ user, handleGoogleLogin, handleLogout }) => {
  return (
    <div className={styles.loginContent}>
      <span className={styles.welcomeText}>
        Welcome to Karektar 2.0, a web app for building and exporting custom bitmap
        fonts.
      </span>

      {user ? (
        <div className={styles.userInfo}>
          <p>Logged in as: {user.email}</p>
          <button className={styles.button} onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <button className={styles.button} onClick={handleGoogleLogin}>
            Continue with Google
          </button>
        </div>
      )}
    </div>
  )
}

export default LoginWindow
