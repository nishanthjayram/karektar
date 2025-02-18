import { TBitmapSize, TFontMap } from '@/types/common'
import Bitmap from '@/classes/Bitmap'
import getUniqueCharacters from '../helpers/getUniqueCharacters'

export const createFontMap = (bitmapSize: TBitmapSize, charQuery?: string) => {
  const fontMap = new Map<string, Bitmap>()
  const chars = charQuery
    ? getUniqueCharacters(charQuery).sort()
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  chars.forEach(symbol => {
    if (!fontMap.has(symbol)) {
      fontMap.set(symbol, new Bitmap(bitmapSize))
    }
  })
  return fontMap
}
