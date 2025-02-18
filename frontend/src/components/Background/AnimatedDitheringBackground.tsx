import React, { useEffect, useRef, useState } from 'react'

const AnimatedDitheredBackground = () => {
  const [pattern, setPattern] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef(null)
  const timeRef = useRef(0)

  const atkinsonDither = (imageData: ImageData, noiseAmount = 0) => {
    const width = imageData.width
    const height = imageData.height
    const data = new Uint8ClampedArray(imageData.data)

    // Add random noise to initial values
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * noiseAmount
      data[i] = Math.max(0, Math.min(255, data[i] + noise))
      data[i + 1] = data[i]
      data[i + 2] = data[i]
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

  const createBitmapPattern = (ctx, time) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    // Set up the bitmap drawing
    ctx.fillStyle = 'black'
    const pixelSize = 12

    const drawPixel = (x: number, y: number) => {
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }

    // Simple bitmap font for "HELLO"
    const bitmapFont = {
      H: [
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
      ],
      // Add more letters as needed
    }

    // Draw characters with slight movement
    const offset = Math.sin(time / 1000) * 5 // Subtle floating movement

    // Add dynamic noise particles
    const noiseCount = 100
    for (let i = 0; i < noiseCount; i++) {
      const x = Math.floor(Math.random() * (width / pixelSize))
      const y = Math.floor(Math.random() * (height / pixelSize))
      // Noise opacity varies with time
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`
      drawPixel(x, y + Math.sin((time + x) / 500) * 2)
    }
  }

  const animate = (timestamp: number) => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Update time reference
    timeRef.current = timestamp

    // Create new pattern with current timestamp
    createBitmapPattern(ctx, timestamp)

    // Apply dithering with some noise
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const noiseAmount = 20 + Math.sin(timestamp / 1000) * 10 // Dynamic noise
    const dithered = atkinsonDither(imageData, noiseAmount)
    ctx.putImageData(dithered, 0, 0)

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    // Create and set up canvas
    const canvas = document.createElement('canvas')
    canvasRef.current = canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      canvas.remove()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gray-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

export default AnimatedDitheredBackground
