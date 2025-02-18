import Bitmap from '@classes/Bitmap'
import { TProjectMetadata } from '@common/types'
import { TBitmapSize, TFontMap, TPos, TTool } from '@/types/common'
import { TPointerState } from '@/types/common'

export type TProjectState = {
  projects: Record<string, TProjectMetadata>
}

export type TProjectActions = {
  getProjectCount: () => number
  loadProjects: () => Promise<void>
  createProject: (name: string, bitmapSize: TBitmapSize) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  saveProject: (id: string) => Promise<void>
  saveFontMap: (projectId: string, fontMap: TFontMap) => Promise<void>
  loadFontMap: (projectId: string) => TFontMap
}

export type TEditorState = {
  // Core state
  isOpen: boolean
  activeProjectId: string | null
  activeGlyph: string | null

  // Editor state
  layers: {
    main: Bitmap | null
    preview: Bitmap | null
  }
  tool: TTool | null

  scale: number | null
  pointer: TPointerState
}

export type TEditorDerivedState = {
  fontMap: TFontMap | null
  bitmapSize: TBitmapSize | null
}

export type TEditorActions = {
  // Check editor status
  isReady: () => boolean

  // Tool operations
  handlePointerDown: (pos: TPos) => void
  handlePointerMove: (pos: TPos) => void
  handlePointerUp: () => void

  // Editor operations
  setBitmap: (bitmap: Bitmap) => void
  setTool: (tool: TTool) => void
  addGlyph: (char: string) => void
  removeGlyph: (char: string) => void
  setActiveGlyph: (char: string) => void
  updateGlyph: (char: string, bitmap: Bitmap) => void

  // Project operations
  openProject: (id: string) => void
  closeProject: () => void
}

export type TProjectStore = TProjectState & TProjectActions
export type TEditorStore = TEditorState & TEditorDerivedState & TEditorActions
