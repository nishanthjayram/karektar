import {useReducer, useState} from 'react'
import styles from './App.module.scss'
import {DEFAULT_PROMPT, DEFAULT_SYMBOLS} from '../../utils/constants/app.constants'
import {getUniqueCharacters, initializeFont} from '../../utils/helpers/app.helpers'
import {fontReducer} from '../../utils/reducers/fontReducer'
import Canvas from '../Canvas/Canvas'
import GlyphSet from '../GlyphSet/GlyphSet'

const App = ({bitmapSize}: {bitmapSize: number}) => {
  const [inputText, setInputText] = useState(DEFAULT_PROMPT)
  const [fontState, fontDispatch] = useReducer(
    fontReducer,
    initializeFont(bitmapSize, DEFAULT_SYMBOLS),
  )

  const {symbolSet} = fontState

  const handleSubmit = () => {
    const newSymbolSet = getUniqueCharacters(inputText)
    if (
      symbolSet.some(symbol => !newSymbolSet.includes(symbol)) &&
      !confirm(
        'You are about to remove some of the existing glyphs in your set. Are you sure you want to continue?',
      )
    ) {
      return
    }
    fontDispatch({
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_SYMBOL_SET',
      newSymbolSet: newSymbolSet,
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
          <button // TODO: Potentially rename this operation to make its meaning clearer.
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
