import {describe, expect, test} from 'vitest'
import {initializeFont, initializeGlyph} from '../../src/utils/helpers/app.helpers'
import {fontReducer} from '../../src/utils/reducers/fontReducer'

const makeFont = () => initializeFont(4, 400, undefined, 48, 'ab', false)

describe('fontReducer', () => {
  test('updates the active glyph canvas and records undo history', () => {
    const state = makeFont()
    const glyph = initializeGlyph(state.bitmapSize)
    glyph[0] = true

    const drawnState = fontReducer(state, {
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_GLYPH_CANVAS',
      newGlyphCanvas: glyph,
    })
    const historyState = fontReducer(drawnState, {
      type: 'CANVAS_ACTION',
      op: 'UPDATE_CANVAS_HISTORY',
      newGlyphCanvas: glyph,
    })

    expect(historyState.glyphSet.get('a')?.[0]).toBe(true)
    expect(historyState.historyIndex).toBe(1)
    expect(historyState.canvasHistory).toHaveLength(2)
  })

  test('undo and redo restore glyph history entries', () => {
    const state = makeFont()
    const glyph = initializeGlyph(state.bitmapSize)
    glyph[0] = true
    const drawnState = fontReducer(state, {
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_GLYPH_CANVAS',
      newGlyphCanvas: glyph,
    })
    const historyState = fontReducer(drawnState, {
      type: 'CANVAS_ACTION',
      op: 'UPDATE_CANVAS_HISTORY',
      newGlyphCanvas: glyph,
    })

    const undone = fontReducer(historyState, {type: 'CANVAS_ACTION', op: 'UNDO'})
    const redone = fontReducer(undone, {type: 'CANVAS_ACTION', op: 'REDO'})

    expect(undone.glyphSet.get('a')?.[0]).toBe(false)
    expect(redone.glyphSet.get('a')?.[0]).toBe(true)
  })

  test('loads a compatible serialized draft', () => {
    const state = makeFont()
    const glyph = initializeGlyph(state.bitmapSize)
    glyph[3] = true

    const loaded = fontReducer(state, {
      type: 'GLYPH_SET_ACTION',
      op: 'LOAD_DRAFT',
      draft: {
        version: 1,
        bitmapSize: state.bitmapSize,
        activeGlyph: 'b',
        glyphs: {a: initializeGlyph(state.bitmapSize), b: glyph},
        inputText: 'ba',
        symbolSet: ['b', 'a'],
        updatedAt: 1,
      },
    })

    expect(loaded.activeGlyph).toBe('b')
    expect(loaded.inputText).toBe('ba')
    expect(loaded.glyphSet.get('b')?.[3]).toBe(true)
    expect(loaded.historyIndex).toBe(0)
  })

  test('preserves existing glyphs when the symbol set changes', () => {
    const state = makeFont()
    const glyph = initializeGlyph(state.bitmapSize)
    glyph[0] = true
    const drawnState = fontReducer(state, {
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_GLYPH_CANVAS',
      newGlyphCanvas: glyph,
    })

    const updated = fontReducer(drawnState, {
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_SYMBOL_SET',
      newSymbolSet: ['a', 'c'],
    })

    expect(updated.glyphSet.get('a')?.[0]).toBe(true)
    expect(updated.glyphSet.get('c')).toEqual(initializeGlyph(state.bitmapSize))
  })
})
