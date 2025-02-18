import React, { useEffect, useState } from 'react'
import styles from './Background.module.css'

const atkinsonDither = (imageData: ImageData) => {
  const width = imageData.width
  const height = imageData.height
  const data = new Uint8ClampedArray(imageData.data)

  // Convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = data[i + 1] = data[i + 2] = gray
  }

  const pattern = [
    [1, 0],
    [2, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [0, 2],
  ]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldPixel = data[idx]
      const newPixel = oldPixel > 127 ? 255 : 0
      data[idx] = data[idx + 1] = data[idx + 2] = newPixel

      const error = Math.floor((oldPixel - newPixel) / 8)

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

const RetroDitheredBackground = () => {
  const [pattern, setPattern] = useState('')

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Choose one of the bitmap patterns:
      createBitmapTypographyPattern(ctx)
      // or
      //   createHelloPattern(ctx)

      // Apply dithering to the result
      const imageData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight)
      const dithered = atkinsonDither(imageData)
      ctx.putImageData(dithered, 0, 0)

      setPattern(canvas.toDataURL('image/png'))
    }

    return () => canvas.remove()
  }, [])

  /*  useEffect(() => {
    // Create canvas at window size
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Create a large gradient that covers the entire viewport
      //   const gradient = ctx.createRadialGradient(
      //     window.innerWidth / 2,
      //     window.innerHeight / 2,
      //     0,
      //     window.innerWidth / 2,
      //     window.innerHeight / 2,
      //     Math.max(window.innerWidth, window.innerHeight) / 1.5,
      //   )

      let gradient = ctx.createLinearGradient(
        0,
        0,
        window.innerWidth / 2,
        window.innerHeight / 2,
      )

      gradient.addColorStop(0, '#FFFFFF') // Pure white
      gradient.addColorStop(0.2, '#E6E6E6') // Light gray
      gradient.addColorStop(0.4, '#CCCCCC') // Medium light gray
      gradient.addColorStop(0.6, '#999999') // Medium gray
      gradient.addColorStop(0.8, '#666666') // Dark gray
      gradient.addColorStop(1, '#333333') // Very dark gray

      // Fill with gradient
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Apply dithering
      const imageData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight)
      const dithered = atkinsonDither(imageData)

      ctx.putImageData(dithered, 0, 0)

      setPattern(canvas.toDataURL('image/png'))
    }

    // Clean up
    return () => {
      canvas.remove()
    }
  }, []) // Consider adding window resize handler if needed
*/
  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${pattern})`,
        // backgroundSize: 'cover',
        // backgroundPosition: 'center',
        // backgroundRepeat: 'no-repeat',
      }}
    />
  )
}

const createBitmapTypographyPattern = ctx => {
  const width = window.innerWidth
  const height = window.innerHeight

  // Clear canvas
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // Set up the bitmap-style drawing context
  ctx.fillStyle = 'black'

  // Define pixel size for our "bitmap" grid
  const pixelSize = 1

  // Helper to draw a pixel in our grid
  const drawPixel = (x, y) => {
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
  }

  // Create a pattern of characters
  const characters = [
    // "K" pattern
    [
      [1, 0, 0, 1],
      [1, 0, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 1, 0],
      [1, 0, 0, 1],
    ],
    // "A" pattern
    [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
    ],
    // "R" pattern
    [
      [1, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 0, 1],
    ],
    // "E" pattern
    [
      [1, 1, 1, 1],
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [1, 1, 1, 1],
    ],
    // "K" pattern
    [
      [1, 0, 0, 1],
      [1, 0, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 1, 0],
      [1, 0, 0, 1],
    ],
    // "T" pattern
    [
      [1, 1, 1, 1],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    // "A" pattern
    [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
    ],
    // "R" pattern
    [
      [1, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 0, 1],
    ],
    // // "X" pattern
    // [
    //   [1, 0, 0, 1],
    //   [0, 1, 1, 0],
    //   [0, 1, 1, 0],
    //   [0, 1, 1, 0],
    //   [1, 0, 0, 1],
    // ],
    // // "O" pattern
    // [
    //   [0, 1, 1, 0],
    //   [1, 0, 0, 1],
    //   [1, 0, 0, 1],
    //   [1, 0, 0, 1],
    //   [0, 1, 1, 0],
    // ],
  ]

  // Calculate grid dimensions
  const gridWidth = Math.floor(width / (pixelSize * 10)) // 6 pixels per char + space
  const gridHeight = Math.floor(height / (pixelSize * 10)) // 5 pixels height + space

  // Draw characters across the screen
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      // Choose a random character pattern
      const char = characters[Math.floor(Math.random() * characters.length)]

      // Calculate starting position for this character
      const startX = col * 10
      const startY = row * 10

      // Draw the character pixel by pixel
      char.forEach((charRow, y) => {
        charRow.forEach((pixel, x) => {
          if (pixel === 1) {
            drawPixel(startX + x, startY + y)
          }
        })
      })
    }
  }

  // Add some random "pixel noise" in the background
  for (let i = 0; i < (width * height) / (pixelSize * pixelSize * 40); i++) {
    const x = Math.floor(Math.random() * (width / pixelSize))
    const y = Math.floor(Math.random() * (height / pixelSize))
    ctx.fillStyle = Math.random() > 0.5 ? '#888' : '#ddd'
    drawPixel(x, y)
  }
}

// Alternative: Repeating "HELLO" pattern
export const createHelloPattern = ctx => {
  const width = window.innerWidth
  const height = window.innerHeight

  // Set up white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  const pixelSize = 8
  const word = 'HELLO'

  // Define bitmap font (simplified Chicago-style)
  const bitmapFont = {
    H: [
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
    ],
    E: [
      [1, 1, 1, 1],
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [1, 1, 1, 1],
    ],
    L: [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 1, 1],
    ],
    O: [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [0, 1, 1, 0],
    ],
  }

  // Draw pixelated text in a diagonal pattern
  for (let y = -height; y < height * 2; y += pixelSize * 8) {
    for (let x = -width; x < width * 2; x += pixelSize * 24) {
      // Offset each row
      const offset = (y / (pixelSize * 8)) * pixelSize * 4

      word.split('').forEach((char, index) => {
        const pattern = bitmapFont[char] ?? []
        if (pattern) {
          pattern.forEach((row, py) => {
            row.forEach((pixel, px) => {
              if (pixel === 1) {
                ctx.fillStyle = 'black'
                ctx.fillRect(
                  x + index * 5 * pixelSize + px * pixelSize + offset,
                  y + py * pixelSize,
                  pixelSize,
                  pixelSize,
                )
              }
            })
          })
        }
      })
    }
  }
}

export default RetroDitheredBackground
