import {useEffect, useMemo, useState} from 'react'
import styles from './App.module.scss'
import {
  DEFAULT_PROMPT,
  RX_LETTERS,
  RX_NON_ALPHANUMERIC,
  RX_NUMBERS,
} from '../../constants'
import Canvas from '../Canvas/Canvas'
import GlyphSet from '../GlyphSet/GlyphSet'

const App = ({canvasSize}: {canvasSize: number}) => {
  const [inputText, setInputText] = useState(DEFAULT_PROMPT)
  const [query, setQuery] = useState(DEFAULT_PROMPT)
  const [glyphSet, setGlyphSet] = useState(() => new Map<string, boolean[]>())
  const symbolSet = useMemo(() => getUniqueCharacters(query), [query])
  const [activeGlyph, setActiveGlyph] = useState<string | undefined>(symbolSet[0])

  useEffect(() => {
    setGlyphSet(oldGlyphSet => {
      const newGlyphSet = new Map<string, boolean[]>()
      symbolSet.forEach(symbol =>
        newGlyphSet.set(
          symbol,
          oldGlyphSet.get(symbol) ?? new Array<boolean>(canvasSize ** 2).fill(false),
        ),
      )
      return newGlyphSet
    })
  }, [canvasSize, symbolSet])

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
          <button onClick={() => setQuery(inputText)} className={styles.button}>
            Submit
          </button>
          <button
            onClick={() => {
              setInputText('')
              setQuery('')
            }}
            className={styles.button}
          >
            Clear
          </button>
        </div>
      </div>
      <br />
      <div className={styles.appRow}>
        <Canvas
          canvasSize={canvasSize}
          glyphSet={glyphSet}
          setGlyphSet={setGlyphSet}
          activeGlyph={activeGlyph}
        />
        <div className={styles.glyph}>
          <GlyphSet
            canvasSize={canvasSize}
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
