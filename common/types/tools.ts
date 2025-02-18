import { TPos } from "./bitmap"

export const PREVIEW_TOOLS = ['line', 'rectangle', 'ellipse'] as const
export const DIRECT_TOOLS = ['pen', 'eraser', 'fill'] as const
export type TPreviewTool = (typeof PREVIEW_TOOLS)[number]
export type TDirectTool = (typeof DIRECT_TOOLS)[number]
export type TTool = TPreviewTool | TDirectTool

export const isDirectTool = (tool: TTool): tool is TDirectTool =>
    DIRECT_TOOLS.includes(tool as TDirectTool)
  export const isPreviewTool = (tool: TTool): tool is TPreviewTool =>
    PREVIEW_TOOLS.includes(tool as TPreviewTool)

  export type TPointerState = {
    isDown: boolean
    start: TPos | null
    previous: TPos | null
    current: TPos | null
  }
  