import { useCallback, useEffect, useRef, useState } from 'react'
import { TPos } from '@/types/common'
import { usePointer } from '@/hooks/usePointer'
import { useEditorStore } from '@/stores'
import { renderGuidelines } from '@/utils/editor/renderGuidelines'
import { renderToCanvas } from '@/utils/editor/renderToCanvas'
import styles from './styles/Canvas.module.css'

export const Canvas = () => {
  // Check if the editor is ready
  const {
    isReady,
    bitmapSize,
    scale,
    layers,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useEditorStore()

  if (!isReady() || !bitmapSize || !scale) return null

  const containerRef = useRef<HTMLDivElement>(null)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const guidelineCanvasRef = useRef<HTMLCanvasElement>(null)

  const dpr = window.devicePixelRatio || 1
  const fixedCanvasSize = 640 // Fixed UI canvas size

  // Keep scale calculation in a memoized value
  const getCalculatedScale = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? fixedCanvasSize
    const scaleFactor = containerWidth / (bitmapSize * scale)
    return scale * scaleFactor
  }, [bitmapSize, scale])

  const [finalScale, setFinalScale] = useState(getCalculatedScale())

  // Handle container resizing
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      const newScale = getCalculatedScale()
      setFinalScale(newScale)

      // Re-render all canvases with new scale
      if (layers) {
        renderToCanvas(mainCanvasRef.current, layers.main, newScale)
      }
      renderGuidelines(guidelineCanvasRef.current, bitmapSize, newScale)
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [layers, bitmapSize, getCalculatedScale])

  // Regular rendering effects
  useEffect(
    () => renderToCanvas(mainCanvasRef.current, layers.main, finalScale),
    [layers.main, finalScale],
  )

  useEffect(
    () => renderToCanvas(previewCanvasRef.current, layers.preview, finalScale, true),
    [layers.preview, finalScale],
  )

  useEffect(() => {
    renderGuidelines(guidelineCanvasRef.current, bitmapSize, finalScale)
  }, [bitmapSize, finalScale])

  // Pointer event handlers
  const handlePointerDownCb = useCallback(
    (pos: TPos) => handlePointerDown(pos),
    [handlePointerDown],
  )

  const handlePointerMoveCb = useCallback(
    (pos: TPos) => handlePointerMove(pos),
    [handlePointerMove],
  )

  const handlePointerUpCb = useCallback(() => handlePointerUp(), [handlePointerUp])

  usePointer(mainCanvasRef, bitmapSize, finalScale, {
    handlePointerDown: handlePointerDownCb,
    handlePointerMove: handlePointerMoveCb,
    handlePointerUp: handlePointerUpCb,
  })

  return (
    <div
      ref={containerRef}
      className={styles.canvasWrapper}
      style={{
        width: `${fixedCanvasSize}px`,
        height: `${fixedCanvasSize}px`,
      }}
    >
      <canvas
        ref={guidelineCanvasRef}
        className={styles.guidelineCanvas}
        width={fixedCanvasSize * dpr}
        height={fixedCanvasSize * dpr}
        style={{ width: `${fixedCanvasSize}px`, height: `${fixedCanvasSize}px` }}
      />
      <canvas
        ref={previewCanvasRef}
        className={styles.previewCanvas}
        width={fixedCanvasSize * dpr}
        height={fixedCanvasSize * dpr}
        style={{ width: `${fixedCanvasSize}px`, height: `${fixedCanvasSize}px` }}
      />
      <canvas
        ref={mainCanvasRef}
        className={styles.drawingCanvas}
        width={fixedCanvasSize * dpr}
        height={fixedCanvasSize * dpr}
        style={{ width: `${fixedCanvasSize}px`, height: `${fixedCanvasSize}px` }}
      />
    </div>
  )
}
