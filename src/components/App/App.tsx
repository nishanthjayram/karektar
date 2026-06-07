import classnames from 'classnames'
import opentype from 'opentype.js'
import {useEffect, useReducer, useState} from 'react'
import Modal from 'react-modal'
import {useMediaQuery} from 'react-responsive'
import styles from './App.module.scss'
import {ReactComponent as GitHub} from '../../assets/github.svg'
import {
  AuthUser,
  beginGoogleLogin,
  checkAuth,
  logout as logoutAuth,
} from '../../services/auth'
import {
  areFontDraftsEqual,
  loadCurrentDraft,
  saveCurrentDraft,
  serializeFontDraft,
} from '../../services/draft'
import {TConfirmModal, TFontProps} from '../../types'
import {
  DEFAULT_FONT_NAME,
  DEFAULT_PROMPT,
  EXPORT_ALERT,
  EXPORT_PROMPT,
  HELP_MESSAGE,
  MOBILE_HELP_MESSAGE,
  RESET_ALERT,
  SUBMIT_ALERT,
  UNITS_PER_EM,
  WIKI_LINK,
} from '../../utils/constants/app.constants'
import {
  assertUnreachable,
  getUniqueCharacters,
  initializeFont,
  isEmptyGlyph,
} from '../../utils/helpers/app.helpers'
import {indexToPos} from '../../utils/helpers/canvas.helpers'
import {fontReducer} from '../../utils/reducers/fontReducer'
import Canvas from '../Canvas/Canvas'
import ConfirmModal from '../ConfirmModal/ConfirmModal'
import GlyphSet from '../GlyphSet/GlyphSet'

const XS_SCREEN = 576
const DEFAULT_SYMBOL_SET = getUniqueCharacters(DEFAULT_PROMPT)

const hasLocalEditorWork = ({
  glyphSet,
  inputText,
  symbolSet,
}: TFontProps['fontState']) =>
  inputText !== DEFAULT_PROMPT ||
  symbolSet.length !== DEFAULT_SYMBOL_SET.length ||
  symbolSet.some((symbol, index) => symbol !== DEFAULT_SYMBOL_SET[index]) ||
  [...glyphSet.values()].some(glyph => !isEmptyGlyph(glyph))

