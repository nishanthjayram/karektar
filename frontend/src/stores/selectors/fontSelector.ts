import { IStore } from '@/types/stores'

export const selectActiveGlyphChar = (state: IStore) => state.activeGlyph
export const selectActiveGlyphBitmap = (state: IStore) =>
  state.activeGlyph && state.fontMap ? state.fontMap.get(state.activeGlyph) : null

// export const selectActiveGlyph = (state: IStore) => ({

//   char: state.activeGlyph,
//   bitmap:
//     state.activeGlyph && state.fontMap ? state.fontMap.get(state.activeGlyph) : null,
// })

// export const selectAllGlyphs = (state: IStore) =>
//   state.fontMap ? Array.from(state.fontMap.keys()) : []

// export const selectGlyphCount = (state: IStore) =>
//   state.fontMap ? state.fontMap.size : 0
