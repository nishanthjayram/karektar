import Bitmap from './classes/Bitmap'
import { MAX_SCALE } from './constants/defaults'
import { useEditorStore, useProjectStore } from './stores'
import { TProjectMetadata } from './types/project'
import { TEditorState, TProjectState } from './types/stores'
import { createFontMap } from './utils/project/createFontMap'

type TTestState = {
  projectState?: Partial<TProjectState>
  editorState?: Partial<TEditorState>
}

export const createTestState = ({ projectState, editorState }: TTestState = {}) => {
  if (projectState) {
    console.log(projectState)
    useProjectStore.setState({
      projects: {},
      ...projectState,
    })
  }

  // Seed basic editor state if needed; note that we’ll later call openProject
  // so that the derived state (fontMap, bitmapSize, layers) is configured properly.
  if (editorState) {
    useEditorStore.setState({
      isOpen: false,
      activeProjectId: null,
      activeGlyph: null,
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
      ...editorState,
    })
  }
}

// Seed the project store with test projects.
export const seedTestProjects = () => {
  createTestState({
    projectState: {
      projects: {
        karektar: {
          id: 'karektar',
          name: 'karektar',
          dateCreated: Date.parse('2021-08-01'),
          dateModified: Date.parse('2022-08-01'),
          bitmapSize: 16,
          fontMap: createFontMap(16, 'karektar'),
        },
      },
    },
  })
}

// Seed the editor store by “opening” project 'newt'.
// This calls the built-in openProject method, which will:
// • Dispose of any previous layers/font maps safely.
// • Clone the project’s font map.
// • Set isOpen, activeProjectId, layers, scale, etc.
export const seedTestEditor = () => {
  useEditorStore.getState().openProject('karektar')
}
