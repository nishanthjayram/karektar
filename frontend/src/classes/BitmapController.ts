import { IEditorStore } from '@/types/stores'
import { useEditorStore } from '@/stores'

class BitmapController {
  private getEditorState: () => IEditorStore

  constructor(getEditorState: () => IEditorStore) {
    this.getEditorState = getEditorState
  }

  commitBitmap() {
    const editorState = this.getEditorState()
    const { activeGlyph, updateGlyph } = editorState

    if (!activeGlyph) {
      console.warn('[BitmapController] commitBitmap: No active glyph selected.')
      return
    }

    updateGlyph(activeGlyph, editorState.layers.main.clone())
  }

  liveUpdate() {
    const editorState = this.getEditorState()
    const { activeGlyph, updateGlyph } = editorState

    if (!activeGlyph) {
      console.warn('[BitmapController] liveUpdate: No active glyph selected.')
      return
    }

    updateGlyph(activeGlyph, editorState.layers.main.clone())
  }
}

export const bitmapController = new BitmapController(() => useEditorStore.getState())
