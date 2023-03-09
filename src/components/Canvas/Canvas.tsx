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

  const [mouseDownFlag, setMouseDownFlag] = useState(false)
  const [drawFlag, setDrawFlag] = useState(true)

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

  const handleMouse = (evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvasRef.current || !glyphCanvas) {
      return
    }

    const idx = getMousePos(canvasRef.current, evt)
    if (evt.type === 'mousedown' && evt.buttons === 1) {
      setMouseDownFlag(true)
      setDrawFlag(!glyphCanvas[idx])
      updateCell(idx, !glyphCanvas[idx])
    } else if (evt.type === 'mouseup' || evt.type === 'mouseleave') {
      setMouseDownFlag(false)
    } else if (evt.type === 'mouseover' && evt.buttons === 1) {
      setMouseDownFlag(true)
    } else if (evt.type === 'mousemove' && mouseDownFlag) {
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
        onMouseDown={evt => handleMouse(evt)}
        onMouseUp={evt => handleMouse(evt)}
        onMouseMove={evt => handleMouse(evt)}
        onMouseOver={evt => handleMouse(evt)}
        onMouseLeave={evt => handleMouse(evt)}
      />
    </div>
  )
}

export default Canvas
