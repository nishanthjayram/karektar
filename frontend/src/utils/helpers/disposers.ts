import { TFontMap } from '@/types/common'

/** Utility function to dispose of previous objects before replacing them */
export const disposeOnReplace = <T extends { [Symbol.dispose]?: () => void }>(
  oldValue: T | null,
  newValue: T | null,
) => {
  console.log(oldValue)
  oldValue?.[Symbol.dispose]?.()
  return newValue
}

/** Disposes all Bitmaps in a given font map */
export const disposeFontMap = (fontMap: TFontMap | null) => {
  if (!fontMap) return
  for (const bitmap of fontMap.values()) {
    bitmap[Symbol.dispose]()
  }
}
