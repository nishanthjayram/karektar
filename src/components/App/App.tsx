import {useState} from 'react'
import styles from './App.module.scss'
import {DEFAULT_PROMPT, DEFAULT_SYMBOLS} from '../../constants'
import {getUniqueCharacters, initialGlyphState} from '../../utils'
import Canvas from '../Canvas/Canvas'
import GlyphSet from '../GlyphSet/GlyphSet'

const App = ({bitmapSize}: {bitmapSize: number}) => {
  const [inputText, setInputText] = useState(DEFAULT_PROMPT)
  const [activeGlyph, setActiveGlyph] = useState<string | undefined>(
    DEFAULT_SYMBOLS[0],
  )
  const [glyphSet, setGlyphSet] = useState(() => {
    const newGlyphSet = new Map<string, boolean[]>()
    DEFAULT_SYMBOLS.forEach(symbol =>
      newGlyphSet.set(symbol, initialGlyphState(bitmapSize)),
    )
    return newGlyphSet
  })

  const handleSubmit = () => {
    const symbolSet = getUniqueCharacters(inputText)
    setActiveGlyph(symbolSet[0])
    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map<string, boolean[]>()
      symbolSet.forEach(symbol => {
        newGlyphSet.set(
          symbol,
          oldGlyphSet.get(symbol) ?? initialGlyphState(bitmapSize),
        )
      })
      return newGlyphSet
    })
  }

  return (
    <div>
      <h1>Karektar</h1>
      <div>
        <textarea
          id="queryField"
          name="queryField"
          value={inputText}
          placeholder="Enter prompt"
          onChange={e => setInputText(e.target.value)}
          className={styles.input}
        />
        <div className={styles.buttonRow}>
          <button onClick={handleSubmit} className={styles.button}>
            Submit
          </button>
          <button onClick={() => setInputText('')} className={styles.button}>
            Clear
          </button>
        </div>
      </div>
      <br />
      <div className={styles.appRow}>
        <Canvas
          bitmapSize={bitmapSize}
          glyphSet={glyphSet}
          setGlyphSet={setGlyphSet}
          activeGlyph={activeGlyph}
        />
        <div className={styles.glyph}>
          <GlyphSet
            bitmapSize={bitmapSize}
            glyphSet={glyphSet}
            activeGlyph={activeGlyph}
            setActiveGlyph={setActiveGlyph}
          />
        </div>
      </div>
    </div>
  )
}

export default App
