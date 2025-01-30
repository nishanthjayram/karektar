import { compareUint8Arrays, initializeGlyph } from '@/helpers/app.helpers'
import {
  TCanvasAction,
  TFont,
  TFontAction,
  TGlyph,
  TGlyphSet,
  TGlyphSetAction,
  TSymbol,
} from '@/types'

export const fontReducer = (state: TFont, action: TFontAction): TFont => {
  switch (action.type) {
    case 'CANVAS_ACTION': {
      return { ...state, ...canvasReducer(state, action) }
    }
    case 'GLYPH_SET_ACTION': {
      return { ...state, ...glyphSetReducer(state, action) }
    }
    default: {
      return state
    }
  }
}

export const glyphSetReducer = (state: TFont, action: TGlyphSetAction): TFont => {
  switch (action.op) {
    case 'UPDATE_ACTIVE_GLYPH': {
      if (state.activeGlyph === action.newActiveGlyph) {
        return state
      }
      const newGlyphCanvas = state.glyphSet.get(action.newActiveGlyph)
      return {
        ...state,
        activeGlyph: action.newActiveGlyph,
        canvasHistory: [newGlyphCanvas ?? initializeGlyph(state.bitmapSize)],
        historyIndex: 0,
      }
    }
    case 'UPDATE_CONFIRM_MODAL': {
      return { ...state, confirmModal: action.newConfirmModal }
    }
    case 'UPDATE_GALLERY_PAGE': {
      return { ...state, galleryPage: action.newGalleryPage }
    }
    case 'UPDATE_GLYPH_CANVAS': {
      const newGlyphSet = new Map(state.glyphSet)
      newGlyphSet.set(state.activeGlyph, action.newGlyphCanvas)
      return { ...state, glyphSet: newGlyphSet }
    }
    case 'UPDATE_GLYPH_SET_MODAL': {
      return { ...state, glyphSetModal: action.newGlyphSetModal }
    }
    case 'UPDATE_INPUT_TEXT': {
      return { ...state, inputText: action.newInputText }
    }
    case 'UPDATE_SYMBOL_SET': {
      const newGlyphSet: TGlyphSet = new Map<TSymbol, TGlyph>()
      action.newSymbolSet.forEach(symbol =>
        newGlyphSet.set(
          symbol,
          state.glyphSet.get(symbol) ?? initializeGlyph(state.bitmapSize),
        ),
      )

      const activeGlyphFlag = action.newSymbolSet.includes(state.activeGlyph)
      return {
        ...state,
        activeGlyph: activeGlyphFlag ? state.activeGlyph : action.newSymbolSet[0],
        canvasHistory: activeGlyphFlag
          ? state.canvasHistory
          : [initializeGlyph(state.bitmapSize)],
        glyphSet: newGlyphSet,
        historyIndex: activeGlyphFlag ? state.historyIndex : 0,
        symbolSet: action.newSymbolSet,
      }
    }
    case 'RESET_GLYPH_SET': {
      const newGlyphSet = new Map(state.glyphSet)
      newGlyphSet.forEach((_, symbol) =>
        newGlyphSet.set(symbol, initializeGlyph(state.bitmapSize)),
      )
      return {
        ...state,
        canvasHistory: [initializeGlyph(state.bitmapSize)],
        glyphSet: newGlyphSet,
        historyIndex: 0,
      }
    }
    default: {
      return state
    }
  }
}

export const canvasReducer = (state: TFont, action: TCanvasAction): TFont => {
  switch (action.op) {
    case 'UPDATE_ACTIVE_MENU': {
      return { ...state, activeMenu: action.newActiveMenu }
    }
    case 'UPDATE_CANVAS_HISTORY': {
      return compareUint8Arrays(
        state.canvasHistory[state.historyIndex],
        action.newGlyphCanvas,
      )
        ? state
        : {
            ...state,
            canvasHistory: [
              ...state.canvasHistory.slice(0, state.historyIndex + 1),
              action.newGlyphCanvas,
            ],
            historyIndex: state.historyIndex + 1,
          }
    }
    case 'UPDATE_CANVAS_SIZE': {
      return { ...state, canvasSize: action.newCanvasSize }
    }
    case 'UPDATE_CAPTURE_FLAG': {
      return { ...state, captureFlag: action.newCaptureFlag }
    }
    case 'UPDATE_CURRENT_TOOL': {
      return { ...state, currentTool: action.newCurrentTool }
    }
    case 'UPDATE_GUIDELINES_FLAG': {
      return { ...state, guidelinesFlag: action.newGuidelinesFlag }
    }
    case 'UPDATE_MODEL_FLAG': {
      return { ...state, modelFlag: action.newModelFlag }
    }
    case 'UPDATE_SHAPE_RANGE': {
      return { ...state, shapeRange: action.newShapeRange }
    }

    case 'UNDO':
    case 'REDO': {
      const newHistoryIndex =
        action.op === 'UNDO'
          ? Math.max(0, state.historyIndex - 1)
          : Math.min(state.historyIndex + 1, state.canvasHistory.length - 1)
      const newGlyphSet = new Map(state.glyphSet)
      newGlyphSet.set(state.activeGlyph, state.canvasHistory[newHistoryIndex])
      return {
        ...state,
        glyphSet: newGlyphSet,
        historyIndex: newHistoryIndex,
      }
    }
    default: {
      return state
    }
  }
}
