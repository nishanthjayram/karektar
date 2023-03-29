// A canvas for drawing individual glyphs.
import classnames from 'classnames'
import {Dispatch, SetStateAction, useState} from 'react'
import styles from './Canvas.module.scss'
import {ReactComponent as Ellipse} from '../../assets/ellipse.svg'
import {ReactComponent as Eraser} from '../../assets/eraser.svg'
import {ReactComponent as Line} from '../../assets/line.svg'
import {ReactComponent as Outline} from '../../assets/outline.svg'
import {ReactComponent as Pencil} from '../../assets/pencil.svg'
import {ReactComponent as Trash} from '../../assets/trash.svg'
import {EDITOR_SIZE, EMPTY_CELL, FILLED_CELL} from '../../constants'

type TTool = 'DRAW' | 'ERASE' | 'LINE' | 'ELLIPSE'

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
  const [range, setRange] = useState<number[][] | undefined>(undefined)

  const glyphCanvas = activeGlyph ? glyphSet.get(activeGlyph) : undefined
  const p = EDITOR_SIZE / bitmapSize

  const updateCanvas = (canvas: HTMLCanvasElement | null) => {
    if (canvas === null) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (ctx === null || glyphCanvas === undefined) {
      return
    }

    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      const [x, y] = indexToPos(idx)
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(x * p + 1, y * p + 1, p - 1, p - 1)
    })
    ctx.closePath()

    if (range !== undefined) {
      ctx.fillStyle = FILLED_CELL
      ctx.beginPath()
      if (tool === 'LINE') {
        plotLine(range[0], range[1]).forEach(idx => {
          const [x, y] = indexToPos(idx)
          ctx.fillRect(x * p + 1, y * p + 1, p - 1, p - 1)
        })
      } else if (tool === 'ELLIPSE') {
        plotEllipse(range[1], getDistance(range[0], range[1])).forEach(idx => {
          const [x, y] = indexToPos(idx)
          ctx.fillRect(x * p + 1, y * p + 1, p - 1, p - 1)
        })
      }
      ctx.closePath()
    }
  }

  const getDistance = ([x0, y0]: number[], [x1, y1]: number[]) => [
    Math.abs(x1 - x0),
    Math.abs(y1 - y0),
  ]
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
    if (activeGlyph === undefined || glyphCanvas === undefined) {
      return
    }

    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      const newGlyphCanvas = [...glyphCanvas]
      indices.forEach(idx => (newGlyphCanvas[idx] = filled))
      newGlyphSet.set(activeGlyph, newGlyphCanvas)
      return newGlyphSet
    })
  }

  const plotEllipse = ([xc, yc]: number[], [rx, ry]: number[]) => {
    const coords = []
    let [x, y] = [0, ry]

    let d1 = ry * ry - rx * rx * ry + 0.25 * rx * rx
    let dx = 2 * ry * ry * x
    let dy = 2 * rx * rx * y

    while (dx < dy) {
      coords.push(
        [x + xc, y + yc],
        [-x + xc, y + yc],
        [x + xc, -y + yc],
        [-x + xc, -y + yc],
      )

      if (d1 < 0) {
        x++
        dx = dx + 2 * ry * ry
        d1 = d1 + dx + ry * ry
      } else {
        x++
        y--
        dx = dx + 2 * ry * ry
        dy = dy - 2 * rx * rx
        d1 = d1 + dx - dy + ry * ry
      }
    }

    let d2 =
      ry * ry * ((x + 0.5) * (x + 0.5)) +
      rx * rx * ((y - 1) * (y - 1)) -
      rx * rx * ry * ry

    while (y >= 0) {
      coords.push(
        [x + xc, y + yc],
        [-x + xc, y + yc],
        [x + xc, -y + yc],
        [-x + xc, -y + yc],
      )

      if (d2 > 0) {
        y--
        dy = dy - 2 * rx * rx
        d2 = d2 + rx * rx - dy
      } else {
        y--
        x++
        dx = dx + 2 * ry * ry
        dy = dy - 2 * rx * rx
        d2 = d2 + dx - dy + rx * rx
      }
    }

    return coords.map(c => posToIndex(c))
  }

  const plotLine = ([x0, y0]: number[], [x1, y1]: number[]) => {
    const coords = []

    const dx = Math.abs(x1 - x0)
    const sx = x0 < x1 ? 1 : -1
    const dy = -Math.abs(y1 - y0)
    const sy = y0 < y1 ? 1 : -1
    let error = dx + dy

    for (;;) {
      coords.push([x0, y0])
      if (x0 === x1 && y0 === y1) {
        break
      }

      const e2 = 2 * error

      if (e2 >= dy) {
        if (x0 === x1) {
          break
        }
        error = error + dy
        x0 = x0 + sx
      }
      if (e2 <= dx) {
        if (y0 === y1) {
          break
        }
        error = error + dx
        y0 = y0 + sy
      }
    }

    return coords.map(c => posToIndex(c))
  }

  const handlePointerUp = () => {
    if (range === undefined) {
      return
    }

    drawCells(
      tool === 'LINE'
        ? plotLine(range[0], range[1])
        : plotEllipse(range[1], getDistance(range[0], range[1])),
      true,
    )
    setRange(undefined)
  }

  const handlePointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (evt.buttons !== 1) {
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
    } else if (tool === 'LINE' || tool === 'ELLIPSE') {
      setRange([mousePos, mousePos])
    }
  }

  const handlePointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (evt.buttons !== 1 || !captureFlag) {
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
    } else if (tool === 'LINE' || tool === 'ELLIPSE') {
      setRange(oldRange => {
        if (oldRange === undefined) {
          return
        }
        return [oldRange[0], mousePos]
      })
    }
  }

  return (
    <div>
      <div className={styles.header} style={{width: EDITOR_SIZE}}>
        <div className={styles.text}>{activeGlyph}</div>
        <div className={styles.separator} />
        <div className={styles.text}>{tool}</div>
        <div className={styles.toolbar}>
          <Pencil
            className={classnames(tool === 'DRAW' && styles.activeIcon, styles.icon)}
            onClick={() => setTool('DRAW')}
          />
          <Eraser
            className={classnames(
              tool === 'ERASE' && styles.activeIcon,
              styles.icon,
            )}
            onClick={() => setTool('ERASE')}
          />
          <Line
            className={classnames(tool === 'LINE' && styles.activeIcon, styles.icon)}
            onClick={() => setTool('LINE')}
          />
          <Ellipse
            className={classnames(
              tool === 'ELLIPSE' && styles.activeIcon,
              styles.icon,
            )}
            onClick={() => setTool('ELLIPSE')}
          />
          <Outline
            className={styles.icon}
            onClick={() => {
              if (activeGlyph === undefined || glyphCanvas === undefined) {
                return
              }
              setGlyphSet(oldGlyphSet => {
                const newGlyphSet = new Map(oldGlyphSet)
                const newGlyphCanvas = glyphCanvas.map(filled => !filled)
                newGlyphSet.set(activeGlyph, newGlyphCanvas)
                return newGlyphSet
              })
            }}
          />
          <Trash
            className={styles.icon}
            onClick={() => {
              if (activeGlyph === undefined) {
                return
              }
              setGlyphSet(oldGlyphSet => {
                const newGlyphSet = new Map(oldGlyphSet)
                const newGlyphCanvas = new Array<boolean>(bitmapSize ** 2).fill(
                  false,
                )
                newGlyphSet.set(activeGlyph, newGlyphCanvas)
                return newGlyphSet
              })
            }}
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
          onPointerUp={() => handlePointerUp()}
          onPointerDown={evt => handlePointerDown(evt)}
          onPointerMove={evt => handlePointerMove(evt)}
        />
      </div>
    </div>
  )
}

export default Canvas
