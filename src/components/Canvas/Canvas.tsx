// A canvas for drawing individual glyphs.
import {IconProp} from '@fortawesome/fontawesome-svg-core'
import {faCircle, faSquare, faTrashAlt} from '@fortawesome/free-regular-svg-icons'
import {
  faA,
  faCircleHalfStroke,
  faEraser,
  faFill,
  faGear,
  faPencil,
  faRedo,
  faShapes,
  faSlash,
  faTextHeight,
  faUndo,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import classnames from 'classnames'
import {useState} from 'react'
import styles from './Canvas.module.scss'
import {
  EDITOR_SIZE,
  EMPTY_CELL,
  FILLED_CELL,
  GRIDLINE_COLOR,
  GUIDELINE_COLOR,
  HLINE_POS,
  VLINE_POS,
} from '../../constants'
import {
  TCanvasButton,
  TCanvasTool,
  TFont,
  TFontAction,
  TPos,
  TRect,
} from '../../types'
import {assertUnreachable, initializeGlyph} from '../../utils'
import 'tippy.js/dist/tippy.css'

type TMenu = undefined | 'SHAPES' | 'OPTIONS'

const Canvas = ({
  fontState,
  fontDispatch,
}: {
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}) => {
  const {
    bitmapSize,
    activeGlyph,
    glyphSet,
    currentTool,
    shapeRange,
    canvasHistory,
    historyIndex,
    captureFlag,
  } = fontState

  const [activeMenu, setActiveMenu] = useState<TMenu>(undefined)
  const [modelFlag, setModelFlag] = useState(true)
  const [guideFlag, setGuideFlag] = useState(true)
  const p = EDITOR_SIZE / bitmapSize
  const glyphCanvas = glyphSet.get(activeGlyph)

  // TODO: Replace this empty div container with a loading animation.
  if (!glyphCanvas) {
    return <div />
  }

  const drawCanvas = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx) {
      return
    }

    // Draw the gridlines of the canvas.
    ctx.beginPath()
    ctx.strokeStyle = GRIDLINE_COLOR
    Array.from({length: bitmapSize - 1}, (_, i) => i + 1).forEach(i => {
      ctx.moveTo(i * p + 0.5, 1)
      ctx.lineTo(i * p + 0.5, EDITOR_SIZE)
      ctx.moveTo(1, i * p + 0.5)
      ctx.lineTo(EDITOR_SIZE, i * p + 0.5)
    })
    ctx.closePath()
    ctx.stroke()

    if (guideFlag) {
      // Draw the horizontal and vertical guidelines of the canvas.
      ctx.beginPath()
      ctx.strokeStyle = GUIDELINE_COLOR
      ctx.moveTo(VLINE_POS + 0.5, 1)
      ctx.lineTo(VLINE_POS + 0.5, EDITOR_SIZE)
      ctx.moveTo(1, HLINE_POS + 0.5)
      ctx.lineTo(EDITOR_SIZE, HLINE_POS + 0.5)
      ctx.closePath()
      ctx.stroke()
    }

    // Draw the cells of the canvas with either an "empty" or "filled" state.
    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(...getRect(idx))
    })
    ctx.closePath()

    const shapeCells = plotShape(currentTool)
    if (shapeCells) {
      ctx.fillStyle = FILLED_CELL
      ctx.beginPath()
      shapeCells.forEach(idx => ctx.fillRect(...getRect(idx)))
      ctx.closePath()
    }
  }

  const drawModel = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx || !activeGlyph) {
      return
    }

    ctx.clearRect(0, 0, EDITOR_SIZE, EDITOR_SIZE)

    if (modelFlag) {
      ctx.beginPath()
      ctx.font = '512px Arial'

      ctx.fillText(activeGlyph, VLINE_POS, HLINE_POS)
      ctx.closePath()
    }
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

  const plotShape = (shapeTool: TCanvasTool) => {
    if (!shapeRange) {
      return
    }

    const [startPos, endPos] = shapeRange
    switch (shapeTool) {
      case 'LINE': {
        return plotLine(startPos, endPos)
      }
      case 'RECTANGLE': {
        return plotRect(startPos, endPos)
      }
      case 'ELLIPSE': {
        return plotEllipse(endPos, getDistance(startPos, endPos))
      }
      case 'DRAW':
      case 'ERASE':
      case 'FILL': {
        return
      }
      default: {
        return assertUnreachable(shapeTool)
      }
    }
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
    if (glyphCanvas[posToIndex(start)]) {
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

    return visited.map(c => posToIndex(c))
  }

  const handlePointerUp = () => {
    const shapeCells = plotShape(currentTool)

    if (!shapeCells) {
      fontDispatch({
        type: 'CANVAS_ACTION',
        op: 'UPDATE_CANVAS_HISTORY',
        newGlyphCanvas: glyphCanvas,
      })
    } else {
      const newGlyphCanvas = [...glyphCanvas]
      shapeCells.forEach(idx => (newGlyphCanvas[idx] = true))
      fontDispatch({
        type: 'GLYPH_SET_ACTION',
        op: 'UPDATE_GLYPH_CANVAS',
        newGlyphCanvas: newGlyphCanvas,
      })
      fontDispatch({
        type: 'CANVAS_ACTION',
        op: 'UPDATE_SHAPE_RANGE',
        newShapeRange: undefined,
      })
      fontDispatch({
        type: 'CANVAS_ACTION',
        op: 'UPDATE_CANVAS_HISTORY',
        newGlyphCanvas: newGlyphCanvas,
      })
    }
  }

  const handlePointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (evt.buttons !== 1) {
      return
    }

    if (activeMenu) {
      setActiveMenu(undefined)
      return
    }

    const mousePos = getMousePos(evt)
    if (mousePos === null) {
      return
    }

    const currIdx = posToIndex(mousePos)
    evt.currentTarget.setPointerCapture(evt.pointerId)

    switch (currentTool) {
      case 'DRAW':
      case 'ERASE': {
        const newGlyphCanvas = [...glyphCanvas]
        newGlyphCanvas[currIdx] = currentTool === 'DRAW' ? true : false
        return fontDispatch({
          type: 'GLYPH_SET_ACTION',
          op: 'UPDATE_GLYPH_CANVAS',
          newGlyphCanvas: newGlyphCanvas,
        })
      }
      case 'LINE':
      case 'RECTANGLE':
      case 'ELLIPSE': {
        return fontDispatch({
          type: 'CANVAS_ACTION',
          op: 'UPDATE_SHAPE_RANGE',
          newShapeRange: [mousePos, mousePos],
        })
      }
      case 'FILL': {
        const fillCells = fill(mousePos)
        if (!fillCells) {
          return
        }
        const newGlyphCanvas = [...glyphCanvas]
        fillCells.forEach(idx => (newGlyphCanvas[idx] = true))
        return fontDispatch({
          type: 'GLYPH_SET_ACTION',
          op: 'UPDATE_GLYPH_CANVAS',
          newGlyphCanvas: newGlyphCanvas,
        })
      }
      default: {
        return assertUnreachable(currentTool)
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

    const currIdx = posToIndex(mousePos)

    switch (currentTool) {
      case 'DRAW':
      case 'ERASE': {
        const newGlyphCanvas = [...glyphCanvas]
        newGlyphCanvas[currIdx] = currentTool === 'DRAW' ? true : false
        return fontDispatch({
          type: 'GLYPH_SET_ACTION',
          op: 'UPDATE_GLYPH_CANVAS',
          newGlyphCanvas: newGlyphCanvas,
        })
      }
      case 'LINE':
      case 'RECTANGLE':
      case 'ELLIPSE': {
        if (!shapeRange) {
          return
        }
        return fontDispatch({
          type: 'CANVAS_ACTION',
          op: 'UPDATE_SHAPE_RANGE',
          newShapeRange: [shapeRange[0], mousePos],
        })
      }
      case 'FILL': {
        return
      }
      default: {
        return assertUnreachable(currentTool)
      }
    }
  }

  const isShapeTool = (button: TCanvasButton) =>
    button === 'LINE' || button === 'RECTANGLE' || button === 'ELLIPSE'

  const Button = ({icon, button}: {icon: IconProp; button: TCanvasButton}) => (
    <Tippy placement={isShapeTool(button) ? 'right' : 'top'} content={button}>
      <FontAwesomeIcon
        icon={icon}
        className={classnames(
          currentTool === button && styles.activeIcon,
          button === 'CLEAR' && glyphCanvas?.every(v => !v) && styles.disabledIcon,
          button === 'UNDO' && historyIndex === 0 && styles.disabledIcon,
          button === 'REDO' &&
            historyIndex === canvasHistory.length - 1 &&
            styles.disabledIcon,
          styles.icon,
        )}
        onClick={() => {
          if (captureFlag) {
            return
          }

          setActiveMenu(undefined)

          switch (button) {
            case 'DRAW':
            case 'ERASE':
            case 'LINE':
            case 'RECTANGLE':
            case 'ELLIPSE':
            case 'FILL': {
              return fontDispatch({
                type: 'CANVAS_ACTION',
                op: 'UPDATE_CURRENT_TOOL',
                newCurrentTool: button,
              })
            }
            case 'INVERT':
            case 'CLEAR': {
              const newGlyphCanvas =
                button === 'CLEAR'
                  ? initializeGlyph(bitmapSize)
                  : [...glyphCanvas].map(filled => !filled)
              fontDispatch({
                type: 'GLYPH_SET_ACTION',
                op: 'UPDATE_GLYPH_CANVAS',
                newGlyphCanvas: newGlyphCanvas,
              })
              fontDispatch({
                type: 'CANVAS_ACTION',
                op: 'UPDATE_CANVAS_HISTORY',
                newGlyphCanvas: newGlyphCanvas,
              })
              return
            }
            case 'UNDO': {
              return fontDispatch({type: 'CANVAS_ACTION', op: 'UNDO'})
            }
            case 'REDO': {
              return fontDispatch({type: 'CANVAS_ACTION', op: 'REDO'})
            }
            default:
              return assertUnreachable(button)
          }
        }}
      />
    </Tippy>
  )

  const ShapeMenu = () => (
    <Tippy
      placement="top"
      content={isShapeTool(currentTool) ? currentTool : 'SHAPES'}
    >
      <div>
        <FontAwesomeIcon
          icon={
            currentTool === 'LINE'
              ? faSlash
              : currentTool === 'RECTANGLE'
              ? faSquare
              : currentTool === 'ELLIPSE'
              ? faCircle
              : faShapes
          }
          className={classnames(
            currentTool === 'LINE' && styles.activeIcon,
            currentTool === 'RECTANGLE' && styles.activeIcon,
            currentTool === 'ELLIPSE' && styles.activeIcon,
            styles.icon,
          )}
          onClick={() =>
            setActiveMenu(activeMenu === 'SHAPES' ? undefined : 'SHAPES')
          }
        />
        <div
          className={classnames(
            activeMenu !== 'SHAPES' && styles.menu,
            activeMenu === 'SHAPES' && styles.menuOpen,
          )}
        >
          <Button icon={faSlash} button="LINE" />
          <Button icon={faCircle} button="ELLIPSE" />
          <Button icon={faSquare} button="RECTANGLE" />
        </div>
      </div>
    </Tippy>
  )

  const OptionsMenu = () => (
    <Tippy placement="top" content="OPTIONS">
      <div>
        <FontAwesomeIcon
          icon={faGear}
          className={classnames(
            currentTool === 'LINE' && styles.activeIcon,
            currentTool === 'RECTANGLE' && styles.activeIcon,
            currentTool === 'ELLIPSE' && styles.activeIcon,
            styles.icon,
          )}
          onClick={() =>
            setActiveMenu(activeMenu === 'OPTIONS' ? undefined : 'OPTIONS')
          }
        />
        <div
          className={classnames(
            activeMenu !== 'OPTIONS' && styles.menu,
            activeMenu === 'OPTIONS' && styles.menuOpen,
          )}
        >
          <Tippy placement="left" content="MODEL">
            <FontAwesomeIcon
              icon={faA}
              className={classnames(
                modelFlag && styles.activeIcon,
                styles.optionIcon,
              )}
              onClick={() => setModelFlag(!modelFlag)}
            />
          </Tippy>
          <Tippy placement="left" content="GUIDELINES">
            <FontAwesomeIcon
              icon={faTextHeight}
              className={classnames(
                guideFlag && styles.activeIcon,
                styles.optionIcon,
              )}
              onClick={() => setGuideFlag(!guideFlag)}
            />
          </Tippy>
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
          <Button icon={faPencil} button="DRAW" />
          <Button icon={faEraser} button="ERASE" />
          <Button icon={faFill} button="FILL" />
          <ShapeMenu />
          <Button icon={faCircleHalfStroke} button="INVERT" />
          <Button icon={faTrashAlt} button="CLEAR" />
          <Button icon={faUndo} button="UNDO" />
          <Button icon={faRedo} button="REDO" />
          <OptionsMenu />
        </div>
      </div>
      <div
        className={styles.editor}
        style={{width: EDITOR_SIZE, height: EDITOR_SIZE}}
      >
        <canvas
          ref={drawCanvas}
          className={styles.canvas}
          style={{opacity: modelFlag ? '0.95' : '1'}}
          width={EDITOR_SIZE}
          height={EDITOR_SIZE}
          onGotPointerCapture={() =>
            fontDispatch({
              type: 'CANVAS_ACTION',
              op: 'UPDATE_CAPTURE_FLAG',
              newCaptureFlag: true,
            })
          }
          onLostPointerCapture={() =>
            fontDispatch({
              type: 'CANVAS_ACTION',
              op: 'UPDATE_CAPTURE_FLAG',
              newCaptureFlag: false,
            })
          }
          onPointerUp={handlePointerUp}
          onPointerDown={evt => handlePointerDown(evt)}
          onPointerMove={evt => handlePointerMove(evt)}
        />
        <canvas
          ref={drawModel}
          className={styles.model}
          width={EDITOR_SIZE}
          height={EDITOR_SIZE}
        />
      </div>
    </div>
  )
}

export default Canvas
