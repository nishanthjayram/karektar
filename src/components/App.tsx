import Editor, { DEFAULT_BITMAP_SIZE } from '@components/Editor/Editor'
import { useEditor } from '@/hooks/useEditor'
import Bitmap from '@/classes/Bitmap'
import { TEditorState } from '@/utils/reducers/editorReducer'
import { TPointerState } from '@/utils/reducers/pointerReducer'
import styles from './App.module.css'
import Gallery from './Gallery/Gallery'

const initializeEditor = (bitmapSize: number): TEditorState => ({
  layers: {
    main: new Bitmap(bitmapSize),
    preview: new Bitmap(bitmapSize),
  },
  scale: 30,
})

const initializePointer = (): TPointerState => ({
  currentTool: 'pen',
  isPointerDown: false,
  dragStartPos: null,
  lastPos: null,
})

// initialize a map of english characters to their corresponding bitmaps
const initializeGlyphs = () => {
  const glyphs = new Map<string, Bitmap>()
  for (let i = 65 + 32; i < 65 + 32 + 5; i++) {
    glyphs.set(String.fromCharCode(i), new Bitmap(DEFAULT_BITMAP_SIZE))
  }
  return glyphs
}

// write an initializer function for the glyph state
const initializeGlyphState = () => ({
  glyphs: initializeGlyphs(),
  activeGlyph: 'a',
})

const App = () => {
  const {
    editorState,
    editorDispatch,
    pointerState,
    pointerDispatch,
    glyphState,
    glyphDispatch,
  } = useEditor(
    initializeEditor(DEFAULT_BITMAP_SIZE),
    initializePointer(),
    initializeGlyphState(),
  )

  const handleGlyphSelect = (glyph: string) => {
    console.log('setting active glyph', glyph)
    glyphDispatch({ type: 'setActiveGlyph', glyph })

    // Load glyph into editor
    const bitmap = glyphState.glyphs.get(glyph)
    if (bitmap) {
      editorDispatch({
        type: 'setBitmap',
        bitmap: bitmap.clone(),
        resetPreview: true,
      })
    }
  }

  return (
    <div className={styles.app}>
      <div className={styles.main}>
        <div className={styles.editorContainer}>
          <Header />
          <Editor
            editorState={editorState}
            editorDispatch={editorDispatch}
            pointerState={pointerState}
            pointerDispatch={pointerDispatch}
          />
        </div>
        <Gallery
          glyphState={glyphState}
          onSelectGlyph={handleGlyphSelect}
          onAddGlyph={(char: string) => {
            glyphDispatch({
              type: 'addGlyph',
              glyph: char,
              bitmap: new Bitmap(DEFAULT_BITMAP_SIZE),
            })
          }}
          onRemoveGlyph={(char: string) => {
            glyphDispatch({ type: 'removeGlyph', glyph: char })
          }}
        />
      </div>
    </div>
  )
}

const WIKI_LINK = 'https://en.wikipedia.org/wiki/Susan_Kare'

const Header = () => (
  <div className={styles.header}>
    <h1>
      <a href={WIKI_LINK} target="_blank" rel="noreferrer noopener">
        Kare
      </a>
      ktar.
    </h1>
  </div>
)

export default App
