import classnames from 'classnames'
import Modal from 'react-modal'
import { ReactComponent as Next } from '../../assets/next.svg'
import { ReactComponent as Previous } from '../../assets/previous.svg'
import { TFontProps } from '../../types'
import Glyph from '../Glyph/Glyph'
import styles from './GlyphSet.module.scss'

const GlyphSet: React.FC<TFontProps> = ({ fontState, fontDispatch }) => {
  const { glyphSetModal } = fontState

  if (glyphSetModal === undefined) {
    return <Gallery fontState={fontState} fontDispatch={fontDispatch} />
  }

  return (
    <Modal
      isOpen={glyphSetModal}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <h2>GALLERY</h2>
      <Gallery fontState={fontState} fontDispatch={fontDispatch} />
    </Modal>
  )
}

const Gallery: React.FC<TFontProps> = ({ fontState, fontDispatch }) => {
  const { galleryPage, glyphSet, screenFlag } = fontState
  const pageLength = screenFlag ? 25 : 30
  const minPage = 0
  const maxPage = Math.ceil(glyphSet.size / pageLength) - 1

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
            onPointerUp={() =>
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
            onPointerUp={() =>
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
          .slice(galleryPage * pageLength, galleryPage * pageLength + pageLength)
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
