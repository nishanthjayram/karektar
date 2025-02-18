// export type TToolLabel = 'DRAW' | 'ERASE' | 'FILL' | 'LINE' | 'RECTANGLE' | 'ELLIPSE'
// export type TActionLabel = 'CLEAR' | 'UNDO' | 'REDO'
// export type TOptionLabel = 'GUIDELINES' | 'MODEL'

// export type TAction = {
//   type: 'action'
//   label: TActionLabel
//   icon: IconProp
//   disabled: boolean
// }
// export type TOption = {
//   type: 'option'
//   label: TOptionLabel
//   icon: IconProp
//   active: boolean
// }
// export type TButtonType = TTool | TAction | TOption

// export type TConfirmModal = 'SUBMIT' | 'RESET' | 'SAVE' | 'LOAD' | 'EXPORT' | 'HELP'

// export type TMenuLabel = 'SHAPES' | 'OPTIONS'
// export type TMenuHeader = {
//   defaultLabel: TMenuLabel
//   defaultIcon: IconProp
// }
// export type TRect = [x: number, y: number, w: number, h: number]
// export type TShapeRange = [startPos: TPos, endPos: TPos] | undefined

// export type TFont = {
//   activeGlyph: string
//   activeMenu: TMenuLabel | undefined
//   bitmapSize: number
//   canvasHistory: GlyphBitmap[]
//   canvasSize: number
//   captureFlag: boolean
//   confirmModal: TConfirmModal | undefined
//   currentTool: TToolLabel
//   galleryPage: number
//   glyphSet: TGlyphSet
//   glyphSetModal: boolean | undefined
//   glyphSize: number
//   guidelinesFlag: boolean
//   historyIndex: number
//   hlinePos: number
//   inputText: string
//   modelFlag: boolean
//   pixelSize: number
//   screenFlag: boolean
//   shapeRange: TShapeRange
//   symbolSet: string[]
//   vlinePos: number
// }

// export type TCanvasAction = { type: 'CANVAS_ACTION' } & (
//   | { op: 'UPDATE_ACTIVE_MENU'; newActiveMenu: TMenuLabel | undefined }
//   | { op: 'UPDATE_CANVAS_HISTORY'; newGlyphCanvas: GlyphBitmap }
//   | { op: 'UPDATE_CANVAS_SIZE'; newCanvasSize: number }
//   | { op: 'UPDATE_CAPTURE_FLAG'; newCaptureFlag: boolean }
//   | { op: 'UPDATE_CURRENT_TOOL'; newCurrentTool: TToolLabel }
//   | { op: 'UPDATE_GUIDELINES_FLAG'; newGuidelinesFlag: boolean }
//   | { op: 'UPDATE_MODEL_FLAG'; newModelFlag: boolean }
//   | { op: 'UPDATE_SHAPE_RANGE'; newShapeRange: TShapeRange }
//   | { op: 'UNDO' }
//   | { op: 'REDO' }
// )
// export type TGlyphSetAction = { type: 'GLYPH_SET_ACTION' } & (
//   | { op: 'RESET_GLYPH_SET' }
//   | { op: 'UPDATE_ACTIVE_GLYPH'; newActiveGlyph: string }
//   | { op: 'UPDATE_CONFIRM_MODAL'; newConfirmModal: TConfirmModal | undefined }
//   | { op: 'UPDATE_GALLERY_PAGE'; newGalleryPage: number }
//   | { op: 'UPDATE_GLYPH_CANVAS'; newGlyphCanvas: GlyphBitmap }
//   | { op: 'UPDATE_GLYPH_SIZE'; newGlyphSize: number }
//   | { op: 'UPDATE_GLYPH_SET_MODAL'; newGlyphSetModal: boolean | undefined }
//   | { op: 'UPDATE_INPUT_TEXT'; newInputText: string }
//   | { op: 'UPDATE_SYMBOL_SET'; newSymbolSet: string[] }
// )

// export type TFontAction = TCanvasAction | TGlyphSetAction
// export type TFontProps = {
//   fontState: TFont
//   fontDispatch: React.Dispatch<TFontAction>
// }
