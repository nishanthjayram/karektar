import React from 'react'
import { THeaderConfig } from '../Window'
import styles from './WindowHeader.module.css'

type TWindowHeaderProps = {
  className?: string
  header: THeaderConfig
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const WindowHeader: React.FC<TWindowHeaderProps> = ({
  className,
  header,
  onClick,
}) => {
  return (
    <div className={styles.container} onClick={onClick}>
      {/* Left fixed section */}
      <div className={styles.leftFixed}>
        <div className={styles.leftLines}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.line} />
          ))}
        </div>
        <div className={styles.square} />
      </div>

      {/* Fixed center text */}
      <span className={styles.headerText}>{header.title}</span>

      {/* Center section with text and lines */}
      <div className={styles.centerSection}>
        {/* Background lines that will scale */}
        <div className={styles.linesWrapper}>
          <div className={styles.linesContainer}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.line} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WindowHeader
