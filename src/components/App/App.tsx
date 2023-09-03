import classnames from 'classnames'
import opentype from 'opentype.js'
import {useReducer} from 'react'
import Modal from 'react-modal'
import {useMediaQuery} from 'react-responsive'
import styles from './App.module.scss'
import {TFontProps} from '../../types'
import {
  DEFAULT_FONT_NAME,
  DEFAULT_PROMPT,
  DEFAULT_SYMBOLS,
  EXPORT_ALERT,
  EXPORT_PROMPT,
  MOBILE_HELP,
  RESET_ALERT,
  SUBMIT_ALERT,
  UNITS_PER_EM,
  WIKI_LINK,
} from '../../utils/constants/app.constants'
import {
  getUniqueCharacters,
  initializeFont,
  isEmptyGlyph,
} from '../../utils/helpers/app.helpers'
import {indexToPos} from '../../utils/helpers/canvas.helpers'
import {fontReducer} from '../../utils/reducers/fontReducer'
import Canvas from '../Canvas/Canvas'
import GlyphSet from '../GlyphSet/GlyphSet'

const XS_SCREEN = 576

const App = ({bitmapSize}: {bitmapSize: number}) => {
  Modal.setAppElement('#root')
  const screenFlag = useMediaQuery({query: `(max-width: ${XS_SCREEN}px)`})

  const canvasSize = screenFlag ? Math.floor(window.innerWidth / 32) * 32 : 512
  const glyphSize = 48
  const glyphSetModal = screenFlag ? false : undefined

  const inputText = DEFAULT_PROMPT + (screenFlag ? MOBILE_HELP : '')

  const [fontState, fontDispatch] = useReducer(
    fontReducer,
    initializeFont(
      bitmapSize,
      canvasSize,
      glyphSetModal,
      glyphSize,
      inputText,
      screenFlag,
    ),
  )

  const fontProps = {
    fontState: fontState,
    fontDispatch: fontDispatch,
  }

  return (
    <div className={classnames(glyphSetModal && styles.onclick, styles.app)}>
      <Title />
      {!screenFlag && (
        <>
          <InputField {...fontProps} />
          <ButtonMenu {...fontProps} />
        </>
      )}
      <div className={styles.appRow}>
        <Canvas {...fontProps} />
        <GlyphSet {...fontProps} />
      </div>
      {screenFlag && (
        <>
          <br />
          <InputField {...fontProps} />
          <ButtonMenu {...fontProps} />
        </>
      )}
    </div>
  )
}

const Title = () => (
  <h1>
    <a href={WIKI_LINK} target="_blank" rel="noreferrer noopener">
      Kare
    </a>
    ktar.
  </h1>
)

const InputField: React.FC<TFontProps> = ({fontState, fontDispatch}) => {
  const {canvasSize, inputText} = fontState

  const fieldSize = canvasSize - 12

  return (
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
      style={{
        width: `${fieldSize}px`,
        height: '60px',
        maxWidth: `${fieldSize}px`,
        minWidth: `${fieldSize}px`,
      }}
    />
  )
}

const ButtonMenu: React.FC<TFontProps> = ({fontState, fontDispatch}) => {
  const {bitmapSize, canvasSize, glyphSet, inputText, pixelSize, symbolSet} =
    fontState

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

  const handleExport = () => {
    if (
      [...glyphSet.values()].some(glyph => isEmptyGlyph(glyph)) &&
      !confirm(EXPORT_ALERT)
    ) {
      return
    }

    const fontName = prompt(EXPORT_PROMPT, DEFAULT_FONT_NAME)

    if (!fontName) {
      return
    }

    const [fontFamily, fontStyle] = [
      fontName.split(' ')[0],
      fontName.split(' ')[1] || 'Regular',
    ]

    const glyphs = new Array<opentypejs.Glyph>()

    glyphs.push(
      new opentype.Glyph({
        name: '.notdef',
        unicode: 0,
        advanceWidth: UNITS_PER_EM / 2,
        path: new opentype.Path(),
      }),
    )

    const scaleFactor = UNITS_PER_EM / canvasSize
    let maxAscender = -Infinity
    let minDescender = Infinity

    glyphSet.forEach((glyph, symbol) => {
      const indices = glyph.reduce((acc, curr, idx) => {
        if (curr) {
          acc.push(idx)
        }
        return acc
      }, new Array<number>())

      const path = new opentype.Path()

      indices.forEach(idx => {
        const [x, y] = indexToPos(idx, bitmapSize)
        const x1 = x * pixelSize
        const x2 = x1 + pixelSize
        const y1 = (bitmapSize - y - 1) * pixelSize
        const y2 = y1 + pixelSize

        path.moveTo(x1 * scaleFactor, y1 * scaleFactor)
        path.lineTo(x1 * scaleFactor, y2 * scaleFactor)
        path.lineTo(x2 * scaleFactor, y2 * scaleFactor)
        path.lineTo(x2 * scaleFactor, y1 * scaleFactor)
        path.lineTo(x1 * scaleFactor, y1 * scaleFactor)
      })

      const fontGlyph = new opentype.Glyph({
        name: symbol,
        unicode: symbol.charCodeAt(0),
        advanceWidth: 0,
        path: path,
      })

      const {xMax, yMin, yMax} = fontGlyph.getMetrics()
      fontGlyph.advanceWidth = xMax

      minDescender = Math.min(minDescender, yMin)
      maxAscender = Math.max(maxAscender, yMax)

      glyphs.push(fontGlyph)
    })

    const font = new opentype.Font({
      familyName: fontFamily,
      styleName: fontStyle,
      unitsPerEm: UNITS_PER_EM,
      ascender: maxAscender,
      descender: -minDescender,
      glyphs: glyphs,
    })

    font.download()
  }

  return (
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
      <button className={styles.button} onClick={handleExport}>
        Export
      </button>
    </div>
  )
}

export default App
