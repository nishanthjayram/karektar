import {Dispatch, SetStateAction} from 'react'
import styles from './Glyph.module.scss'
import GlyphCell from '../GlyphCell/GlyphCell'

export type TGlyphState = boolean[]

const Glyph = ({
  glyph,
  glyphCanvas,
  setActiveGlyph,
}: {
  glyph: string
  glyphCanvas: boolean[]
  setActiveGlyph: Dispatch<SetStateAction<string>>
}) => {
  return (
    <div className={styles.glyph}>
      <div className={styles.symbol}>{glyph}</div>
      <div className={styles.canvas} onClick={() => setActiveGlyph(glyph)}>
        {glyphCanvas.map((isFilled, index) => (
          <GlyphCell key={index} filled={isFilled} />
        ))}
      </div>
    </div>
  )
}

export default Glyph
