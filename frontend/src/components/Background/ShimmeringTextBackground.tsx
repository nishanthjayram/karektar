import React, { useEffect, useRef } from 'react'

const SubtleAtkinsonText = () => {
  const canvasRef = useRef(null)
  const frameRef = useRef(null)

  // Precompute noise values for better performance
  const noiseTable = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    noiseTable[i] = (Math.random() - 0.5) * 6
  }

  const atkinsonDither = (imageData, time) => {
    const width = imageData.width
    const height = imageData.height
    const data = new Uint8ClampedArray(imageData.data)

    // Simplified noise calculation using time
    const timeOffset = 0

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

        // Fast noise lookup based on position and time
        const noiseIndex = (x + y + Math.floor(timeOffset)) & 255
        const threshold = 127 + noiseTable[noiseIndex]

        const oldPixel = data[idx]
        const newPixel = oldPixel > threshold ? 255 : 0

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

  const createBitmapPattern = ctx => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'black'
    const pixelSize = 1

    // Your existing character set
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
    ]

    const gridWidth = Math.floor(width / (pixelSize * 6))
    const gridHeight = Math.floor(height / (pixelSize * 7))

    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const char = characters[Math.floor(Math.random() * characters.length)]
        const startX = col * 6
        const startY = row * 7

        char.forEach((charRow, y) => {
          charRow.forEach((pixel, x) => {
            if (pixel === 1) {
              ctx.fillRect(
                (startX + x) * pixelSize,
                (startY + y) * pixelSize,
                pixelSize,
                pixelSize,
              )
            }
          })
        })
      }
    }
  }

  const animate = timestamp => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Only redraw every other frame for performance
    if (timestamp % 2 === 0) {
      createBitmapPattern(ctx)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const dithered = atkinsonDither(imageData, timestamp)
      ctx.putImageData(dithered, 0, 0)
    }

    frameRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
      }}
    />
  )
}

export default SubtleAtkinsonText
