import {TFont, TGlyph, TGlyphSet, TSymbol} from '../../types'
import {
  DEFAULT_PROMPT,
  RX_LETTERS,
  RX_NON_ALPHANUMERIC,
  RX_NUMBERS,
} from '../constants/app.constants'
import {EDITOR_SIZE} from '../constants/canvas.constants'

export const assertUnreachable = (x: never): never => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Default case should not be reachable. ${x}`)
}

export const compareArrays = <T>(a: T[], b: T[]) =>
  a !== undefined &&
  b !== undefined &&
  a.length === b.length &&
  a.every((v, i) => v === b[i])
export const getUniqueCharacters = (input: string) => {
  const uniqueCharacters = [...new Set<string>(input)]

  const letters = uniqueCharacters.flatMap(c => c.match(RX_LETTERS) ?? [])
  const numbers = uniqueCharacters.flatMap(c => c.match(RX_NUMBERS) ?? [])
  const nonAlphaNum = uniqueCharacters.flatMap(
    c => c.match(RX_NON_ALPHANUMERIC) ?? [],
  )

  return [letters, numbers, nonAlphaNum].flatMap(c => c.sort())
}

export const initializeFont = (bitmapSize: number, symbolSet: string[]): TFont => {
  const newGlyphSet: TGlyphSet = new Map<TSymbol, TGlyph>()
  symbolSet.forEach(symbol => newGlyphSet.set(symbol, initializeGlyph(bitmapSize)))
  return {
    activeGlyph: symbolSet[0],
    activeMenu: undefined,
    bitmapSize: bitmapSize,
    canvasHistory: [initializeGlyph(bitmapSize)],
    captureFlag: false,
    currentTool: 'DRAW',
    galleryPage: 0,
    glyphSet: newGlyphSet,
    guidelinesFlag: true,
    historyIndex: 0,
    inputText: DEFAULT_PROMPT,
    modelFlag: true,
    pixelSize: EDITOR_SIZE / bitmapSize,
    shapeRange: undefined,
    symbolSet: symbolSet,
  }
}

export const initializeGlyph = (bitmapSize: number) =>
  new Array<boolean>(bitmapSize ** 2).fill(false)

export const isEmptyGlyph = (glyph: TGlyph) => glyph.every(c => !c)
