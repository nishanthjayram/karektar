import classnames from 'classnames'
import {memo} from 'react'
import {Dispatch, SetStateAction} from 'react'
import styles from './Glyph.module.scss'
import GlyphCell from '../GlyphCell/GlyphCell'

export type TGlyphState = boolean[]

const Glyph = ({
  bitmapSize,
  glyph,
  glyphCanvas,
  active,
  setActiveGlyph,
}: {
  bitmapSize: number
  glyph: string
  glyphCanvas: boolean[]
  active: boolean
  setActiveGlyph: Dispatch<SetStateAction<string | undefined>>
}) => {
  return (
    <div className={styles.glyph} onClick={() => setActiveGlyph(glyph)}>
      <div className={classnames(active && styles.activeSymbol, styles.symbol)}>
        {glyph}
      </div>

      <div className={styles.canvas}>
        {glyphCanvas.map((isFilled, index) => (
          <GlyphCell key={index} bitmapSize={bitmapSize} filled={isFilled} />
        ))}
      </div>
    </div>
  )
}

export default memo(
  Glyph,
  (prevProps, nextProps) =>
    prevProps.active === nextProps.active &&
    prevProps.glyphCanvas === nextProps.glyphCanvas,
)
