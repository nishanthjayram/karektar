import {useState} from 'react'
import styles from './App.module.scss'
import {
  DEFAULT_PROMPT,
  DEFAULT_SYMBOLS,
  RX_LETTERS,
  RX_NON_ALPHANUMERIC,
  RX_NUMBERS,
} from '../../constants'
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
      newGlyphSet.set(symbol, new Array<boolean>(bitmapSize ** 2).fill(false)),
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
          oldGlyphSet.get(symbol) ?? new Array<boolean>(bitmapSize ** 2).fill(false),
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

const getUniqueCharacters = (input: string) => {
  const uniqueCharacters = [...new Set<string>(input)]

  const letters = uniqueCharacters.flatMap(c => c.match(RX_LETTERS) ?? [])
  const numbers = uniqueCharacters.flatMap(c => c.match(RX_NUMBERS) ?? [])
  const nonAlphaNum = uniqueCharacters.flatMap(
    c => c.match(RX_NON_ALPHANUMERIC) ?? [],
  )

  return [letters, numbers, nonAlphaNum].flatMap(c => c.sort())
}

export default App
