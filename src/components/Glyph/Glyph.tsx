import classnames from 'classnames'
import {memo} from 'react'
import styles from './Glyph.module.scss'
import {TFont, TFontAction} from '../../types'
import {EMPTY_CELL, FILLED_CELL} from '../../utils/constants/canvas.constants'

const Glyph = ({
  glyph,
  fontState,
  fontDispatch,
}: {
  glyph: string
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}) => {
  const {activeGlyph, bitmapSize, glyphSet, glyphSetModal, glyphSize} = fontState
  const p = glyphSize / bitmapSize

  const glyphCanvas = glyphSet.get(glyph)

  const updateGlyph = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx || !glyphCanvas) {
      return
    }

    ctx.beginPath()
    glyphCanvas.forEach((value, idx) => {
      const [x, y] = [idx % bitmapSize, Math.floor(idx / bitmapSize)]
      ctx.fillStyle = value === 1 ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p, y * p, p, p)
    })
    ctx.closePath()
  }

  return (
    <div
      className={styles.glyph}
      onPointerDown={evt => {
        if (evt.buttons === 1) {
          fontDispatch({
            type: 'GLYPH_SET_ACTION',
            op: 'UPDATE_ACTIVE_GLYPH',
            newActiveGlyph: glyph,
          })
          if (glyphSetModal) {
            fontDispatch({
              type: 'GLYPH_SET_ACTION',
              op: 'UPDATE_GLYPH_SET_MODAL',
              newGlyphSetModal: false,
            })
          }
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
      <canvas ref={updateGlyph} width={glyphSize} height={glyphSize} />
    </div>
  )
}

export default memo(
  Glyph,
  (prevProps, nextProps) => prevProps.fontState === nextProps.fontState,
)
