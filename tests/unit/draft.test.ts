import {describe, expect, test, vi} from 'vitest'
import {
  areFontDraftsEqual,
  serializeFontDraft,
} from '../../src/services/draft'
import {initializeFont, initializeGlyph} from '../../src/utils/helpers/app.helpers'

describe('draft serialization', () => {
  test('serializes the current reducer-backed font state', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123)
    const fontState = initializeFont(4, 400, undefined, 48, 'ab', false)
    const glyph = initializeGlyph(fontState.bitmapSize)
    glyph[2] = true
    fontState.glyphSet.set('a', glyph)

    expect(serializeFontDraft(fontState)).toEqual({
      version: 1,
      bitmapSize: 4,
      activeGlyph: 'a',
      glyphs: {
        a: glyph,
        b: initializeGlyph(fontState.bitmapSize),
      },
      inputText: 'ab',
      symbolSet: ['a', 'b'],
      updatedAt: 123,
    })
  })

  test('compares drafts by editor content instead of timestamp', () => {
    const draft = serializeFontDraft(initializeFont(4, 400, undefined, 48, 'a', false))

    expect(
      areFontDraftsEqual(draft, {
        ...draft,
        updatedAt: draft.updatedAt + 1,
      }),
    ).toBe(true)

    expect(
      areFontDraftsEqual(draft, {
        ...draft,
        activeGlyph: 'b',
      }),
    ).toBe(false)
  })
})
