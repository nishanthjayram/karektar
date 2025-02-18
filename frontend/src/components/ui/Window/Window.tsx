// Example.tsx
import React from 'react'
import styles from './Window.module.css'
import WindowHeader from './WindowHeader/WindowHeader'

export type THeaderConfig = {
  title: string
  showLines?: boolean
  showSquare?: boolean
}

export type TWindowConfig = {
  header: THeaderConfig
}

type TWindowProps = {
  config: TWindowConfig
  children?: React.ReactNode
}

const Window: React.FC<TWindowProps> = ({ config, children }) => {
  return (
    <div className={styles.container}>
      <WindowHeader
        header={{
          title: 'Login',
        }}
      />
      <div className={styles.content}>{children}</div>
    </div>
  )
}

export default Window
