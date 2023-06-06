import classnames from 'classnames'
import {useState} from 'react'
import styles from './GlyphSet.module.scss'
import {ReactComponent as Next} from '../../assets/next.svg'
import {ReactComponent as Previous} from '../../assets/previous.svg'
import {PAGE_LENGTH} from '../../constants'
import {TFont, TFontAction} from '../../types'
import Glyph from '../Glyph/Glyph'

const GlyphSet = ({
  fontState,
  fontDispatch,
}: {
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}) => {
  const {glyphSet} = fontState
  const [page, setPage] = useState(0)
  const minPage = 0
  const maxPage = Math.ceil(glyphSet.size / PAGE_LENGTH) - 1

  if (glyphSet.size === 0) {
    console.log('glyph set emptied')
    return <div className={styles.glyphSet} />
  }
  return (
    <div className={styles.glyphSet}>
      <div className={styles.navBar}>
        <div className={styles.page}>{`${page + 1}/${maxPage + 1}`}</div>
        <div className={styles.navControls}>
          <Previous
            className={classnames(
              page === minPage && styles.navButtonDisabled,
              styles.navButton,
            )}
            onClick={() => {
              if (page > minPage) {
                setPage(page - 1)
              }
            }}
          />
          <Next
            className={classnames(
              page === maxPage && styles.navButtonDisabled,
              styles.navButton,
            )}
            onClick={() => {
              if (page < maxPage) {
                setPage(page + 1)
              }
            }}
          />
        </div>
      </div>
      <div className={styles.gallery}>
        {[...glyphSet.keys()]
          .slice(page * PAGE_LENGTH, page * PAGE_LENGTH + PAGE_LENGTH)
          .map(symbol => (
            <Glyph
              key={symbol}
              glyph={symbol}
              fontState={fontState}
              fontDispatch={fontDispatch}
            />
          ))}
      </div>
    </div>
  )
}

export default GlyphSet
