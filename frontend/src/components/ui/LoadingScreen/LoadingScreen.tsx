import { useEffect, useState } from 'react'
import styles from './LoadingScreen.module.css'

const LoadingScreen = () => {
  const letters = ['K', 'A', 'R', 'E', 'K', 'T', 'A', 'R']
  const [activeIndex, setActiveIndex] = useState(0)

  const NORMAL_SPEED = 150
  const SLOW_SPEED = 175

  // Handle the animation
  useEffect(() => {
    const isLastLetter = activeIndex === letters.length - 1
    const interval = setInterval(
      () => {
        setActiveIndex(prev => (prev + 1) % letters.length)
      },
      isLastLetter ? SLOW_SPEED : NORMAL_SPEED,
    )
    return () => clearInterval(interval)
  }, [activeIndex, letters.length])

  return (
    <div className={styles.container}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className={`${styles.letter} ${index === activeIndex ? styles.active : ''}
          }`}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}

export default LoadingScreen
