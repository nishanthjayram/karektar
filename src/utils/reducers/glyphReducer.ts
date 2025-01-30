import Bitmap from '@/classes/Bitmap'

export type TGlyphMap = Map<string, Bitmap>
export type TGlyphState = {
  glyphs: TGlyphMap
  activeGlyph: string | null
}

export type TGlyphAction =
  | { type: 'addGlyph'; glyph: string; bitmap: Bitmap }
  | { type: 'removeGlyph'; glyph: string }
  | { type: 'setActiveGlyph'; glyph: string }
  | { type: 'updateGlyph'; char: string; bitmap: Bitmap }

export const glyphReducer = (
  state: TGlyphState,
  action: TGlyphAction,
): TGlyphState => {
  switch (action.type) {
    case 'addGlyph':
      return {
        ...state,
        glyphs: new Map(state.glyphs).set(action.glyph, action.bitmap),
      }
    case 'removeGlyph':
      const newGlyphs = new Map(state.glyphs)
      newGlyphs.delete(action.glyph)
      return { ...state, glyphs: newGlyphs, activeGlyph: null }
    case 'setActiveGlyph':
      return { ...state, activeGlyph: action.glyph }
    case 'updateGlyph':
      return {
        ...state,
        glyphs: new Map(state.glyphs).set(action.char, action.bitmap),
      }
  }
}

export default glyphReducer
