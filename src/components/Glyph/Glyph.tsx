import classnames from 'classnames'
import {memo} from 'react'
import {Dispatch, SetStateAction} from 'react'
import styles from './Glyph.module.scss'
import {EMPTY_CELL, FILLED_CELL, GLYPH_SIZE} from '../../constants'
import {TFont, TFontAction} from '../../types'

const Glyph = ({
  glyph,
  font,
  updateFont,
}: {
  glyph: string
  font: TFont
  updateFont: React.Dispatch<TFontAction>
}) => {
  const {activeGlyph, bitmapSize, glyphSet} = font
  const p = GLYPH_SIZE / bitmapSize

  const glyphCanvas = glyphSet.get(glyph)

  const updateGlyph = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx || !glyphCanvas) {
      return
    }

    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = [idx % font.bitmapSize, Math.floor(idx / font.bitmapSize)]
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p, y * p, p, p)
    })
    ctx.closePath()
  }

  return (
    <div
      className={styles.glyph}
      onMouseDown={evt => {
        if (evt.buttons === 1) {
          updateFont({type: 'changeGlyph', newGlyph: glyph})
        }
      }}
    >
      <div
        className={classnames(
          glyph === activeGlyph && styles.activeSymbol,
          styles.symbol,
        )}
      >
        {glyph}
      </div>
      <canvas ref={updateGlyph} width={GLYPH_SIZE} height={GLYPH_SIZE} />
    </div>
  )
}

export default memo(
  Glyph,
  (prevProps, nextProps) => prevProps.font === nextProps.font,
)
