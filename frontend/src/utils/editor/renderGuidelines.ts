export const renderGuidelines = (
  canvas: HTMLCanvasElement | null,
  bitmapSize: number,
  scale: number,
) => {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const displaySize = Math.floor(bitmapSize * scale) // Ensures full integer size

  // Adjust for high DPI displays
  canvas.width = displaySize * dpr
  canvas.height = displaySize * dpr
  canvas.style.width = `${displaySize}px`
  canvas.style.height = `${displaySize}px`

  // Ensure pixel-perfect scaling
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false

  // Clear before drawing guidelines
  ctx.clearRect(0, 0, displaySize, displaySize)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)' // ✅ White guidelines
  ctx.lineWidth = 1 / dpr

  // 🔥 Ensures crisp line alignment
  ctx.translate(0.5, 0.5) // Shift grid lines to exact pixel edges
  ctx.beginPath()

  // Draw vertical lines
  for (let x = 0; x <= bitmapSize; x++) {
    const posX = Math.floor(x * scale)
    ctx.moveTo(posX, 0)
    ctx.lineTo(posX, displaySize)
  }

  // Draw horizontal lines
  for (let y = 0; y <= bitmapSize; y++) {
    const posY = Math.floor(y * scale)
    ctx.moveTo(0, posY)
    ctx.lineTo(displaySize, posY)
  }

  ctx.stroke()
}
