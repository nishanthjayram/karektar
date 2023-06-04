import {useReducer, useState} from 'react'
import styles from './App.module.scss'
import {DEFAULT_PROMPT, DEFAULT_SYMBOLS} from '../../constants'
import {fontReducer} from '../../reducers/fontReducer'
import {getUniqueCharacters, initializeGlyph, initializeGlyphSet} from '../../utils'
import Canvas from '../Canvas/Canvas'
import GlyphSet from '../GlyphSet/GlyphSet'

const App = ({bitmapSize}: {bitmapSize: number}) => {
  const [inputText, setInputText] = useState(DEFAULT_PROMPT)
  const [font, updateFont] = useReducer(fontReducer, {
    bitmapSize: bitmapSize,
    activeGlyph: DEFAULT_SYMBOLS[0],
    glyphSet: initializeGlyphSet(DEFAULT_SYMBOLS, bitmapSize),
    canvasHistory: [initializeGlyph(bitmapSize)],
    historyIndex: 0,
    currentTool: 'DRAW',
    shapeRange: undefined,
    captureFlag: false,
  })

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
          <button
            onClick={() => {
              const symbolSet = getUniqueCharacters(inputText)
              updateFont({type: 'updateGlyphSet', symbolSet: symbolSet})
              updateFont({type: 'changeGlyph', newGlyph: symbolSet[0]})
            }}
            className={styles.button}
          >
            Submit
          </button>
          <button
            onClick={() => {
              setInputText('')
              updateFont({type: 'clearGlyphSet'})
            }}
            className={styles.button}
          >
            Clear
          </button>
          <select
            name="Bitmap Size"
            onChange={evt =>
              updateFont({type: 'updateGlyphSet', newBitmapSize: +evt.target.value})
            }
            className={styles.button}
          >
            <option value={8}>8</option>
            <option value={16} selected={true}>
              16
            </option>
            <option value={32}>32</option>
          </select>
        </div>
      </div>
      <br />
      <div className={styles.appRow}>
        <Canvas font={font} updateFont={updateFont} />
        <GlyphSet font={font} updateFont={updateFont} />
      </div>
    </div>
  )
}

export default App
