// editorStore.ts
import { create } from 'zustand'
import { TBitmapSize, TFontMap, TPointerState, TPos, TTool } from '@/types/common'
import { TEditorStore } from '@/types/stores'
import { MAX_SCALE } from '@/constants/defaults'
import Bitmap from '@/classes/Bitmap'
import { useProjectStore } from '@/stores/projectStore'
import { tools } from '@/utils/editor/tools'
import { disposeFontMap, disposeOnReplace } from '@/utils/helpers/disposers'
import { createFontMap } from '@/utils/project/createFontMap'

export const useEditorStore = create<TEditorStore>((set, get) => ({
  // Core state
  isOpen: false,
  activeProjectId: null,
  activeGlyph: null,

  // Editor state
  layers: {
    main: null,
    preview: null,
  },
  tool: null,
  scale: null,
  pointer: {
    isDown: false,
    start: null,
    previous: null,
    current: null,
  },

  // Instead of computed getters, we store these explicitly:
  fontMap: null, // TFontMap | null
  bitmapSize: null, // TBitmapSize | null

  // Check if the editor is ready.
  // Note: This now simply reads the stored values.
  isReady: () => {
    const state = get()
    return state.isOpen && state.layers.main !== null && state.fontMap !== null
  },

  // Actions
  setBitmap: (bitmap: Bitmap) => {
    set(state => {
      return {
        layers: {
          ...state.layers,
          main: disposeOnReplace(state.layers.main, bitmap.clone()),
        },
      }
    })
  },

  setTool: (tool: TTool) => {
    set({ tool })
  },

  addGlyph: (char: string) => {
    set(state => {
      if (!state.bitmapSize || !state.fontMap) return state
      const newFontMap = new Map(state.fontMap)
      newFontMap.set(char, new Bitmap(state.bitmapSize))
      return { fontMap: newFontMap }
    })
  },

  updateGlyph: (char: string, bitmap: Bitmap) => {
    set(state => {
      if (!state.fontMap) return state
      const newFontMap = new Map(state.fontMap)
      newFontMap.set(char, bitmap)
      return { fontMap: newFontMap }
    })
  },

  removeGlyph: (char: string) => {
    set(state => {
      if (!state.fontMap) return state
      const newFontMap = new Map(state.fontMap)
      newFontMap.delete(char)
      return { fontMap: newFontMap }
    })
  },

  setScale: (scale: number) => set({ scale }),

  setActiveGlyph: (glyph: string | null) => {
    set({ activeGlyph: glyph })
  },

  handlePointerDown: (pos: TPos) => {
    const state = get()
    if (!state.isReady() || !state.tool) return

    const tool = tools[state.tool]
    if (!tool) return

    const newPointer = {
      ...state.pointer,
      isDown: true,
      start: pos,
      previous: null,
      current: pos,
    }

    if (!state.layers.main) return

    const result = tool.operate(state.layers.main, newPointer)

    if (tool.needsPreview) {
      set({
        pointer: newPointer,
        layers: {
          ...state.layers,
          preview: disposeOnReplace(state.layers.preview, result.clone()),
        },
      })
    } else {
      set({
        pointer: newPointer,
        layers: {
          ...state.layers,
          main: disposeOnReplace(state.layers.main, result.clone()),
        },
      })
    }
  },

  handlePointerMove: (pos: TPos) => {
    const state = get()
    if (!state.isReady() || !state.pointer.isDown || !state.tool) return

    const tool = tools[state.tool]
    if (!tool) return

    const newPointer = {
      ...state.pointer,
      previous: state.pointer.current,
      current: pos,
    }

    if (!state.layers.main) return

    if (tool.needsPreview) {
      const previewBitmap = tool.operate(state.layers.main, newPointer)

      set({
        pointer: newPointer,
        layers: {
          ...state.layers,
          preview: disposeOnReplace(state.layers.preview, previewBitmap),
        },
      })
    } else {
      const result = tool.operate(state.layers.main, newPointer)

      set({
        pointer: newPointer,
        layers: {
          ...state.layers,
          main: disposeOnReplace(state.layers.main, result.clone()),
          preview: disposeOnReplace(state.layers.preview, null),
        },
      })
    }
  },

  handlePointerUp: () => {
    set(state => {
      const newFontMap = new Map(state.fontMap)
      if (state.activeGlyph && state.layers.main) {
        newFontMap.set(state.activeGlyph, state.layers.main.clone())
      }

      if (!state.layers.preview) {
        return {
          pointer: { isDown: false, start: null, previous: null, current: null },
          layers: {
            ...state.layers,
            preview: null,
          },
          fontMap: newFontMap,
        }
      }

      return {
        pointer: { isDown: false, start: null, previous: null, current: null },
        layers: {
          main: disposeOnReplace(state.layers.main, state.layers.preview.clone()),
          preview: disposeOnReplace(state.layers.preview, null),
        },
        fontMap: newFontMap,
      }
    })
  },

  openProject: (id: string) => {
    // Retrieve the project from the project store.
    const project = useProjectStore.getState().projects[id]
    if (!project) {
      console.error('Project not found:', id)
      return
    }

    // Create new clones for the project's fontMap.
    const newFontMap = new Map<string, Bitmap>()
    for (const [char, bitmap] of project.fontMap) {
      newFontMap.set(char, bitmap.clone())
    }

    // Create a new main layer bitmap.
    const newMainLayer = new Bitmap(project.bitmapSize)

    // Update the editor store explicitly.
    set({
      isOpen: true,
      activeProjectId: id,
      activeGlyph: newFontMap.keys().next().value,
      layers: {
        main: newMainLayer,
        preview: null,
      },
      tool: 'pen',
      fontMap: newFontMap,
      bitmapSize: project.bitmapSize,
      scale: MAX_SCALE,
    })
  },

  closeProject: () => {
    set(state => {
      disposeOnReplace(state.layers.main, null)
      disposeFontMap(state.fontMap)
      return {
        isOpen: false,
        activeProjectId: null,
        activeGlyph: null,
        layers: {
          main: null,
          preview: null,
        },
        tool: null,
        fontMap: null,
        bitmapSize: null,
        scale: null,
        pointer: {
          isDown: false,
          start: null,
          previous: null,
          current: null,
        },
      }
    })
  },
}))
