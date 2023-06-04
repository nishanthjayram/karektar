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
import {useState} from 'react'
import styles from './Canvas.module.scss'
import {EDITOR_SIZE, EMPTY_CELL, FILLED_CELL} from '../../constants'
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

const Canvas = ({
  font,
  updateFont,
}: {
  font: TFont
  updateFont: React.Dispatch<TFontAction>
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
  } = font

  const [shapeMenuOpen, setShapeMenuOpen] = useState(false)

  const glyphCanvas = activeGlyph ? glyphSet.get(activeGlyph) : undefined

  if (!glyphCanvas) {
    return (
      <div
        className={styles.editor}
        style={{width: EDITOR_SIZE, height: EDITOR_SIZE}}
      />
    )
  }

  const p = EDITOR_SIZE / font.bitmapSize

  const drawCanvas = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx) {
      return
    }

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
    if (shapeCells) {
      const newGlyphCanvas = [...glyphCanvas]
      shapeCells.forEach(idx => (newGlyphCanvas[idx] = true))
      updateFont({type: 'updateCanvas', newGlyphCanvas: newGlyphCanvas})
      updateFont({type: 'updateShapeRange', newShapeRange: undefined})
    }

    updateFont({type: 'updateHistory', newGlyphCanvas: glyphCanvas})
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

    const currIdx = posToIndex(mousePos)
    evt.currentTarget.setPointerCapture(evt.pointerId)

    switch (currentTool) {
      case 'DRAW':
      case 'ERASE': {
        const newGlyphCanvas = [...glyphCanvas]
        newGlyphCanvas[currIdx] = currentTool === 'DRAW' ? true : false
        return updateFont({type: 'updateCanvas', newGlyphCanvas: newGlyphCanvas})
      }
      case 'LINE':
      case 'RECTANGLE':
      case 'ELLIPSE': {
        return updateFont({
          type: 'updateShapeRange',
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
        return updateFont({
          type: 'updateCanvas',
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
        return updateFont({type: 'updateCanvas', newGlyphCanvas: newGlyphCanvas})
      }
      case 'LINE':
      case 'RECTANGLE':
      case 'ELLIPSE': {
        if (!shapeRange) {
          return
        }
        return updateFont({
          type: 'updateShapeRange',
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

  const isShapeTool = (tool: TCanvasTool) =>
    tool === 'LINE' || tool === 'RECTANGLE' || tool === 'ELLIPSE'

  const Button = ({icon, button}: {icon: IconProp; button: TCanvasButton}) => (
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

        setShapeMenuOpen(false)

        switch (button) {
          case 'DRAW':
          case 'ERASE':
          case 'LINE':
          case 'RECTANGLE':
          case 'ELLIPSE':
          case 'FILL': {
            return updateFont({type: 'changeTool', newTool: button})
          }
          case 'INVERT':
          case 'CLEAR': {
            const newGlyphCanvas =
              button === 'CLEAR'
                ? initializeGlyph(bitmapSize)
                : [...glyphCanvas].map(filled => !filled)
            updateFont({type: 'updateCanvas', newGlyphCanvas: newGlyphCanvas})
            updateFont({type: 'updateHistory', newGlyphCanvas: newGlyphCanvas})
            return
          }
          case 'UNDO': {
            return updateFont({type: 'undo'})
          }
          case 'REDO': {
            return updateFont({type: 'redo'})
          }
          default:
            return assertUnreachable(button)
        }
      }}
    />
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
          onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
        />
        <div
          className={classnames(
            !shapeMenuOpen && styles.shapeMenu,
            shapeMenuOpen && styles.shapeMenuOpen,
          )}
        >
          <Button icon={faSlash} button="LINE" />
          <Button icon={faCircle} button="ELLIPSE" />
          <Button icon={faSquare} button="RECTANGLE" />
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
          <ShapeMenu />
          <Button icon={faFill} button="FILL" />
          <Button icon={faCircleHalfStroke} button="INVERT" />
          <Button icon={faTrashAlt} button="CLEAR" />
          <Button icon={faUndo} button="UNDO" />
          <Button icon={faRedo} button="REDO" />
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
          onGotPointerCapture={() =>
            updateFont({type: 'updateCaptureFlag', newCaptureFlag: true})
          }
          onLostPointerCapture={() =>
            updateFont({type: 'updateCaptureFlag', newCaptureFlag: false})
          }
          onPointerUp={handlePointerUp}
          onPointerDown={evt => handlePointerDown(evt)}
          onPointerMove={evt => handlePointerMove(evt)}
        />
      </div>
    </div>
  )
}

export default Canvas
