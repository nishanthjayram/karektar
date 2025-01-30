import { useCallback, useReducer } from 'react'
import {
  TEditorAction,
  TEditorState,
  editorReducer,
  isBitmapAction,
} from '@/utils/reducers/editorReducer'
import glyphReducer, { TGlyphState } from '@/utils/reducers/glyphReducer'
import pointerReducer, {
  TPointerAction,
  TPointerState,
} from '@/utils/reducers/pointerReducer'

export const useEditor = (
  initialEditorState: TEditorState,
  initialPointerState: TPointerState,
  initialGlyphState: TGlyphState,
) => {
  const [editorState, rawEditorDispatch] = useReducer(
    editorReducer,
    initialEditorState,
  )
  const [glyphState, glyphDispatch] = useReducer(glyphReducer, initialGlyphState)

  // Sync editor actions with glyph state
  const editorDispatch = useCallback(
    (action: TEditorAction) => {
      rawEditorDispatch(action)
      if (glyphState.activeGlyph && isBitmapAction(action.type)) {
        glyphDispatch({
          type: 'updateGlyph',
          char: glyphState.activeGlyph,
          bitmap: editorState.layers.main.clone(),
        })
      }
    },
    [glyphState.activeGlyph, editorState.layers.main],
  )

  const [pointerState, pointerDispatch] = useReducer(
    (state: TPointerState, action: TPointerAction) =>
      pointerReducer(state, action, editorDispatch),
    initialPointerState,
  )

  return {
    editorState,
    editorDispatch,
    pointerState,
    pointerDispatch,
    glyphState,
    glyphDispatch,
  }
}
