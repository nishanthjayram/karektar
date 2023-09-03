import {faTrashAlt} from '@fortawesome/free-regular-svg-icons'
import {faA, faRedo, faTextHeight, faUndo} from '@fortawesome/free-solid-svg-icons'
import Button from './Button/Button'
import styles from './Canvas.module.scss'
import OptionsMenu from './OptionsMenu/OptionsMenu'
import ToolsMenu from './ShapesMenu/ShapesMenu'
import {TAction, TFont, TFontAction, TFontProps, TGlyph, TOption} from '../../types'
import {
  DRAW_TOOLS,
  EMPTY_CELL,
  FILLED_CELL,
  GLYPH_TEXT_WIDTH,
  GRIDLINE_COLOR,
  GUIDELINE_COLOR,
  OPTIONS_MENU_HEADER,
  SHAPE_TOOLS,
  SHAPES_MENU_HEADER,
} from '../../utils/constants/canvas.constants'
import {assertUnreachable} from '../../utils/helpers/app.helpers'
import {
  fill,
  getMousePos,
  getRect,
  plotShape,
  posToIndex,
} from '../../utils/helpers/canvas.helpers'
import 'tippy.js/dist/tippy.css'

type TCanvasProps = {
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}

const Canvas: React.FC<TCanvasProps> = ({fontState, fontDispatch}) => {
  const {
    activeMenu,
    bitmapSize,
    activeGlyph,
    canvasSize,
    currentTool,
    glyphSet,
    glyphSetModal,
    guidelinesFlag,
    modelFlag,
    pixelSize,
    shapeRange,
    captureFlag,
    vlinePos,
    hlinePos,
  } = fontState

  const glyphCanvas = glyphSet.get(activeGlyph)

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
      ctx.moveTo(i * pixelSize + 0.5, 1)
      ctx.lineTo(i * pixelSize + 0.5, canvasSize)
      ctx.moveTo(1, i * pixelSize + 0.5)
      ctx.lineTo(canvasSize, i * pixelSize + 0.5)
    })
    ctx.closePath()
    ctx.stroke()

    if (guidelinesFlag) {
      // Draw the horizontal and vertical guidelines of the canvas.
      ctx.beginPath()
      ctx.strokeStyle = GUIDELINE_COLOR
      ctx.moveTo(vlinePos + 0.5, 1)
      ctx.lineTo(vlinePos + 0.5, canvasSize)
      ctx.moveTo(1, hlinePos + 0.5)
      ctx.lineTo(canvasSize, hlinePos + 0.5)
      ctx.closePath()
      ctx.stroke()
    }

    // Draw the cells of the canvas with either an "empty" or "filled" state.
    ctx.beginPath()
    glyphCanvas.forEach((filled: boolean, idx: number) => {
      ctx.fillStyle = filled ? FILLED_CELL : EMPTY_CELL
      ctx.fillRect(...getRect(idx, bitmapSize, pixelSize))
    })
    ctx.closePath()

    const shapeCells = plotShape(currentTool, bitmapSize, shapeRange)
    if (shapeCells) {
      ctx.fillStyle = FILLED_CELL
      ctx.beginPath()
      shapeCells.forEach(idx => ctx.fillRect(...getRect(idx, bitmapSize, pixelSize)))
      ctx.closePath()
    }
  }

  const drawModel = (canvas: HTMLCanvasElement | null) => {
    const ctx = canvas?.getContext('2d')
    if (!ctx || !activeGlyph) {
      return
    }

    ctx.clearRect(0, 0, canvasSize, canvasSize)

    if (modelFlag) {
      ctx.beginPath()
      ctx.font = `${canvasSize}px Arial`

      ctx.fillText(activeGlyph, 2 * pixelSize, 12 * pixelSize)
      ctx.closePath()
    }
  }

  const handlePointerUp = () => {
    const shapeCells = plotShape(currentTool, bitmapSize, shapeRange)

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
      fontDispatch({
        type: 'CANVAS_ACTION',
        op: 'UPDATE_ACTIVE_MENU',
        newActiveMenu: undefined,
      })
      return
    }

    const mousePos = getMousePos(evt, bitmapSize, pixelSize)
    if (mousePos === null) {
      return
    }

    const currIdx = posToIndex(mousePos, bitmapSize)
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
        const fillCells = fill(mousePos, glyphCanvas, bitmapSize)
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

    const mousePos = getMousePos(evt, bitmapSize, pixelSize)
    if (mousePos === null) {
      return
    }

    const currIdx = posToIndex(mousePos, bitmapSize)

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

  return (
    <div>
      <div className={styles.header} style={{width: canvasSize}}>
        <div
          className={styles.text}
          style={{
            minWidth: `${GLYPH_TEXT_WIDTH}px`,
            padding: `0 ${(2 * pixelSize - GLYPH_TEXT_WIDTH) / 2}px`,
          }}
          onPointerDown={evt => {
            if (glyphSetModal !== undefined) {
              fontDispatch({
                type: 'GLYPH_SET_ACTION',
                op: 'UPDATE_GLYPH_SET_MODAL',
                newGlyphSetModal: true,
              })
            }
            evt.preventDefault()
          }}
        >
          {activeGlyph}
        </div>
        <div className={styles.separator} />
        <Toolbar
          fontState={fontState}
          fontDispatch={fontDispatch}
          glyphCanvas={glyphCanvas}
        />
      </div>
      <div className={styles.editor} style={{width: canvasSize, height: canvasSize}}>
        <canvas
          ref={drawCanvas}
          className={styles.canvas}
          style={{opacity: modelFlag ? '0.95' : '1'}}
          width={canvasSize}
          height={canvasSize}
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
          width={canvasSize}
          height={canvasSize}
        />
      </div>
    </div>
  )
}

