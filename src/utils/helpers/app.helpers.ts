import {
  RX_LETTERS,
  RX_NON_ALPHANUMERIC,
  RX_NUMBERS,
} from '@/constants/app.constants'
import GlyphBitmap from '@/classes/Bitmap'
import { TFont, TGlyph, TGlyphSet, TSymbol } from '@/types'

export const assertUnreachable = (x: never): never => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Default case should not be reachable. ${x}`)
}

export const compareArrays = <T>(a: T[], b: T[]) =>
  a !== undefined &&
  b !== undefined &&
  a.length === b.length &&
  a.every((v, i) => v === b[i])

export const compareUint8Arrays = (a: Uint8Array, b: Uint8Array) =>
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

export const initializeFont = (
  bitmapSize: number,
  canvasSize: number,
  glyphSetModal: boolean | undefined,
  glyphSize: number,
  inputText: string,
  screenFlag: boolean,
): TFont => {
  const pixelSize = canvasSize / bitmapSize
  const symbolSet = getUniqueCharacters(inputText)

  const newGlyphSet: TGlyphSet = new Map<TSymbol, TGlyph>()
  symbolSet.forEach(symbol => newGlyphSet.set(symbol, initializeGlyph(bitmapSize)))
  return {
    activeGlyph: symbolSet[0],
    activeMenu: undefined,
    bitmapSize: bitmapSize,
    canvasHistory: [initializeGlyph(bitmapSize)],
    canvasSize: canvasSize,
    captureFlag: false,
    confirmModal: undefined,
    currentTool: 'DRAW',
    galleryPage: 0,
    glyphSet: newGlyphSet,
    glyphSetModal: glyphSetModal,
    glyphSize: glyphSize,
    guidelinesFlag: true,
    historyIndex: 0,
    hlinePos: pixelSize * 12,
    inputText: inputText,
    modelFlag: true,
    pixelSize: pixelSize,
    screenFlag: screenFlag,
    shapeRange: undefined,
    symbolSet: symbolSet,
    vlinePos: pixelSize * 2,
  }
}

export const initializeGlyph = (bitmapSize: number) => new GlyphBitmap(bitmapSize)

export const isEmptyGlyph = (glyph: TGlyph) => glyph.getData().every(c => !c)
