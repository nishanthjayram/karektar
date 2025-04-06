import React from 'react'
import { THeaderConfig, THeaderStyle } from '../Window'
import styles from './WindowHeader.module.css'

export const DEFAULT_WINDOW_HEADER_LINE_COUNT = 6

type TWindowHeaderProps = {
  config: THeaderConfig
  lineCount?: number
  headerStyle?: THeaderStyle
}

export const WindowHeader: React.FC<TWindowHeaderProps> = ({
  config,
  headerStyle,
  lineCount = DEFAULT_WINDOW_HEADER_LINE_COUNT,
}) => {
  const { label: title, onClose } = config

  return (
    <div
      className={styles.container}
      style={headerStyle?.container}
      onClick={onClose}
    >
      <div className={styles.linesWrapper}>
        <div className={styles.linesContainer}>
          {[...Array(lineCount)].map((_, i) => (
            <div key={i} className={styles.line} />
          ))}
        </div>
      </div>

      <div className={styles.square} />

      <span className={styles.headerText} style={headerStyle?.label}>
        {title}
      </span>
    </div>
  )
}

export default WindowHeader
