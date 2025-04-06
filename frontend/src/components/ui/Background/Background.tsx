import { DROPDOWN_BAR_CONFIG } from '@/constants/dropdown'
import DropdownBar from '../DropdownBar/DropdownBar'
import styles from './Background.module.css'

type BackgroundProps = {
  pixelSize?: number
  backgroundColor?: string
  patternColor?: string
}

const Background = ({
  pixelSize = 8,
  backgroundColor = '#808080',
  patternColor = 'black',
}: BackgroundProps) => {
  const pattern = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${pixelSize} ${pixelSize}"><rect width="${pixelSize}" height="${pixelSize}" fill="white"/><rect x="0" y="0" width="${pixelSize / 2}" height="${pixelSize / 2}" fill="${patternColor}"/><rect x="${pixelSize / 2}" y="${pixelSize / 2}" width="${pixelSize / 2}" height="${pixelSize / 2}" fill="${patternColor}"/></svg>')`

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor,
        backgroundImage: pattern,
        backgroundSize: `${pixelSize}px ${pixelSize}px`,
      }}
    />
  )
}

export default Background
