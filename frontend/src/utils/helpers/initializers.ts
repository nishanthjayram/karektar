import { DEFAULT_BITMAP_SIZE, MAX_SCALE } from '@constants/defaults'
import { TBitmapSize, TFontMap, TLayers, TPointerState, TTool } from '@/types/common'
import Bitmap from '@/classes/Bitmap'

export const getInitialLayers = (
  size: TBitmapSize = DEFAULT_BITMAP_SIZE,
): TLayers => ({
  main: new Bitmap(size),
  preview: new Bitmap(size),
})

export const getInitialEditorState = (scale: number = MAX_SCALE) => ({
  layers: getInitialLayers(),
  scale,
  bitmapSize: DEFAULT_BITMAP_SIZE,
})

export const getInitialToolState = () => ({
  currentTool: 'pen' as TTool,
  pointer: {
    isDown: false,
    start: null,
    previous: null,
    current: null,
  } as TPointerState,
})

export const getInitialProjectState = () => ({
  projects: {},
  activeProjectId: null,
  projectCount: 0,
})
