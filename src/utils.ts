import {RX_LETTERS, RX_NON_ALPHANUMERIC, RX_NUMBERS} from './constants'
import {TFont} from './types'

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
  const newGlyphSet = new Map<string, boolean[]>()
  symbolSet.forEach(symbol => newGlyphSet.set(symbol, initializeGlyph(bitmapSize)))
  return {
    activeGlyph: symbolSet[0],
    activeMenu: undefined,
    bitmapSize: bitmapSize,
    canvasHistory: [initializeGlyph(bitmapSize)],
    captureFlag: false,
    currentTool: 'DRAW',
    glyphSet: newGlyphSet,
    guidelinesFlag: true,
    historyIndex: 0,
    modelFlag: true,
    shapeRange: undefined,
    symbolSet: symbolSet,
  }
}

export const initializeGlyph = (bitmapSize: number) =>
  new Array<boolean>(bitmapSize ** 2).fill(false)
