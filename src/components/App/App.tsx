import {useReducer, useState} from 'react'
import styles from './App.module.scss'
import {DEFAULT_PROMPT, DEFAULT_SYMBOLS} from '../../constants'
import {fontReducer} from '../../reducers/fontReducer'
import {getUniqueCharacters, initializeFont} from '../../utils'
import Canvas from '../Canvas/Canvas'
import GlyphSet from '../GlyphSet/GlyphSet'

const App = ({bitmapSize}: {bitmapSize: number}) => {
  const [inputText, setInputText] = useState(DEFAULT_PROMPT)
  const [fontState, fontDispatch] = useReducer(
    fontReducer,
    initializeFont(bitmapSize, DEFAULT_SYMBOLS),
  )

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
              fontDispatch({
                type: 'GLYPH_SET_ACTION',
                op: 'UPDATE_SYMBOL_SET',
                newSymbolSet: symbolSet,
              })
            }}
            className={styles.button}
          >
            Submit
          </button>
          <button
            onClick={() =>
              fontDispatch({
                type: 'GLYPH_SET_ACTION',
                op: 'CLEAR_GLYPH_SET',
              })
            }
            className={styles.button}
          >
            Clear
          </button>
        </div>
      </div>
      <br />
      <div className={styles.appRow}>
        <Canvas fontState={fontState} fontDispatch={fontDispatch} />
        <GlyphSet fontState={fontState} fontDispatch={fontDispatch} />
      </div>
    </div>
  )
}

export default App
