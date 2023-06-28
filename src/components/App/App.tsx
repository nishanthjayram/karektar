import classnames from 'classnames'
import {useReducer} from 'react'
import styles from './App.module.scss'
import {
  DEFAULT_SYMBOLS,
  RESET_ALERT,
  SUBMIT_ALERT,
  WIKI_LINK,
} from '../../utils/constants/app.constants'
import {
  getUniqueCharacters,
  initializeFont,
  isEmptyGlyph,
} from '../../utils/helpers/app.helpers'
import {fontReducer} from '../../utils/reducers/fontReducer'
import Canvas from '../Canvas/Canvas'
import GlyphSet from '../GlyphSet/GlyphSet'

const App = ({bitmapSize}: {bitmapSize: number}) => {
  const [fontState, fontDispatch] = useReducer(
    fontReducer,
    initializeFont(bitmapSize, DEFAULT_SYMBOLS),
  )
  const {glyphSet, inputText, symbolSet} = fontState

  const handleSubmit = () => {
    const newSymbolSet = getUniqueCharacters(inputText)
    if (
      symbolSet.some(symbol => !newSymbolSet.includes(symbol)) &&
      !confirm(SUBMIT_ALERT)
    ) {
      return
    }
    fontDispatch({
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_SYMBOL_SET',
      newSymbolSet: newSymbolSet,
    })
  }

  const handleReset = () => {
    if (!confirm(RESET_ALERT)) {
      return
    }
    fontDispatch({
      type: 'GLYPH_SET_ACTION',
      op: 'RESET_GLYPH_SET',
    })
  }

  return (
    <div>
      <h1>
        <a href={WIKI_LINK} target="_blank" rel="noreferrer noopener">
          Kare
        </a>
        ktar.
      </h1>
      <textarea
        id="queryField"
        name="queryField"
        value={inputText}
        placeholder="Enter prompt"
        onChange={e =>
          fontDispatch({
            type: 'GLYPH_SET_ACTION',
            op: 'UPDATE_INPUT_TEXT',
            newInputText: e.target.value,
          })
        }
        className={styles.input}
      />
      <div className={styles.buttonRow}>
        <button
          className={classnames(
            inputText.length === 0 && styles.disabledButton,
            styles.button,
          )}
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button
          className={classnames(
            [...glyphSet.values()].every(glyph => isEmptyGlyph(glyph)) &&
              styles.disabledButton,
            styles.button,
          )}
          onClick={handleReset}
        >
          Reset
        </button>
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
