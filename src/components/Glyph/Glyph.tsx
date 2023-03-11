import classnames from 'classnames'
import {memo, useEffect, useRef} from 'react'
import {Dispatch, SetStateAction} from 'react'
import styles from './Glyph.module.scss'
import {EMPTY_CELL, FILLED_CELL, GLYPH_SIZE} from '../../constants'

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
  const glyphRef = useRef<HTMLCanvasElement | null>(null)
  const p = GLYPH_SIZE / bitmapSize

  useEffect(() => {
    const ctx = glyphRef.current?.getContext('2d')
    if (!ctx) {
      return
    }

    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = [idx % bitmapSize, Math.floor(idx / bitmapSize)]
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p, y * p, p, p)
    })
    ctx.closePath()
  }, [bitmapSize, glyphCanvas, p])

  return (
    <div className={styles.glyph} onClick={() => setActiveGlyph(glyph)}>
      <div className={classnames(active && styles.activeSymbol, styles.symbol)}>
        {glyph}
      </div>
      <canvas ref={glyphRef} width={GLYPH_SIZE} height={GLYPH_SIZE} />
    </div>
  )
}

export default memo(
  Glyph,
  (prevProps, nextProps) =>
    prevProps.active === nextProps.active &&
    prevProps.glyphCanvas === nextProps.glyphCanvas,
)
