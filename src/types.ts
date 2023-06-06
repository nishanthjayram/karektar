export type TCanvasTool =
  | 'DRAW'
  | 'ERASE'
  | 'FILL'
  | 'LINE'
  | 'RECTANGLE'
  | 'ELLIPSE'
export type TCanvasButton = TCanvasTool | 'INVERT' | 'CLEAR' | 'UNDO' | 'REDO'

export type TPos = [x: number, y: number]
export type TRect = [x: number, y: number, w: number, h: number]
export type TShapeRange = [startPos: TPos, endPos: TPos] | undefined

export type TFont = {
  activeGlyph: string
  bitmapSize: number
  canvasHistory: boolean[][]
  captureFlag: boolean
  currentTool: TCanvasTool
  glyphSet: Map<string, boolean[]>
  historyIndex: number
  shapeRange: TShapeRange
  symbolSet: string[]
}

export type TCanvasAction = {type: 'CANVAS_ACTION'} & (
  | {op: 'UPDATE_CANVAS_HISTORY'; newGlyphCanvas: boolean[]}
  | {op: 'UPDATE_CAPTURE_FLAG'; newCaptureFlag: boolean}
  | {op: 'UPDATE_CURRENT_TOOL'; newCurrentTool: TCanvasTool}
  | {op: 'UPDATE_SHAPE_RANGE'; newShapeRange: TShapeRange}
  | {op: 'UNDO'}
  | {op: 'REDO'}
)
export type TGlyphSetAction = {type: 'GLYPH_SET_ACTION'} & (
  | {op: 'CLEAR_GLYPH_SET'}
  | {op: 'UPDATE_ACTIVE_GLYPH'; newActiveGlyph: string}
  | {op: 'UPDATE_GLYPH_CANVAS'; newGlyphCanvas: boolean[]}
  | {op: 'UPDATE_SYMBOL_SET'; newSymbolSet: string[]}
)

export type TFontAction = TCanvasAction | TGlyphSetAction
