import classnames from 'classnames'
import styles from './GlyphCell.module.scss'

const GlyphCell = ({filled}: {filled: boolean}) => {
  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell,
      )}
    />
  )
}

export default GlyphCell
