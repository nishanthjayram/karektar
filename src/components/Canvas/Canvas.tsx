// A canvas for drawing individual glyphs.
import classnames from 'classnames'
import {Dispatch, SetStateAction, useState} from 'react'
import styles from './Canvas.module.scss'
import {ReactComponent as Eraser} from '../../assets/eraser.svg'
import {ReactComponent as Line} from '../../assets/line.svg'
import {ReactComponent as Pencil} from '../../assets/pencil.svg'
import {ReactComponent as Trash} from '../../assets/trash.svg'
import {EDITOR_SIZE, EMPTY_CELL, FILLED_CELL} from '../../constants'

type TTool = 'DRAW' | 'ERASE' | 'LINE'

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
  const [tool, setTool] = useState<TTool>('DRAW')
  const [captureFlag, setCaptureFlag] = useState(false)

  const glyphCanvas = activeGlyph ? glyphSet.get(activeGlyph) : undefined
  const p = EDITOR_SIZE / bitmapSize

  const updateCanvas = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')

    if (!glyphCanvas || !canvas || !ctx) {
      return
    }

    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = indexToPos(idx)
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p + 1, y * p + 1, p - 1, p - 1)
    })
    ctx.closePath()
  }

  const posToIndex = ([x, y]: number[]) => bitmapSize * y + x
  const indexToPos = (idx: number) => [
    idx % bitmapSize,
    Math.floor(idx / bitmapSize),
  ]

  const getMousePos = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = [
      Math.floor(evt.nativeEvent.offsetX / p),
      Math.floor(evt.nativeEvent.offsetY / p),
    ]
    if (x < 0 || y < 0 || x > bitmapSize - 1 || y > bitmapSize - 1) {
      return null
    }
    return [x, y]
  }

  const drawCells = (indices: number[], filled: boolean) => {
    if (!glyphCanvas) {
      return
    }

    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      const newGlyphCanvas = [...glyphCanvas]
      indices.forEach(idx => (newGlyphCanvas[idx] = filled))
      if (activeGlyph) {
        newGlyphSet.set(activeGlyph, newGlyphCanvas)
      }
      return newGlyphSet
    })
  }

  const handlePointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (evt.buttons !== 1 || !glyphCanvas) {
      return
    }

    const mousePos = getMousePos(evt)
    if (mousePos === null) {
      return
    }
    const idx = posToIndex(mousePos)

    evt.currentTarget.setPointerCapture(evt.pointerId)

    if (tool === 'DRAW') {
      drawCells([idx], true)
    } else if (tool === 'ERASE') {
      drawCells([idx], false)
    }
  }

  const handlePointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (evt.buttons !== 1 || !glyphCanvas || !captureFlag) {
      return
    }

    const mousePos = getMousePos(evt)
    if (mousePos === null) {
      return
    }
    const idx = posToIndex(mousePos)

    if (tool === 'DRAW') {
      drawCells([idx], true)
    } else if (tool === 'ERASE') {
      drawCells([idx], false)
    }
  }

  return (
    <div>
      <div className={styles.header} style={{width: EDITOR_SIZE}}>
        <div className={styles.text}>{activeGlyph}</div>
        <div className={styles.separator} />
        <div className={styles.toolbar}>
          <Pencil
            className={classnames(tool === 'DRAW' && styles.activeIcon, styles.icon)}
            onClick={() => setTool('DRAW')}
          />
          <Line
            className={classnames(tool === 'LINE' && styles.activeIcon, styles.icon)}
            onClick={() => setTool('LINE')}
          />
          <Eraser
            className={classnames(
              tool === 'ERASE' && styles.activeIcon,
              styles.icon,
            )}
            onClick={() => setTool('ERASE')}
          />
          <Trash
            className={styles.icon}
            style={{marginLeft: '9px', width: '16px'}}
            onClick={() =>
              setGlyphSet(oldGlyphSet => {
                const newGlyphSet = new Map(oldGlyphSet)
                const newGlyphCanvas = new Array<boolean>(bitmapSize ** 2).fill(
                  false,
                )
                if (activeGlyph) {
                  newGlyphSet.set(activeGlyph, newGlyphCanvas)
                }
                return newGlyphSet
              })
            }
          />
        </div>
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
