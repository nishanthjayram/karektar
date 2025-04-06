// Window.tsx
import React from 'react'
import styles from './Window.module.css'
import WindowHeader from './WindowHeader/WindowHeader'

export type THeaderStyle = {
  container?: React.CSSProperties
  label?: React.CSSProperties
}

export type THeaderConfig = {
  label: string
  onClose?: () => void
}

export type TWindowConfig = {
  header: THeaderConfig
}

export type WindowProps = {
  config: TWindowConfig
  containerStyle?: React.CSSProperties
  contentStyle?: React.CSSProperties
  headerStyle?: THeaderStyle
  children?: React.ReactNode
}

const Window: React.FC<WindowProps> = ({
  config,
  children,
  containerStyle,
  headerStyle,
  contentStyle,
}) => {
  const { header } = config
  return (
    <div className={styles.container} style={containerStyle}>
      <WindowHeader config={header} headerStyle={headerStyle} />
      <div className={styles.content} style={contentStyle}>
        {children}
      </div>
    </div>
  )
}

export default Window
