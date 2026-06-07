export type StoredFontDraft = {
  version: 1
  bitmapSize: number
  activeGlyph: string
  glyphs: Record<string, boolean[]>
  inputText: string
  symbolSet: string[]
  updatedAt: number
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string')

const isTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const isGlyph = (value: unknown, bitmapSize: number): value is boolean[] =>
  Array.isArray(value) &&
  value.length === bitmapSize ** 2 &&
  value.every(item => typeof item === 'boolean')

export const normalizeStoredFontDraft = (
  value: unknown,
): StoredFontDraft | null => {
  if (!isRecord(value)) {
    return null
  }

  if (
    value.version !== 1 ||
    typeof value.bitmapSize !== 'number' ||
    !Number.isInteger(value.bitmapSize) ||
    value.bitmapSize <= 0 ||
    typeof value.activeGlyph !== 'string' ||
    typeof value.inputText !== 'string' ||
    !isStringArray(value.symbolSet) ||
    !isTimestamp(value.updatedAt) ||
    !isRecord(value.glyphs)
  ) {
    return null
  }

  if (
    value.symbolSet.length === 0 ||
    !value.symbolSet.includes(value.activeGlyph)
  ) {
    return null
  }

  const glyphs: StoredFontDraft['glyphs'] = {}

  for (const symbol of value.symbolSet) {
    const glyph = value.glyphs[symbol]

    if (!isGlyph(glyph, value.bitmapSize)) {
      return null
    }

    glyphs[symbol] = [...glyph]
  }

  return {
    version: 1,
    bitmapSize: value.bitmapSize,
    activeGlyph: value.activeGlyph,
    glyphs,
    inputText: value.inputText,
    symbolSet: [...value.symbolSet],
    updatedAt: value.updatedAt,
  }
}
