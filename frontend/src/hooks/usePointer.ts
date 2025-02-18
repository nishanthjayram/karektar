import { useEffect } from 'react'
import { TPos } from '@/types/common'

export const usePointer = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  bitmapSize: number,
  scale: number,
  handlers: {
    handlePointerDown: (pos: TPos) => void
    handlePointerMove: (pos: TPos) => void
    handlePointerUp: () => void
  },
) => {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // ✅ Compute the actual rendered size of the bitmap (pixels)
    const trueScale = rect.width / bitmapSize // Uses CSS size, NOT the scale state

    const getPointerPos = (e: PointerEvent): TPos | null => {
      const x = Math.floor((e.clientX - rect.left) / trueScale)
      const y = Math.floor((e.clientY - rect.top) / trueScale)

      // console.log(`Pointer Raw: ${e.clientX}, ${e.clientY}`)
      // console.log(
      //   `Computed: x=${x}, y=${y}, bitmapSize=${bitmapSize}, scale=${scale}`,
      // )

      return x < 0 || x >= bitmapSize || y < 0 || y >= bitmapSize ? null : [x, y]
    }

    const onPointerDown = (e: PointerEvent) => {
      const pos = getPointerPos(e)
      if (pos) {
        canvas.setPointerCapture(e.pointerId)
        handlers.handlePointerDown(pos)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const pos = getPointerPos(e)
      if (pos) handlers.handlePointerMove(pos)
    }

    const onPointerUp = (e: PointerEvent) => {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId)
      }
      handlers.handlePointerUp()
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('pointerout', onPointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerout', onPointerUp)
    }
  }, [canvasRef, handlers, scale, bitmapSize])
}