type TToolbarProps = TFontProps & {
  glyphCanvas: TGlyph
}

const Toolbar: React.FC<TToolbarProps> = ({
  fontState,
  fontDispatch,
  glyphCanvas,
}) => {
  const {
    canvasHistory,
    currentTool,
    guidelinesFlag,
    historyIndex,
    modelFlag,
    screenFlag,
  } = fontState

  const actions: TAction[] = [
    {
      type: 'action',
      label: 'CLEAR',
      icon: faTrashAlt,
      disabled: glyphCanvas.every(v => !v),
    },
    {
      type: 'action',
      label: 'UNDO',
      icon: faUndo,
      disabled: historyIndex === 0,
    },
    {
      type: 'action',
      label: 'REDO',
      icon: faRedo,
      disabled: historyIndex === canvasHistory.length - 1,
    },
  ]

  const options: TOption[] = [
    {
      type: 'option',
      label: 'GUIDELINES',
      icon: faTextHeight,
      active: guidelinesFlag,
    },
    {
      type: 'option',
      label: 'MODEL',
      icon: faA,
      active: modelFlag,
    },
  ]

  return (
    <div className={styles.toolbar}>
      {!screenFlag &&
        DRAW_TOOLS.map((props, index) => (
          <Button
            key={index}
            {...props}
            active={currentTool === props.label}
            fontState={fontState}
            fontDispatch={fontDispatch}
          />
        ))}
      <ToolsMenu
        defaultLabel={SHAPES_MENU_HEADER.defaultLabel}
        defaultIcon={SHAPES_MENU_HEADER.defaultIcon}
        tools={screenFlag ? [...DRAW_TOOLS, ...SHAPE_TOOLS] : SHAPE_TOOLS}
        fontState={fontState}
        fontDispatch={fontDispatch}
      />
      {actions.map((props, index) => (
        <Button
          key={index}
          {...props}
          fontState={fontState}
          fontDispatch={fontDispatch}
        />
      ))}
      <OptionsMenu
        defaultLabel={OPTIONS_MENU_HEADER.defaultLabel}
        defaultIcon={OPTIONS_MENU_HEADER.defaultIcon}
        options={options}
        fontState={fontState}
        fontDispatch={fontDispatch}
      />
    </div>
  )
}

export default Canvas
