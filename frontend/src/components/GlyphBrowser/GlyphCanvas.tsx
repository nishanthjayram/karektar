import { useEffect, useRef } from 'react'
import Bitmap from '@/classes/Bitmap'
import { useEditorStore } from '@/stores'
import { renderToCanvas } from '@/utils/editor/renderToCanvas'
import { calculateScale } from '@/utils/editor/scale'
import styles from './styles/GlyphCanvas.module.css'

type TGlyphCanvasProps = {
  char: string
  bitmap: Bitmap
  active: boolean
}

const GlyphCanvas: React.FC<TGlyphCanvasProps> = ({ char, bitmap, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scale = Math.floor(calculateScale(bitmap.getSize()) / 6) // Adjust glyph scaling
  const displaySize = bitmap.getSize() * scale
  const { fontMap, setActiveGlyph, setBitmap, layers } = useEditorStore()

  if (!fontMap) return null

  useEffect(() => {
    renderToCanvas(canvasRef.current, active ? layers.main : bitmap, scale)
  }, [fontMap, layers, scale])

  return (
    <div className={`${styles.container} ${active ? styles.active : ''}`}>
      <div
        key={char}
        className={styles.glyph}
        onClick={() => {
          setActiveGlyph(char)
          const glyphBitmap = active ? layers.main : fontMap.get(char)
          if (glyphBitmap) setBitmap(glyphBitmap.clone())
        }}
        style={{ width: displaySize, height: displaySize }}
      >
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div className={styles.char}>{char}</div>
    </div>
  )
}

export default GlyphCanvas
