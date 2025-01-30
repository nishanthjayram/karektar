import Bitmap from '@classes/Bitmap'
import { useEffect, useRef } from 'react'
import { TGlyphState } from '@/utils/reducers/glyphReducer'
import { updateCanvas } from '@/utils/updateCanvas'
import styles from './Gallery.module.css'

interface GalleryProps {
  glyphState: TGlyphState
  onSelectGlyph: (glyph: string) => void
  onAddGlyph: (char: string) => void
  onRemoveGlyph: (char: string) => void
}

const Gallery: React.FC<GalleryProps> = ({
  glyphState,
  onSelectGlyph,
  onAddGlyph,
  // onRemoveGlyph,
}) => {
  return (
    <div className={styles.gallery}>
      {Array.from(glyphState.glyphs.entries()).map(([char, bitmap]) => (
        <GlyphCanvas
          key={char}
          char={char}
          bitmap={bitmap}
          onSelectGlyph={onSelectGlyph}
          active={glyphState.activeGlyph === char}
        />
      ))}
      <button
        onClick={() => {
          const char = prompt('Enter character:')
          if (char) onAddGlyph(char)
        }}
      >
        Add Glyph
      </button>
    </div>
  )
}

interface GlyphCanvasProps {
  char: string
  bitmap: Bitmap
  onSelectGlyph: (char: string) => void
  active: boolean
  scale?: number
}

const GlyphCanvas: React.FC<GlyphCanvasProps> = ({
  char,
  bitmap,
  onSelectGlyph,
  active,
  scale = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    updateCanvas(canvasRef.current, bitmap, scale)
  }, [bitmap, scale])

  const displaySize = bitmap.getSize() * scale

  return (
    <div
      key={char}
      className={styles.glyph}
      onClick={() => onSelectGlyph(char)}
      style={{ width: displaySize }}
    >
      <div
        className={`${styles.char} ${active ? styles.activeChar : ''}`}
        style={{ height: displaySize * 0.25 }}
      >
        {char}
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}

export default Gallery
