import classnames from 'classnames'
import styles from './GlyphSet.module.scss'
import {ReactComponent as Next} from '../../assets/next.svg'
import {ReactComponent as Previous} from '../../assets/previous.svg'
import {TFont, TFontAction} from '../../types'
import {PAGE_LENGTH} from '../../utils/constants/glyphset.constants'
import Glyph from '../Glyph/Glyph'

const GlyphSet = ({
  fontState,
  fontDispatch,
}: {
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}) => {
  const {galleryPage, glyphSet} = fontState
  const minPage = 0
  const maxPage = Math.ceil(glyphSet.size / PAGE_LENGTH) - 1

  if (glyphSet.size === 0) {
    return <div className={styles.glyphSet} />
  }
  return (
    <div className={styles.glyphSet}>
      <div className={styles.navBar}>
        <div className={styles.page}>{`${galleryPage + 1}/${maxPage + 1}`}</div>
        <div className={styles.navControls}>
          <Previous
            className={classnames(
              galleryPage === minPage && styles.navButtonDisabled,
              styles.navButton,
            )}
            onClick={() =>
              fontDispatch({
                type: 'GLYPH_SET_ACTION',
                op: 'UPDATE_GALLERY_PAGE',
                newGalleryPage: galleryPage - 1,
              })
            }
          />
          <Next
            className={classnames(
              galleryPage === maxPage && styles.navButtonDisabled,
              styles.navButton,
            )}
            onClick={() =>
              fontDispatch({
                type: 'GLYPH_SET_ACTION',
                op: 'UPDATE_GALLERY_PAGE',
                newGalleryPage: galleryPage + 1,
              })
            }
          />
        </div>
      </div>
      <div className={styles.gallery}>
        {[...glyphSet.keys()]
          .slice(galleryPage * PAGE_LENGTH, galleryPage * PAGE_LENGTH + PAGE_LENGTH)
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
