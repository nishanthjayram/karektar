export const RX_LETTERS = /[A-Za-z]/g
export const RX_NUMBERS = /[0-9]/g
export const RX_NON_ALPHANUMERIC = /[^A-Za-z0-9\s]/g

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

export const initializeGlyph = (bitmapSize: number) =>
  new Array<boolean>(bitmapSize ** 2).fill(false)

export const initializeGlyphSet = (symbolSet: string[], bitmapSize: number) => {
  const newGlyphSet = new Map<string, boolean[]>()
  symbolSet.forEach(symbol => newGlyphSet.set(symbol, initializeGlyph(bitmapSize)))
  return newGlyphSet
}
