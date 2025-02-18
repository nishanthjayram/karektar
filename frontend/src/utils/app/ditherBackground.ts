/**
 * Apply Atkinson dithering to an image.
 * @param {ImageData} imageData - The original image data
 * @returns {ImageData} The dithered image data
 */
export function atkinsonDither(imageData: ImageData): ImageData {
  const width = imageData.width
  const height = imageData.height
  const data = new Uint8ClampedArray(imageData.data)

  // Convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = data[i + 1] = data[i + 2] = gray
  }

  // Atkinson dithering pattern:
  // X 1 1
  // 1 1 1
  // _ 1 _
  // (where X is the current pixel, 1 represents 1/8 of the error, and _ represents no error distribution)
  const pattern = [
    [1, 0],
    [2, 0], // right pixels
    [-1, 1],
    [0, 1],
    [1, 1], // next row
    [0, 2], // two rows down
  ]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldPixel = data[idx]
      const newPixel = oldPixel > 127 ? 255 : 0
      data[idx] = data[idx + 1] = data[idx + 2] = newPixel

      const error = Math.floor((oldPixel - newPixel) / 8)

      // Distribute error to neighboring pixels
      for (const [dx, dy] of pattern) {
        const nx = x + dx
        const ny = y + dy

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = (ny * width + nx) * 4
          data[nidx] = Math.min(255, Math.max(0, data[nidx] + error))
          data[nidx + 1] = data[nidx]
          data[nidx + 2] = data[nidx]
        }
      }
    }
  }

  return new ImageData(data, width, height)
}

/**
 * Helper function to apply dithering to an image element
 * @param {HTMLImageElement} img - The source image element
 * @returns {string} The data URL of the dithered image
 */
export function ditherImage(img: HTMLImageElement): string {
  // Create canvas and get context
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('Could not get 2D context')

  // Draw image to canvas
  ctx.drawImage(img, 0, 0)

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Apply dithering
  const ditheredData = atkinsonDither(imageData)

  // Put dithered image back to canvas
  ctx.putImageData(ditheredData, 0, 0)

  // Convert to data URL and clean up
  const dataURL = canvas.toDataURL('image/png')
  canvas.remove()
  return dataURL
}

/**
 * Generate the classic System 7 background pattern.
 * This creates the iconic 50% gray dithered pattern used in the original Mac OS.
 * @returns {string} A base64-encoded PNG data URL of the pattern.
 */
export function generateSystem7Background(tileSize: number) {
  // Create canvas for the 8x8 pattern
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context')

  // Disable image smoothing for crisp pixels
  ctx.imageSmoothingEnabled = false

  // Create ImageData for the 8x8 pattern
  const imageData = ctx.createImageData(8, 8)
  const data = imageData.data

  // The exact System 7 pattern (1 = white, 0 = black)
  const pattern = [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
  ]

  // Fill the ImageData with the pattern
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const idx = (y * 8 + x) * 4
      // Use light gray and darker gray instead of pure black/white
      const color = pattern[y][x] ? 204 : 170 // Slightly softer contrast than pure black/white
      data[idx + 0] = color // R
      data[idx + 1] = color // G
      data[idx + 2] = color // B
      data[idx + 3] = 255 // A
    }
  }

  // Put the pattern into the canvas
  ctx.putImageData(imageData, 0, 0)

  // Create CSS-ready pattern
  const dataURL = canvas.toDataURL('image/png')
  canvas.remove()
  return dataURL
}

/**
 * Apply the System 7 background to an element
 * @param {HTMLElement} element - The element to apply the background to
 */
export function applySystem7Background(element: HTMLElement) {
  const pattern = generateSystem7Background()
  element.style.backgroundColor = '#BBBBBB' // Fallback color
  element.style.backgroundImage = `url(${pattern})`
  element.style.backgroundRepeat = 'repeat'
}
