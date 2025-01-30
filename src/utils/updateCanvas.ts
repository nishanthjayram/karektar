import Bitmap from '@/classes/Bitmap'

export const updateCanvas = (
  canvas: HTMLCanvasElement | null,
  bitmap: Bitmap,
  scale: number,
  isPreview: boolean = false,
) => {
  if (!canvas) return
  const ctx = canvas.getContext('2d', { alpha: isPreview })
  if (!ctx) return

  const bitmapSize = bitmap.getSize()

  const dpr = window.devicePixelRatio || 1
  const displaySize = bitmapSize * scale

  // Set physical canvas size accounting for DPR
  canvas.width = displaySize * dpr
  canvas.height = displaySize * dpr

  // Set CSS size
  canvas.style.width = `${displaySize}px`
  canvas.style.height = `${displaySize}px`

  // Scale context for DPR
  ctx.scale(dpr, dpr)
  ctx.imageSmoothingEnabled = false

  // First draw at bitmap resolution
  const sourceImageData = ctx.createImageData(bitmapSize, bitmapSize)
  const data = sourceImageData.data

  // Batch pixel writes
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % bitmapSize
    const y = Math.floor(i / 4 / bitmapSize)
    const isSet = bitmap.getPixel([x, y])
    const color = isSet ? 43 : 239

    data[i] = color // R
    data[i + 1] = color // G
    data[i + 2] = color // B
    data[i + 3] = isPreview ? (isSet ? 255 : 0) : 255 // A
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
}
