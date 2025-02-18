import { TBitmapSize } from '@/types/common'
import { DEFAULT_CANVAS_SIZE } from '@/constants/defaults'

export const calculateScale = (bitmapSize: TBitmapSize): number => {
  return DEFAULT_CANVAS_SIZE / bitmapSize
  const viewportWidth = window.innerWidth
  const maxCanvasSize = viewportWidth * 0.6 // Limit canvas to 60% of the screen width

  return Math.floor(maxCanvasSize / bitmapSize) || 1 // Ensure at least scale 1
}
