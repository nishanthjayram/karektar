import classnames from 'classnames'
import styles from './GlyphCell.module.scss'

const GlyphCell = ({bitmapSize, filled}: {bitmapSize: number; filled: boolean}) => {
  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell,
      )}
      style={{
        width: `${48 / bitmapSize}px`,
        height: `${48 / bitmapSize}px`,
      }}
    />
  )
}

export default GlyphCell
