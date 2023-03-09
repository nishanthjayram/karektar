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

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!glyphCanvas || !ctx) {
      return
    }
    ctx.strokeStyle = '#ffffff'
    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = [idx % bitmapSize, Math.floor(idx / bitmapSize)]
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p + 1, y * p + 1, p - 1, p - 1)
      ctx.strokeRect(x * p + 1, y * p + 1, p - 1, p - 1)
    })
    ctx.closePath()
  }, [bitmapSize, glyphCanvas, p])

  const getMousePos = (
    canvas: HTMLCanvasElement,
    evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => {
    const rect = canvas.getBoundingClientRect()
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

  const handlePointer = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !glyphCanvas) {
      return
    }

    const idx = getMousePos(canvasRef.current, evt)
    if (evt.type === 'gotpointercapture') {
      setCaptureFlag(true)
    } else if (evt.type === 'lostpointercapture') {
      setCaptureFlag(false)
    } else if (evt.type === 'pointerdown' && evt.buttons === 1) {
      evt.currentTarget.setPointerCapture(evt.pointerId) // TODO: Check if using target property is required here.
      setDrawFlag(!glyphCanvas[idx])
      updateCell(idx, !glyphCanvas[idx])
    } else if (evt.type === 'pointermove' && captureFlag) {
      updateCell(idx, drawFlag)
    } else {
      return
    }
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
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onGotPointerCapture={evt => handlePointer(evt)}
        onLostPointerCapture={evt => handlePointer(evt)}
        onPointerDown={evt => handlePointer(evt)}
        onPointerMove={evt => handlePointer(evt)}
      />
    </div>
  )
}

export default Canvas
