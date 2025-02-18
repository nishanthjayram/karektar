import Bitmap from '@/classes/Bitmap'

export type TLayers = {
  main: Bitmap
  preview: Bitmap
}

export type TFontMap = Map<string, Bitmap>

export type TPos = [x: number, y: number]

export type TSymbol = string
export type TGlyphMap = Map<TSymbol, Bitmap>

export const PREVIEW_TOOLS = ['line', 'rectangle', 'ellipse'] as const
export const DIRECT_TOOLS = ['pen', 'eraser', 'fill'] as const

export type TPreviewTool = (typeof PREVIEW_TOOLS)[number]
export type TDirectTool = (typeof DIRECT_TOOLS)[number]
export type TTool = TPreviewTool | TDirectTool

export const BITMAP_SIZES = [8, 16, 32, 64] as const
export type TBitmapSize = (typeof BITMAP_SIZES)[number]

// const ALL_TOOLS = new Set<TTool>([...PREVIEW_TOOLS, ...DIRECT_TOOLS])

/* --- TYPE GUARDS --- */
export const isDirectTool = (tool: TTool): tool is TDirectTool =>
  (DIRECT_TOOLS as readonly string[]).includes(tool as TDirectTool)

export const isPreviewTool = (tool: TTool): tool is TPreviewTool =>
  (PREVIEW_TOOLS as readonly string[]).includes(tool as TPreviewTool)

export type TToolContext = {
  main: Bitmap
  setMain: (bitmap: Bitmap) => void
  updatePreview: (bitmap: Bitmap) => void
}

export type TPointerState = {
  isDown: boolean
  start: TPos | null
  previous: TPos | null
  current: TPos | null
}

export type TRenderMode = {
  preview: {
    setColor: number
    unsetColor: number
    setAlpha: number
    unsetAlpha: number
  }
  main: {
    setColor: number
    unsetColor: number
    setAlpha: number
    unsetAlpha: number
  }
}
