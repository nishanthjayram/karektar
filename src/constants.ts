import Bitmap from '@/classes/Bitmap'
import { TEditorState } from '@/utils/reducers/editorReducer'

export const DEFAULT_BITMAP_SIZE = 16
export const DEFAULT_EDITOR_STATE: TEditorState = {
  layers: {
    main: new Bitmap(DEFAULT_BITMAP_SIZE),
    preview: new Bitmap(DEFAULT_BITMAP_SIZE),
  },
  scale: 30,
}

export const DEFAULT_POINTER_STATE = {
  currentTool: 'pen',
  isPointerDown: false,
  dragStartPos: null,
  lastPos: null,
}

export const DEFAULT_GLYPH_STATE = {
  glyphs: new Map<string, Bitmap>(),
  activeGlyph: 'a',
}

export const DEFAULT_APP_STATE = {
  editorState: DEFAULT_EDITOR_STATE,
  pointerState: DEFAULT_POINTER_STATE,
  glyphState: DEFAULT_GLYPH_STATE,
}
