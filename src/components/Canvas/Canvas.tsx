// A canvas for drawing individual glyphs.
import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react'
import styles from './Canvas.module.scss'
import {ReactComponent as Delete} from '../../assets/delete.svg'
import {CANVAS_SIZE, EMPTY_CELL, FILLED_CELL} from '../../constants'

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const glyphCanvas = activeGlyph ? glyphSet.get(activeGlyph) : undefined
  const p = CANVAS_SIZE / bitmapSize

  const [drawFlag, setDrawFlag] = useState(true)
  const [captureFlag, setCaptureFlag] = useState(false)

  const drawCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.strokeStyle = '#ffffff'
    ctx.beginPath()
    for (let i = 1; i < bitmapSize; i++) {
      ctx.moveTo(i * p + 0.5, 1)
      ctx.lineTo(i * p + 0.5, CANVAS_SIZE)
      ctx.moveTo(1, i * p + 0.5)
      ctx.lineTo(CANVAS_SIZE, i * p + 0.5)
    }
    ctx.closePath()
    ctx.stroke()
  }

  const updateCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || !glyphCanvas) {
      return
    }
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = [idx % bitmapSize, Math.floor(idx / bitmapSize)]
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p + 1, y * p + 1, p - 1, p - 1)
    })
    ctx.closePath()
  }

  useEffect(drawCanvas, [bitmapSize, p])
  useEffect(updateCanvas, [bitmapSize, glyphCanvas, p])

  const getMousePos = (
    canvas: HTMLCanvasElement,
    evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => {
    const rect = canvas.getBoundingClientRect()

    if (
      evt.clientX < rect.left ||
      evt.clientX > rect.right ||
      evt.clientY < rect.top ||
      evt.clientY > rect.bottom
    ) {
      return null
    }

    const x = Math.floor((evt.clientX - rect.left) / p)
    const y = Math.floor((evt.clientY - rect.top) / p)
    return (
      ((x + bitmapSize) % bitmapSize) + (y + (bitmapSize % bitmapSize)) * bitmapSize
    )
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
    if (evt.buttons !== 1 || !canvasRef.current || !glyphCanvas) {
      return
    }

    const idx = getMousePos(canvasRef.current, evt)
    if (idx === null) {
      return
    }

    evt.currentTarget.setPointerCapture(evt.pointerId)
    setDrawFlag(!glyphCanvas[idx])
    updateCell(idx, !glyphCanvas[idx])
  }
  const handlePointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (evt.buttons !== 1 || !canvasRef.current || !glyphCanvas) {
      return
    }

    const idx = getMousePos(canvasRef.current, evt)
    if (idx === null || !captureFlag) {
      return
    }

    updateCell(idx, drawFlag)
  }

  return (
    <div>
      <div className={styles.header}>
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
      <div className={styles.editor}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
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
