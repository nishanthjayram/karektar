// A canvas for drawing individual glyphs.
import {Dispatch, SetStateAction, useRef, useState} from 'react'
import styles from './Canvas.module.scss'
import {ReactComponent as Delete} from '../../assets/delete.svg'
import {EDITOR_SIZE, EMPTY_CELL, FILLED_CELL, LINE_COLOR} from '../../constants'

const Canvas = ({
  bitmapSize,
  glyphSet,
  setGlyphSet,
  activeGlyph,
}: {
  bitmapSize: number
  glyphSet: Map<string, boolean[]>
  setGlyphSet: Dispatch<SetStateAction<Map<string, boolean[]>>>
  activeGlyph: string | undefined
}) => {
  const gridFlag = useRef(false)
  const [drawFlag, setDrawFlag] = useState(true)
  const [captureFlag, setCaptureFlag] = useState(false)

  const glyphCanvas = activeGlyph ? glyphSet.get(activeGlyph) : undefined
  const p = EDITOR_SIZE / bitmapSize

  const updateCanvas = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!glyphCanvas || !canvas || !ctx) {
      return
    }

    if (!gridFlag.current) {
      drawCanvas(ctx)
      gridFlag.current = true
    }

    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = [idx % bitmapSize, Math.floor(idx / bitmapSize)]
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p + 1, y * p + 1, p - 1, p - 1)
    })
    ctx.closePath()
  }

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = LINE_COLOR

    ctx.beginPath()
    Array.from({length: bitmapSize - 1}, (_, i) => i + 1).forEach(i => {
      ctx.moveTo(i * p + 0.5, 1)
      ctx.lineTo(i * p + 0.5, EDITOR_SIZE)
      ctx.moveTo(1, i * p + 0.5)
      ctx.lineTo(EDITOR_SIZE, i * p + 0.5)
    })
    ctx.closePath()

    ctx.stroke()
  }

  const getMousePos = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = [
      Math.floor(evt.nativeEvent.offsetX / p),
      Math.floor(evt.nativeEvent.offsetY / p),
    ]
    if (x < 0 || y < 0 || x > bitmapSize - 1 || y > bitmapSize - 1) {
      return null
    }
    return bitmapSize * y + x
  }

  const updateCell = (idx: number, filled: boolean) => {
    if (!glyphCanvas) {
      return
    }
    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      const newGlyphCanvas = [...glyphCanvas]
      newGlyphCanvas[idx] = filled
      if (activeGlyph) {
        newGlyphSet.set(activeGlyph, newGlyphCanvas)
      }
      return newGlyphSet
    })
  }

  const handlePointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    const idx = getMousePos(evt)
    if (evt.buttons !== 1 || !glyphCanvas || idx === null) {
      return
    }

    evt.currentTarget.setPointerCapture(evt.pointerId)
    setDrawFlag(!glyphCanvas[idx])
    updateCell(idx, !glyphCanvas[idx])
  }

  const handlePointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    const idx = getMousePos(evt)
    if (evt.buttons !== 1 || !glyphCanvas || !captureFlag || idx === null) {
      return
    }
    updateCell(idx, drawFlag)
  }

  return (
    <div>
      <div className={styles.header} style={{width: EDITOR_SIZE}}>
        <div className={styles.text}>{activeGlyph}</div>
        <div className={styles.separator} />
        <Delete
          className={styles.deleteIcon}
          onClick={() =>
            setGlyphSet(oldGlyphSet => {
              const newGlyphSet = new Map(oldGlyphSet)
              const newGlyphCanvas = new Array<boolean>(bitmapSize ** 2).fill(false)
              if (activeGlyph) {
                newGlyphSet.set(activeGlyph, newGlyphCanvas)
              }
              return newGlyphSet
            })
          }
        />
      </div>
      <div
        className={styles.editor}
        style={{width: EDITOR_SIZE, height: EDITOR_SIZE}}
      >
        <canvas
          ref={updateCanvas}
          className={styles.canvas}
          width={EDITOR_SIZE}
          height={EDITOR_SIZE}
          onGotPointerCapture={() => setCaptureFlag(true)}
          onLostPointerCapture={() => setCaptureFlag(false)}
          onPointerDown={evt => handlePointerDown(evt)}
          onPointerMove={evt => handlePointerMove(evt)}
        />
      </div>
    </div>
  )
}

export default Canvas
