export type TCanvasTool =
  | 'DRAW'
  | 'ERASE'
  | 'FILL'
  | 'LINE'
  | 'RECTANGLE'
  | 'ELLIPSE'
export type TCanvasAction = 'INVERT' | 'CLEAR' | 'UNDO' | 'REDO'
export type TCanvasButton = TCanvasTool | TCanvasAction

export type TPos = [x: number, y: number]
export type TRect = [x: number, y: number, w: number, h: number]
export type TShapeRange = [startPos: TPos, endPos: TPos] | undefined

export type TCanvas = {
  bitmapSize: number
  canvasHistory: boolean[][]
  captureFlag: boolean
  currentTool: TCanvasTool
  historyIndex: number
  shapeRange: TShapeRange
}

export type TGlyphSet = {
  activeGlyph: string | undefined
  bitmapSize: number
  glyphSet: Map<string, boolean[]>
}

export type TFont = {
  activeGlyph: string | undefined
  bitmapSize: number
  canvasHistory: boolean[][]
  captureFlag: boolean
  currentTool: TCanvasTool
  glyphSet: Map<string, boolean[]>
  historyIndex: number
  shapeRange: TShapeRange
}

export type TFontAction =
  | {type: 'change'}
  | {type: 'changeGlyph'; newGlyph: string}
  | {type: 'changeTool'; newTool: TCanvasTool}
  | {type: 'updateCanvas'; newGlyphCanvas: boolean[]}
  | {type: 'updateHistory'; newGlyphCanvas: boolean[]}
  | {type: 'updateShapeRange'; newShapeRange: TShapeRange}
  | {type: 'undo'}
  | {type: 'redo'}
  | {type: 'updateCaptureFlag'; newCaptureFlag: boolean}
  | {type: 'updateGlyphSet'; symbolSet?: string[]; newBitmapSize?: number}
  | {type: 'clearGlyphSet'}
