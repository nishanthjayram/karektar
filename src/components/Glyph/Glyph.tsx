import classnames from 'classnames'
import {memo} from 'react'
import {Dispatch, SetStateAction} from 'react'
import styles from './Glyph.module.scss'
import {EMPTY_CELL, FILLED_CELL, GLYPH_SIZE} from '../../constants'
import {TFont, TFontAction} from '../../types'

const Glyph = ({
  glyph,
  fontState,
  fontDispatch,
}: {
  glyph: string
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}) => {
  const {activeGlyph, bitmapSize, glyphSet} = fontState
  const p = GLYPH_SIZE / bitmapSize

  const glyphCanvas = glyphSet.get(glyph)

  const updateGlyph = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx || !glyphCanvas) {
      return
    }

    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = [idx % bitmapSize, Math.floor(idx / bitmapSize)]
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
          fontDispatch({
            type: 'GLYPH_SET_ACTION',
            op: 'UPDATE_ACTIVE_GLYPH',
            newActiveGlyph: glyph,
          })
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
  (prevProps, nextProps) => prevProps.fontState === nextProps.fontState,
)
