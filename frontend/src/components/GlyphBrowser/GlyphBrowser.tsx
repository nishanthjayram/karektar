import Bitmap from '@classes/Bitmap'
import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/stores'
import GlyphCanvas from './GlyphCanvas'
import styles from './styles/GlyphBrowser.module.css'

const GlyphBrowser: React.FC = () => {
  const { fontMap, activeGlyph, setActiveGlyph, setBitmap } = useEditorStore()

  if (!fontMap) return null

  const containerRef = useRef<HTMLDivElement>(null)
  const [maxGlyphs, setMaxGlyphs] = useState(10) // Default limit

  useEffect(() => {
    const updateMaxGlyphs = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight
        const glyphSize = 50 // Estimate glyph size (adjust if needed)
        const maxColumns = Math.floor(containerWidth / glyphSize)
        const maxRows = Math.floor(containerHeight / glyphSize)
        setMaxGlyphs(maxColumns * maxRows)
      }
    }

    updateMaxGlyphs() // Initial calculation
    window.addEventListener('resize', updateMaxGlyphs)
    return () => window.removeEventListener('resize', updateMaxGlyphs)
  }, [])

  const glyphs = Array.from(fontMap.entries()).slice(0, maxGlyphs) // Limit dynamically

  return (
    <div ref={containerRef} className={styles.gallery}>
      {glyphs.map(([char, bitmap]) => (
        <GlyphCanvas
          key={char}
          char={char}
          bitmap={bitmap}
          active={activeGlyph === char}
        />
      ))}
    </div>
  )
}

export default GlyphBrowser
