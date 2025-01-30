import React, { useEffect, useRef } from 'react'
import { updateCanvas } from '@/utils/updateCanvas'
import { TEditorAction, TEditorState } from '../../utils/reducers/editorReducer'
import { TPointerAction, TPointerState } from '../../utils/reducers/pointerReducer'
import styles from './Editor.module.css'
import ToolBar from './ToolBar/ToolBar'

export const DEFAULT_BITMAP_SIZE = 16

type TEditorProps = {
  editorState: TEditorState
  editorDispatch: React.Dispatch<TEditorAction>
  pointerState: TPointerState
  pointerDispatch: React.Dispatch<TPointerAction>
}
const Editor: React.FC<TEditorProps> = ({
  editorState,
  pointerState,
  pointerDispatch,
}) => {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const scale = editorState.scale
  const bitmapSize = editorState.layers.main.getSize()
  const displaySize = bitmapSize * scale

  useEffect(() => {
    updateCanvas(mainCanvasRef.current, editorState.layers.main, editorState.scale)
  }, [editorState.layers.main, editorState.scale])

  useEffect(() => {
    updateCanvas(
      previewCanvasRef.current,
      editorState.layers.preview,
      editorState.scale,
      true,
    )
  }, [editorState.layers.preview, editorState.scale])

  const getPointerPos = (
    e: React.PointerEvent<HTMLDivElement>,
  ): [number, number] | null => {
    const rect = mainCanvasRef.current?.getBoundingClientRect()
    if (!rect) return null

    const x = Math.floor((e.clientX - rect.left + 0.5) / scale)
    const y = Math.floor((e.clientY - rect.top + 0.5) / scale)

    if (
      x < 0 ||
      x >= editorState.layers.main.getSize() ||
      y < 0 ||
      y >= editorState.layers.main.getSize()
    )
      return null

    return [x, y]
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pos = getPointerPos(e)
    if (!pos) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerDispatch({ type: 'pointerDown', pos })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pos = getPointerPos(e)
    if (!pos) return
    pointerDispatch({ type: 'pointerMove', pos })
  }

  const handlePointerUp = () => {
    pointerDispatch({ type: 'pointerUp' })
  }

  return (
    <div className={styles.editor}>
      <ToolBar
        tools={['pen', 'eraser', 'line', 'rectangle', 'ellipse', 'fill']}
        currentTool={pointerState.currentTool}
        pointerDispatch={pointerDispatch}
        displaySize={displaySize}
      />
      <div
        className={styles.canvasContainer}
        style={{ width: displaySize }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <GuidelineCanvas bitmapSize={bitmapSize} scale={editorState.scale} />
        <canvas
          ref={mainCanvasRef}
          className={`${styles.canvas} ${styles.drawingCanvas}`}
          style={{ touchAction: 'none' }}
        />
        <canvas
          ref={previewCanvasRef}
          className={`${styles.canvas} ${styles.previewCanvas}`}
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  )
}

type TGuidelineCanvasProps = { bitmapSize: number; scale: number }
const GuidelineCanvas: React.FC<TGuidelineCanvasProps> = ({ bitmapSize, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Account for device pixel ratio
    const dpr = window.devicePixelRatio || 1
    const displaySize = bitmapSize * scale

    // Set the actual size of the canvas
    canvas.width = displaySize * dpr
    canvas.height = displaySize * dpr

    // Scale the canvas display size
    canvas.style.width = `${displaySize}px`
    canvas.style.height = `${displaySize}px`

    // Scale the context to account for the device pixel ratio
    ctx.scale(dpr, dpr)

    ctx.imageSmoothingEnabled = false
    ctx.lineWidth = 1

    // Draw the gridlines
    ctx.beginPath()
    ctx.strokeStyle = '#fff'

    Array.from({ length: bitmapSize - 1 }, (_, i) => i + 1).forEach(i => {
      const v = i * scale
      ctx.moveTo(v + 0.5, 0)
      ctx.lineTo(v + 0.5, displaySize)
      ctx.moveTo(0, v + 0.5)
      ctx.lineTo(displaySize, v + 0.5)
    })

    ctx.stroke()
  }, [bitmapSize, scale])

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${styles.guidelineCanvas}`}
    />
  )
}

export default Editor
