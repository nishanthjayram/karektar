import { TPos } from '@/types/common'
import { DEFAULT_RENDER_MODE } from '@/constants/defaults'
import Bitmap from '@/classes/Bitmap'

export const renderToCanvas = (
  canvas: HTMLCanvasElement | null,
  bitmap: Bitmap | null,
  scale: number,
  isPreview: boolean = false,
) => {
  if (!canvas) return
  const ctx = canvas.getContext('2d', { alpha: isPreview })
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const displaySize = bitmap
    ? Math.round(bitmap.getSize() * scale)
    : canvas.width / dpr

  // Set physical canvas size accounting for DPR
  canvas.width = displaySize * dpr
  canvas.height = displaySize * dpr

  // Clear the canvas first
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // If no bitmap, we're done after clearing
  if (!bitmap) return

  // Rest of rendering logic only happens if we have a bitmap
  ctx.scale(dpr, dpr)
  ctx.imageSmoothingEnabled = false

  const mode = DEFAULT_RENDER_MODE[isPreview ? 'preview' : 'main']
  const bitmapSize = bitmap.getSize()

  const sourceImageData = ctx.createImageData(bitmapSize, bitmapSize)
  const data = sourceImageData.data

  // Batch pixel writes
  for (let i = 0; i < data.length; i += 4) {
    const pos: TPos = [(i / 4) % bitmapSize, Math.floor(i / 4 / bitmapSize)]
    const pixelValue = bitmap.getPixel(pos)

    const { setColor, unsetColor, setAlpha, unsetAlpha } = mode
    const color = pixelValue ? setColor : unsetColor
    const alpha = pixelValue ? setAlpha : unsetAlpha

    data[i] = color // R
    data[i + 1] = color // G
    data[i + 2] = color // B
    data[i + 3] = alpha
  }

  // Use temporary canvas for scaling
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = bitmapSize
  tempCanvas.height = bitmapSize
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return

  // Draw unscaled image data
  tempCtx.putImageData(sourceImageData, 0, 0)

  // Scale up with crisp pixels
  ctx.drawImage(
    tempCanvas,
    0,
    0,
    bitmapSize,
    bitmapSize, // source dimensions
    0,
    0,
    displaySize,
    displaySize, // destination dimensions
  )

  tempCanvas.remove()
}