const App = ({bitmapSize}: {bitmapSize: number}) => {
  Modal.setAppElement('#root')
  const screenFlag = useMediaQuery({query: `(max-width: ${XS_SCREEN}px)`})

  const canvasSize = screenFlag ? Math.floor(window.innerWidth / 32) * 32 : 512
  const glyphSize = 48

  const [fontState, fontDispatch] = useReducer(
    fontReducer,
    initializeFont(
      bitmapSize,
      canvasSize,
      screenFlag ? false : undefined,
      glyphSize,
      DEFAULT_PROMPT,
      screenFlag,
    ),
  )

  const fontProps = {
    fontState: fontState,
    fontDispatch: fontDispatch,
  }

  const {confirmModal, glyphSetModal} = fontState

  const pageSize = useWindowSize()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const [draftLoading, setDraftLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const user = await checkAuth()

        if (!cancelled) {
          setAuthUser(user)
          setAuthError(null)
        }
      } catch {
        if (!cancelled) {
          setAuthUser(null)
          setAuthError('Session check failed. Using local draft mode.')
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false)
        }
      }
    }

    void loadSession()

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    setAuthLoading(true)
    setAuthError(null)

    try {
      await logoutAuth()
      setAuthUser(null)
    } catch {
      setAuthError('Logout failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLoadDraft = async (options?: {
    confirmReplace?: boolean
    deferIfLocalWork?: boolean
    silent?: boolean
  }) => {
    setDraftLoading(true)
    setDraftStatus(options?.silent ? null : 'Loading draft...')

    try {
      const result = await loadCurrentDraft()

      if (result.status === 'unauthorized') {
        setAuthUser(null)
        setDraftStatus('Sign in to load a draft')
        return
      }

      if (result.status === 'empty') {
        setDraftStatus(options?.silent ? null : 'No saved draft yet')
        return
      }

      if (areFontDraftsEqual(result.draft, serializeFontDraft(fontState))) {
        setDraftStatus(options?.silent ? null : 'Draft already loaded')
        return
      }

      if (options?.deferIfLocalWork && hasLocalEditorWork(fontState)) {
        setDraftStatus('Signed in. Load Draft will replace local work.')
        return
      }

      if (
        options?.confirmReplace &&
        hasLocalEditorWork(fontState) &&
        !window.confirm('Load your saved draft? This will replace local work.')
      ) {
        setDraftStatus('Draft load canceled')
        return
      }

      fontDispatch({
        type: 'GLYPH_SET_ACTION',
        op: 'LOAD_DRAFT',
        draft: result.draft,
      })
      setDraftStatus(options?.silent ? null : 'Draft loaded')
    } catch {
      setDraftStatus('Draft load failed')
    } finally {
      setDraftLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setDraftLoading(true)
    setDraftStatus('Saving draft...')

    try {
      const result = await saveCurrentDraft(fontState)

      if (result.status === 'unauthorized') {
        setAuthUser(null)
        setDraftStatus('Sign in to save a draft')
        return
      }

      setDraftStatus('Draft saved')
    } catch {
      setDraftStatus('Draft save failed')
    } finally {
      setDraftLoading(false)
    }
  }

  useEffect(() => {
    if (!authUser) {
      return
    }

    void handleLoadDraft({deferIfLocalWork: true, silent: true})
    // Load only when the authenticated account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email])

  return (
    <div
      className={classnames(
        (confirmModal || glyphSetModal) && styles.noclick,
        styles.page,
      )}
      style={{
        height: `${pageSize}px`,
      }}
    >
      <div>
        <div className={styles.headerRow}>
          <Title />
          <AccountMenu
            authError={authError}
            authLoading={authLoading}
            draftLoading={draftLoading}
            draftStatus={draftStatus}
            user={authUser}
            onLoadDraft={() => handleLoadDraft({confirmReplace: true})}
            onLogin={beginGoogleLogin}
            onLogout={handleLogout}
            onSaveDraft={handleSaveDraft}
          />
        </div>
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
      <div className={styles.footer}>
        <p>
          © 2023 by{' '}
          <a href="https://newtrino.ink" target="_blank" rel="noopener noreferrer">
            Nishanth Jayram
          </a>
          . All rights reserved.
        </p>
        <a
          href="https://github.com/nishanthjayram/karektar"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHub className={styles.footerIcon} />
        </a>
      </div>
    </div>
  )
}

const useWindowSize = () => {
  const [size, setSize] = useState(window.innerHeight)
  const onResize = () => setSize(window.innerHeight)

  useEffect(() => {
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}

const Title = () => (
  <h1>
    <a href={WIKI_LINK} target="_blank" rel="noreferrer noopener">
      Kare
    </a>
    ktar.
  </h1>
)

type AccountMenuProps = {
  authError: string | null
  authLoading: boolean
  draftLoading: boolean
  draftStatus: string | null
  user: AuthUser | null
  onLoadDraft: () => Promise<void>
  onLogin: () => void
  onLogout: () => Promise<void>
  onSaveDraft: () => Promise<void>
}

const AccountMenu: React.FC<AccountMenuProps> = ({
  authError,
  authLoading,
  draftLoading,
  draftStatus,
  user,
  onLoadDraft,
  onLogin,
  onLogout,
  onSaveDraft,
}) => (
  <div className={styles.accountMenu}>
    <p className={styles.accountText}>
      {authLoading
        ? 'Checking session...'
        : user
          ? `${user.name} (${user.email})`
          : 'Local draft mode'}
    </p>
    {user ? (
      <div className={styles.accountButtonRow}>
        <button
          className={styles.accountButton}
          disabled={authLoading || draftLoading}
          onClick={() => void onSaveDraft()}
        >
          Save Draft
        </button>
        <button
          className={styles.accountButton}
          disabled={authLoading || draftLoading}
          onClick={() => void onLoadDraft()}
        >
          Load Draft
        </button>
        <button
          className={styles.accountButton}
          disabled={authLoading}
          onClick={() => void onLogout()}
        >
          Logout
        </button>
      </div>
    ) : (
      <button
        className={styles.accountButton}
        disabled={authLoading}
        onClick={onLogin}
      >
        Sign In
      </button>
    )}
    <p className={classnames(styles.accountStatus, authError && styles.accountError)}>
      {authError ?? draftStatus ?? '\u00a0'}
    </p>
  </div>
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
  const {
    bitmapSize,
    canvasSize,
    glyphSet,
    inputText,
    pixelSize,
    screenFlag,
    symbolSet,
  } = fontState

  const updateModal = (type: TConfirmModal) =>
    fontDispatch({
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_CONFIRM_MODAL',
      newConfirmModal: type,
    })

  const handleSubmit = () =>
    fontDispatch({
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_SYMBOL_SET',
      newSymbolSet: getUniqueCharacters(inputText),
    })

  const handleReset = () => {
    fontDispatch({
      type: 'GLYPH_SET_ACTION',
      op: 'RESET_GLYPH_SET',
    })
  }

  const handleExport = () => {
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

  const handlePointerUp = (type: TConfirmModal) => {
    switch (type) {
      case 'SUBMIT': {
        const newSymbolSet = getUniqueCharacters(inputText)
        if (symbolSet.some(symbol => !newSymbolSet.includes(symbol))) {
          return updateModal(type)
        }
        return fontDispatch({
          type: 'GLYPH_SET_ACTION',
          op: 'UPDATE_SYMBOL_SET',
          newSymbolSet: newSymbolSet,
        })
      }
      case 'RESET': {
        return updateModal(type)
      }
      case 'EXPORT': {
        if ([...glyphSet.values()].some(glyph => isEmptyGlyph(glyph))) {
          return updateModal(type)
        }
        return handleExport()
      }
      case 'HELP': {
        return updateModal(type)
      }
      default: {
        return assertUnreachable(type)
      }
    }
  }

  return (
    <>
      <ConfirmModal
        fontState={fontState}
        fontDispatch={fontDispatch}
        type="SUBMIT"
        onConfirm={handleSubmit}
        message={SUBMIT_ALERT}
      />
      <ConfirmModal
        fontState={fontState}
        fontDispatch={fontDispatch}
        type="RESET"
        onConfirm={handleReset}
        message={RESET_ALERT}
      />
      <ConfirmModal
        fontState={fontState}
        fontDispatch={fontDispatch}
        type="EXPORT"
        onConfirm={handleExport}
        message={EXPORT_ALERT}
      />
      <ConfirmModal
        fontState={fontState}
        fontDispatch={fontDispatch}
        cancelFlag={false}
        type="HELP"
        message={screenFlag ? MOBILE_HELP_MESSAGE : HELP_MESSAGE}
      />
      <div className={styles.buttonRow}>
        <button
          className={classnames(
            inputText.length === 0 && styles.disabledButton,
            styles.button,
          )}
          onPointerUp={() => handlePointerUp('SUBMIT')}
        >
          Submit
        </button>
        <button
          className={classnames(
            [...glyphSet.values()].every(glyph => isEmptyGlyph(glyph)) &&
              styles.disabledButton,
            styles.button,
          )}
          onPointerUp={() => handlePointerUp('RESET')}
        >
          Reset
        </button>
        <button
          className={classnames(
            [...glyphSet.values()].every(glyph => isEmptyGlyph(glyph)) &&
              styles.disabledButton,
            styles.button,
          )}
          onPointerUp={() => handlePointerUp('EXPORT')}
        >
          Export
        </button>
        <button
          className={styles.button}
          onPointerUp={() => handlePointerUp('HELP')}
        >
          Help
        </button>
      </div>
    </>
  )
}

export default App
