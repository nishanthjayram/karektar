import {IconProp} from '@fortawesome/fontawesome-svg-core'

export type TToolLabel = 'DRAW' | 'ERASE' | 'FILL' | 'LINE' | 'RECTANGLE' | 'ELLIPSE'
export type TActionLabel = 'CLEAR' | 'UNDO' | 'REDO'
export type TOptionLabel = 'GUIDELINES' | 'MODEL'
export type TTool = {
  type: 'tool'
  label: TToolLabel
  icon: IconProp
}
export type TAction = {
  type: 'action'
  label: TActionLabel
  icon: IconProp
  disabled: boolean
}
export type TOption = {
  type: 'option'
  label: TOptionLabel
  icon: IconProp
  active: boolean
}
export type TButtonType = TTool | TAction | TOption

export type TMenuLabel = 'SHAPES' | 'OPTIONS'
export type TMenuHeader = {
  defaultLabel: TMenuLabel
  defaultIcon: IconProp
}

export type TPos = [x: number, y: number]
export type TRect = [x: number, y: number, w: number, h: number]
export type TShapeRange = [startPos: TPos, endPos: TPos] | undefined

export type TFont = {
  activeGlyph: string
  activeMenu: TMenuLabel | undefined
  bitmapSize: number
  canvasHistory: boolean[][]
  captureFlag: boolean
  currentTool: TToolLabel
  glyphSet: Map<string, boolean[]>
  guidelinesFlag: boolean
  historyIndex: number
  modelFlag: boolean
  shapeRange: TShapeRange
  symbolSet: string[]
}

export type TCanvasAction = {type: 'CANVAS_ACTION'} & (
  | {op: 'UPDATE_ACTIVE_MENU'; newActiveMenu: TMenuLabel | undefined}
  | {op: 'UPDATE_CANVAS_HISTORY'; newGlyphCanvas: boolean[]}
  | {op: 'UPDATE_CAPTURE_FLAG'; newCaptureFlag: boolean}
  | {op: 'UPDATE_CURRENT_TOOL'; newCurrentTool: TToolLabel}
  | {op: 'UPDATE_GUIDELINES_FLAG'; newGuidelinesFlag: boolean}
  | {op: 'UPDATE_MODEL_FLAG'; newModelFlag: boolean}
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
