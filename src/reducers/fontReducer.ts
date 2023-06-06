import {TCanvasAction, TFont, TFontAction, TGlyphSetAction} from '../types'
import {compareArrays, initializeGlyph} from '../utils'

export const fontReducer = (state: TFont, action: TFontAction): TFont => {
  switch (action.type) {
    case 'CANVAS_ACTION': {
      return {...state, ...canvasReducer(state, action)}
    }
    case 'GLYPH_SET_ACTION': {
      return {...state, ...glyphSetReducer(state, action)}
    }
    default: {
      return state
    }
  }
}

// export type TFont = {
//   activeGlyph: string
//   bitmapSize: number
//   canvasHistory: boolean[][]
//   captureFlag: boolean
//   currentTool: TCanvasTool
//   glyphSet: Map<string, boolean[]>
//   historyIndex: number
//   shapeRange: TShapeRange
//   symbolSet: string[]
// }

export const glyphSetReducer = (state: TFont, action: TGlyphSetAction): TFont => {
  switch (action.op) {
    case 'UPDATE_ACTIVE_GLYPH': {
      return {
        ...state,
        activeGlyph: action.newActiveGlyph,
        canvasHistory: [initializeGlyph(state.bitmapSize)],
        historyIndex: 0,
      }
    }
    case 'UPDATE_GLYPH_CANVAS': {
      const newGlyphSet = new Map(state.glyphSet)
      newGlyphSet.set(state.activeGlyph, action.newGlyphCanvas)
      return {...state, glyphSet: newGlyphSet}
    }
    case 'UPDATE_SYMBOL_SET': {
      const newGlyphSet = new Map(state.glyphSet)
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
        glyphSet: newGlyphSet,
        canvasHistory: activeGlyphFlag
          ? state.canvasHistory
          : [initializeGlyph(state.bitmapSize)],
        historyIndex: activeGlyphFlag ? state.historyIndex : 0,
      }
    }
    case 'CLEAR_GLYPH_SET': {
      const newGlyphSet = new Map(state.glyphSet)
      newGlyphSet.forEach((_, symbol) =>
        newGlyphSet.set(symbol, initializeGlyph(state.bitmapSize)),
      )
      return {
        ...state,
        glyphSet: newGlyphSet,
        canvasHistory: [initializeGlyph(state.bitmapSize)],
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
    case 'UPDATE_CANVAS_HISTORY': {
      return compareArrays(
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
    case 'UPDATE_CAPTURE_FLAG': {
      return {...state, captureFlag: action.newCaptureFlag}
    }
    case 'UPDATE_CURRENT_TOOL': {
      return {...state, currentTool: action.newCurrentTool}
    }
    case 'UPDATE_SHAPE_RANGE': {
      return {...state, shapeRange: action.newShapeRange}
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
