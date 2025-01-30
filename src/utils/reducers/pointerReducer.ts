import { TPos, TTool, isPreviewTool } from '@/types'
import { TEditorAction } from './editorReducer'

export type TPointerState = {
  currentTool: TTool
  isPointerDown: boolean
  dragStartPos: TPos | null
  lastPos: TPos | null
}

export type TPointerAction =
  | { type: 'setCurrentTool'; tool: TTool }
  | { type: 'pointerDown'; pos: TPos }
  | { type: 'pointerMove'; pos: TPos }
  | { type: 'pointerUp' }

const handleToolAction = (
  state: TPointerState,
  editorDispatch: (action: TEditorAction) => void,
  pos: TPos,
  isPreview: boolean = false,
) => {
  const { currentTool: tool, lastPos, dragStartPos } = state

  switch (tool) {
    case 'pen':
      editorDispatch({
        type: 'draw',
        from: lastPos || pos,
        to: pos,
      })
      break

    case 'eraser':
      editorDispatch({
        type: 'erase',
        from: lastPos || pos,
        to: pos,
      })
      break

    case 'line':
      editorDispatch({
        type: 'drawLine',
        from: dragStartPos || pos,
        to: pos,
        preview: isPreview,
      })
      break

    case 'rectangle':
      editorDispatch({
        type: 'drawRectangle',
        from: dragStartPos || pos,
        to: pos,
        preview: isPreview,
      })
      break

    case 'ellipse':
      editorDispatch({
        type: 'drawEllipse',
        center: dragStartPos || pos,
        radius: [
          Math.abs(pos[0] - (dragStartPos || pos)[0]),
          Math.abs(pos[1] - (dragStartPos || pos)[1]),
        ],
        preview: isPreview,
      })
      break

    case 'fill':
      editorDispatch({ type: 'fill', pos })
      break

    default:
      break
  }
}

export const pointerReducer = (
  state: TPointerState,
  action: TPointerAction,
  editorDispatch?: (action: TEditorAction) => void,
): TPointerState => {
  if (!editorDispatch) return state

  switch (action.type) {
    case 'setCurrentTool':
      return {
        ...state,
        currentTool: action.tool,
        dragStartPos: null,
        lastPos: null,
      }

    case 'pointerDown':
      handleToolAction(state, editorDispatch, action.pos)
      return {
        ...state,
        isPointerDown: true,
        dragStartPos: action.pos,
        lastPos: action.pos,
      }

    case 'pointerMove':
      if (!state.isPointerDown) return state
      handleToolAction(
        state,
        editorDispatch,
        action.pos,
        isPreviewTool(state.currentTool),
      )
      return {
        ...state,
        lastPos: action.pos,
      }

    case 'pointerUp':
      if (isPreviewTool(state.currentTool) && state.isPointerDown) {
        editorDispatch({ type: 'commitPreview' })
      }
      return {
        ...state,
        isPointerDown: false,
        dragStartPos: null,
        lastPos: null,
      }

    default:
      return state
  }
}

export default pointerReducer
