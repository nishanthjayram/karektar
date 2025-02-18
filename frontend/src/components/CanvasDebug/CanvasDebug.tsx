// CanvasDebug.tsx
import React, { useEffect, useRef } from 'react'
import { useEditorStore } from '@/stores'
import { renderToCanvas } from '@/utils/editor/renderToCanvas'
import styles from './CanvasDebug.module.css'

export const CanvasDebug = () => {
  const { bitmapSize, scale, layers } = useEditorStore()
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  if (!bitmapSize || !scale) return null

  const dpr = window.devicePixelRatio || 1
  const debugCanvasSize = 320 // Half of original for side-by-side

  // Render debug canvases
  useEffect(
    () => renderToCanvas(mainCanvasRef.current, layers.main, scale / 2),
    [layers.main, scale],
  )

  useEffect(
    () => renderToCanvas(previewCanvasRef.current, layers.preview, scale / 2, true),
    [layers.preview, scale],
  )

  return (
    <div className={styles.debug}>
      <div className={styles.debugTitle}>Debug View</div>
      <div className={styles.canvasContainer}>
        <div className={styles.canvasWrapper}>
          <div className={styles.canvasLabel}>Main Layer</div>
          <canvas
            ref={mainCanvasRef}
            className={styles.debugCanvas}
            width={debugCanvasSize * dpr}
            height={debugCanvasSize * dpr}
            style={{ width: `${debugCanvasSize}px`, height: `${debugCanvasSize}px` }}
          />
        </div>
        <div className={styles.canvasWrapper}>
          <div className={styles.canvasLabel}>Preview Layer</div>
          <canvas
            ref={previewCanvasRef}
            className={styles.debugCanvas}
            width={debugCanvasSize * dpr}
            height={debugCanvasSize * dpr}
            style={{ width: `${debugCanvasSize}px`, height: `${debugCanvasSize}px` }}
          />
        </div>
      </div>
      <div className={styles.debugStatus}>
        Main: {layers.main ? '✅' : '❌'} | Preview: {layers.preview ? '✅' : '❌'}
      </div>
    </div>
  )
}
