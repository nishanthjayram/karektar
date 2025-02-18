import { TBitmapSize, TFontMap, TRenderMode } from '@/types/common'
import Bitmap from '@/classes/Bitmap'

export const DEFAULT_RENDER_MODE: TRenderMode = {
  preview: {
    setColor: 43,
    unsetColor: 239,
    setAlpha: 128, // Adjusted for semi-transparency
    unsetAlpha: 0, // Keeping unset pixels transparent
  },
  main: {
    setColor: 43,
    unsetColor: 239,
    setAlpha: 255, // Fully opaque
    unsetAlpha: 255, // Fully opaque
  },
} as const

export const DEFAULT_BITMAP_SIZE: TBitmapSize = 16

export const MAX_SCALE = 30

export const DEFAULT_FONT_MAP = (bitmapSize: TBitmapSize): TFontMap => {
  console.log(bitmapSize)
  const fontMap = new Map()
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    .split('')
    .forEach(symbol => fontMap.set(symbol, new Bitmap(bitmapSize)))
  return fontMap
}

export const DEFAULT_CANVAS_SIZE = 500
