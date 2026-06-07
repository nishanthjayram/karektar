import type {TFont, TSerializedFontDraft} from '../types'

const JSON_HEADERS = {'Content-Type': 'application/json'}

type DraftResult =
  | {status: 'ok'; draft: TSerializedFontDraft}
  | {status: 'empty'}
  | {status: 'unauthorized'}

type SaveDraftResult = {status: 'ok'} | {status: 'unauthorized'}

const isBooleanArray = (value: unknown): value is boolean[] =>
  Array.isArray(value) && value.every(item => typeof item === 'boolean')

const isSerializedFontDraft = (value: unknown): value is TSerializedFontDraft => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const record = value as Record<string, unknown>

  if (
    record.version !== 1 ||
    typeof record.bitmapSize !== 'number' ||
    typeof record.activeGlyph !== 'string' ||
    typeof record.inputText !== 'string' ||
    !Array.isArray(record.symbolSet) ||
    !record.symbolSet.every(symbol => typeof symbol === 'string') ||
    typeof record.glyphs !== 'object' ||
    record.glyphs === null ||
    Array.isArray(record.glyphs) ||
    typeof record.updatedAt !== 'number'
  ) {
    return false
  }

  return Object.values(record.glyphs).every(isBooleanArray)
}

export const serializeFontDraft = (fontState: TFont): TSerializedFontDraft => {
  const glyphs: TSerializedFontDraft['glyphs'] = {}

  fontState.symbolSet.forEach(symbol => {
    glyphs[symbol] = [...(fontState.glyphSet.get(symbol) ?? [])]
  })

  return {
    version: 1,
    bitmapSize: fontState.bitmapSize,
    activeGlyph: fontState.activeGlyph,
    glyphs,
    inputText: fontState.inputText,
    symbolSet: [...fontState.symbolSet],
    updatedAt: Date.now(),
  }
}

export const areFontDraftsEqual = (
  left: TSerializedFontDraft,
  right: TSerializedFontDraft,
) => {
  if (
    left.version !== right.version ||
    left.bitmapSize !== right.bitmapSize ||
    left.activeGlyph !== right.activeGlyph ||
    left.inputText !== right.inputText ||
    left.symbolSet.length !== right.symbolSet.length ||
    left.symbolSet.some((symbol, index) => symbol !== right.symbolSet[index])
  ) {
    return false
  }

  return left.symbolSet.every(symbol => {
    const leftGlyph = left.glyphs[symbol]
    const rightGlyph = right.glyphs[symbol]

    return (
      leftGlyph !== undefined &&
      rightGlyph !== undefined &&
      leftGlyph.length === rightGlyph.length &&
      leftGlyph.every((cell, index) => cell === rightGlyph[index])
    )
  })
}

export const loadCurrentDraft = async (): Promise<DraftResult> => {
  const response = await fetch('/api/draft/current', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return {status: 'unauthorized'}
  }

  if (response.status === 404) {
    return {status: 'empty'}
  }

  if (!response.ok) {
    throw new Error('Failed to load draft')
  }

  const draft = (await response.json()) as unknown

  if (!isSerializedFontDraft(draft)) {
    throw new Error('Invalid draft response')
  }

  return {status: 'ok', draft}
}

export const saveCurrentDraft = async (
  fontState: TFont,
): Promise<SaveDraftResult> => {
  const response = await fetch('/api/draft/current', {
    method: 'PUT',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify(serializeFontDraft(fontState)),
  })

  if (response.status === 401) {
    return {status: 'unauthorized'}
  }

  if (!response.ok) {
    throw new Error('Failed to save draft')
  }

  return {status: 'ok'}
}
