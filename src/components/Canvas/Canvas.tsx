// A canvas for drawing individual glyphs.
import {IconProp} from '@fortawesome/fontawesome-svg-core'
import {faCircle, faSquare, faTrashAlt} from '@fortawesome/free-regular-svg-icons'
import {
  faCircleHalfStroke,
  faEraser,
  faFill,
  faPencil,
  faRedo,
  faShapes,
  faSlash,
  faUndo,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import classnames from 'classnames'
import {Dispatch, SetStateAction, useState} from 'react'
import styles from './Canvas.module.scss'
import {EDITOR_SIZE, EMPTY_CELL, FILLED_CELL} from '../../constants'
import {THistory, TPos, TRange, TRect, TTool} from '../../types'
import {assertUnreachable, initialGlyphState} from '../../utils'
import 'tippy.js/dist/tippy.css'
import {compareArrays} from '../../utils'

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
  const [currTool, setCurrTool] = useState<TTool>('DRAW')
  const [captureFlag, setCaptureFlag] = useState(false)
  const [range, setRange] = useState<TRange | undefined>(undefined)
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false)
  const [canvasHistory, setCanvasHistory] = useState<THistory>(() => [
    [initialGlyphState(bitmapSize)],
    0,
  ])

  const glyphCanvas = activeGlyph ? glyphSet.get(activeGlyph) : undefined
  const p = EDITOR_SIZE / bitmapSize

  const drawCanvas = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx || !glyphCanvas) {
      return
    }

    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(...getRect(idx))
    })
    ctx.closePath()

    if (range !== undefined) {
      const [startPos, endPos] = range
      ctx.fillStyle = FILLED_CELL

      const cells =
        currTool === 'LINE'
          ? plotLine(startPos, endPos)
          : currTool === 'RECTANGLE'
          ? plotRect(startPos, endPos)
          : currTool === 'ELLIPSE'
          ? plotEllipse(endPos, getDistance(startPos, endPos))
          : []

      ctx.beginPath()
      cells.forEach(idx => ctx.fillRect(...getRect(idx)))
      ctx.closePath()
    }
  }

  const updateCells = (indices: number[], filled: boolean) => {
    if (activeGlyph === undefined || glyphCanvas === undefined) {
      return
    }

    const newGlyphCanvas = [...glyphCanvas]
    indices.forEach(idx => (newGlyphCanvas[idx] = filled))

    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      newGlyphSet.set(activeGlyph, newGlyphCanvas)
      return newGlyphSet
    })

    return newGlyphCanvas
  }

  const checkPos = ([x, y]: TPos) =>
    x >= 0 && y >= 0 && x <= bitmapSize - 1 && y <= bitmapSize - 1

  const getMousePos = (evt: React.PointerEvent<HTMLCanvasElement>): TPos | null => {
    const [x, y] = [
      Math.floor(evt.nativeEvent.offsetX / p),
      Math.floor(evt.nativeEvent.offsetY / p),
    ]
    return checkPos([x, y]) ? [x, y] : null
  }

  const posToIndex = (pos: TPos): number => bitmapSize * pos[1] + pos[0]
  const indexToPos = (idx: number): TPos => [
    idx % bitmapSize,
    Math.floor(idx / bitmapSize),
  ]

  const getDistance = ([x0, y0]: TPos, [x1, y1]: TPos): TPos => [
    Math.abs(x1 - x0),
    Math.abs(y1 - y0),
  ]
  const getRect = (idx: number): TRect => {
    const [x, y] = indexToPos(idx)
    return [x * p + 1, y * p + 1, p - 1, p - 1]
  }

  const plotLine = ([x0, y0]: TPos, [x1, y1]: TPos) => {
    const coords = new Array<TPos>()

    const dx = Math.abs(x1 - x0)
    const sx = x0 < x1 ? 1 : -1
    const dy = -Math.abs(y1 - y0)
    const sy = y0 < y1 ? 1 : -1
    let error = dx + dy

    while (true) {
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

  const plotRect = ([x0, y0]: TPos, [x1, y1]: TPos) => {
    const coords = new Array<TPos>()
    for (let i = x0; i <= x1; i++) {
      coords.push([i, y0])
      coords.push([i, y1])
    }
    for (let j = y0; j <= y1; j++) {
      coords.push([x0, j])
      coords.push([x1, j])
    }
    return coords.map(c => posToIndex(c))
  }

  const plotEllipse = ([xc, yc]: TPos, [rx, ry]: TPos) => {
    const coords = new Array<TPos>()
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

  const fill = (start: TPos) => {
    if (glyphCanvas === undefined || glyphCanvas[posToIndex(start)]) {
      return
    }

    const queue = [start]
    const visited = new Array<TPos>()

    while (queue.length > 0) {
      const pos = queue.pop()

      if (pos === undefined) {
        break
      }

      const [x, y] = pos
      const cells: TPos[] = [
        [x, y],
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]
      cells.forEach(c => {
        if (
          checkPos(c) &&
          !visited.some(e => e.join() === c.join()) &&
          !glyphCanvas[posToIndex(c)]
        ) {
          queue.push(c)
          visited.push(c)
        }
      })
    }

    updateCells(
      visited.map(c => posToIndex(c)),
      true,
    )
  }

  const updateHistory = (newState?: boolean[]) => {
    const update = newState ?? glyphCanvas
    setCanvasHistory(oldCanvasHistory => {
      const [oldStates, oldIndex] = oldCanvasHistory
      return update === undefined || compareArrays(oldStates[oldIndex], update)
        ? oldCanvasHistory
        : [[...oldStates.slice(0, oldIndex + 1), update], oldIndex + 1]
    })
  }

  const handlePointerUp = () => {
    if (range !== undefined) {
      const [startPos, endPos] = range

      const cells =
        currTool === 'LINE'
          ? plotLine(startPos, endPos)
          : currTool === 'RECTANGLE'
          ? plotRect(startPos, endPos)
          : currTool === 'ELLIPSE'
          ? plotEllipse(endPos, getDistance(startPos, endPos))
          : []

      updateHistory(updateCells(cells, true))
      setRange(undefined)
    } else {
      updateHistory()
    }
  }

  const handlePointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (evt.buttons !== 1) {
      return
    }

    if (shapeMenuOpen) {
      setShapeMenuOpen(!shapeMenuOpen)
      return
    }

    const mousePos = getMousePos(evt)
    if (mousePos === null) {
      return
    }

    const idx = posToIndex(mousePos)
    evt.currentTarget.setPointerCapture(evt.pointerId)

    switch (currTool) {
      case 'DRAW': {
        return updateCells([idx], true)
      }
      case 'ERASE': {
        return updateCells([idx], false)
      }
      case 'LINE':
      case 'RECTANGLE':
      case 'ELLIPSE': {
        return setRange([mousePos, mousePos])
      }
      case 'FILL': {
        return fill(mousePos)
      }
      case 'INVERT':
      case 'CLEAR':
      case 'UNDO':
      case 'REDO': {
        return
      }
      default: {
        return assertUnreachable(currTool)
      }
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

    switch (currTool) {
      case 'DRAW': {
        return updateCells([idx], true)
      }
      case 'ERASE': {
        return updateCells([idx], false)
      }
      case 'LINE':
      case 'RECTANGLE':
      case 'ELLIPSE': {
        return setRange(oldRange =>
          oldRange !== undefined ? [oldRange[0], mousePos] : oldRange,
        )
      }
      case 'FILL':
      case 'INVERT':
      case 'CLEAR':
      case 'UNDO':
      case 'REDO': {
        return
      }
      default: {
        return assertUnreachable(currTool)
      }
    }
  }

  const handleInvert = () => {
    if (activeGlyph === undefined || glyphCanvas === undefined) {
      return
    }

    const newGlyphCanvas = glyphCanvas.map(filled => !filled)
    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      newGlyphSet.set(activeGlyph, newGlyphCanvas)
      return newGlyphSet
    })
    updateHistory(newGlyphCanvas)
  }

  const handleClear = () => {
    if (activeGlyph === undefined || glyphCanvas === undefined) {
      return
    }

    const newGlyphCanvas = initialGlyphState(bitmapSize)
    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      newGlyphSet.set(activeGlyph, newGlyphCanvas)
      return newGlyphSet
    })
    updateHistory(newGlyphCanvas)
  }

  const handleUndo = () => {
    if (activeGlyph === undefined) {
      return
    }

    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      newGlyphSet.set(activeGlyph, canvasHistory[0][canvasHistory[1] - 1])
      return newGlyphSet
    })

    setCanvasHistory(oldCanvasHistory => [
      oldCanvasHistory[0],
      oldCanvasHistory[1] - 1,
    ])
  }

  const handleRedo = () => {
    if (activeGlyph === undefined) {
      return
    }

    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map(oldGlyphSet)
      newGlyphSet.set(activeGlyph, canvasHistory[0][canvasHistory[1] + 1])
      return newGlyphSet
    })

    setCanvasHistory(oldCanvasHistory => [
      oldCanvasHistory[0],
      oldCanvasHistory[1] + 1,
    ])
  }

  const isShapeTool = (tool: TTool) =>
    tool === 'LINE' || tool === 'RECTANGLE' || tool === 'ELLIPSE'

  const Tool = ({icon, tool}: {icon: IconProp; tool: TTool}) => (
    <Tippy placement={isShapeTool(tool) ? 'right' : 'top'} content={tool}>
      <FontAwesomeIcon
        icon={icon}
        className={classnames(
          currTool === tool && styles.activeIcon,
          tool === 'CLEAR' && glyphCanvas?.every(v => !v) && styles.disabledIcon,
          tool === 'UNDO' && canvasHistory[1] === 0 && styles.disabledIcon,
          tool === 'REDO' &&
            canvasHistory[1] === canvasHistory[0].length - 1 &&
            styles.disabledIcon,
          styles.icon,
        )}
        onClick={() => {
          if (captureFlag) {
            return
          }

          setShapeMenuOpen(false)

          switch (tool) {
            case 'DRAW':
            case 'ERASE':
            case 'LINE':
            case 'RECTANGLE':
            case 'ELLIPSE':
            case 'FILL': {
              return setCurrTool(tool)
            }
            case 'INVERT': {
              return handleInvert()
            }
            case 'CLEAR': {
              return handleClear()
            }
            case 'UNDO': {
              return handleUndo()
            }
            case 'REDO': {
              return handleRedo()
            }
            default:
              return assertUnreachable(tool)
          }
        }}
      />
    </Tippy>
  )

  const ShapeMenu = () => (
    <Tippy placement="top" content={isShapeTool(currTool) ? currTool : 'SHAPES'}>
      <div>
        <FontAwesomeIcon
          icon={
            currTool === 'LINE'
              ? faSlash
              : currTool === 'RECTANGLE'
              ? faSquare
              : currTool === 'ELLIPSE'
              ? faCircle
              : faShapes
          }
          className={classnames(
            currTool === 'LINE' && styles.activeIcon,
            currTool === 'RECTANGLE' && styles.activeIcon,
            currTool === 'ELLIPSE' && styles.activeIcon,
            styles.icon,
          )}
          onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
        />
        <div
          className={classnames(
            !shapeMenuOpen && styles.shapeMenu,
            shapeMenuOpen && styles.shapeMenuOpen,
          )}
        >
          <Tool icon={faSlash} tool="LINE" />
          <Tool icon={faCircle} tool="ELLIPSE" />
          <Tool icon={faSquare} tool="RECTANGLE" />
        </div>
      </div>
    </Tippy>
  )

  return (
    <div>
      <div className={styles.header} style={{width: EDITOR_SIZE}}>
        <div className={styles.text}>{activeGlyph}</div>
        <div className={styles.separator} />
        <div className={styles.toolbar}>
          <Tool icon={faPencil} tool="DRAW" />
          <Tool icon={faEraser} tool="ERASE" />
          <ShapeMenu />
          <Tool icon={faFill} tool="FILL" />
          <Tool icon={faCircleHalfStroke} tool="INVERT" />
          <Tool icon={faTrashAlt} tool="CLEAR" />
          <Tool icon={faUndo} tool="UNDO" />
          <Tool icon={faRedo} tool="REDO" />
        </div>
      </div>
      <div
        className={styles.editor}
        style={{width: EDITOR_SIZE, height: EDITOR_SIZE}}
      >
        <canvas
          ref={drawCanvas}
          className={styles.canvas}
          width={EDITOR_SIZE}
          height={EDITOR_SIZE}
          onGotPointerCapture={() => setCaptureFlag(true)}
          onLostPointerCapture={() => setCaptureFlag(false)}
          onPointerUp={handlePointerUp}
          onPointerDown={evt => handlePointerDown(evt)}
          onPointerMove={evt => handlePointerMove(evt)}
        />
      </div>
    </div>
  )
}

export default Canvas
