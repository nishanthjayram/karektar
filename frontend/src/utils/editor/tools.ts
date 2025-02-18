import { TPos } from '@/types/common'
import { TToolOperation } from '@/types/tools'
import Bitmap from '@/classes/Bitmap'

/**
 * Utility function for direct tools (pen, eraser) to avoid repetition.
 */
const createDirectTool = (
  drawFn: (bitmap: Bitmap, from: TPos, to: TPos) => void,
): TToolOperation => ({
  needsPreview: false,
  operate: (bitmap, pointer) => {
    const result = bitmap.clone()

    if (pointer.previous && pointer.current) {
      drawFn(result, pointer.previous, pointer.current)
    } else if (pointer.current) {
      drawFn(result, pointer.current, pointer.current)
    }

    return result // Do NOT dispose of this clone
  },
})

/**
 * Utility function for preview tools (line, rectangle, ellipse).
 */
const createPreviewTool = (
  drawFn: (bitmap: Bitmap, start: TPos, current: TPos) => void,
): TToolOperation => ({
  needsPreview: true,
  operate: (bitmap, pointer) => {
    if (!pointer.start || !pointer.current) {
      console.error('Invalid pointer state')
      return bitmap.clone()
    }

    const result = bitmap.clone()
    drawFn(result, pointer.start, pointer.current)
    return result // Do NOT dispose of this clone
  },
})

/** Tool Implementations */
const penTool = createDirectTool((bitmap, from, to) => {
  if (from === to) {
    bitmap.setPixel(from, true)
  } else {
    bitmap.drawLine(from, to)
  }
})

const eraserTool = createDirectTool((bitmap, from, to) => {
  if (from === to) {
    bitmap.setPixel(from, false)
  } else {
    bitmap.erase(from, to)
  }
})

const lineTool = createPreviewTool((bitmap, start, current) => {
  console.log('drawing a line from', start, 'to', current)
  bitmap.drawLine(start, current)
})

const rectangleTool = createPreviewTool((bitmap, start, current) => {
  bitmap.drawRectangle(start, current)
})

const ellipseTool = createPreviewTool((bitmap, start, current) => {
  const halfWidth = Math.round((current[0] - start[0]) / 2)
  const halfHeight = Math.round((current[1] - start[1]) / 2)

  if (Math.floor(halfWidth) === 0 || Math.floor(halfHeight) === 0) return

  const centerX = start[0] + halfWidth
  const centerY = start[1] + halfHeight

  const rx = Math.abs(Math.floor(halfWidth))
  const ry = Math.abs(Math.floor(halfHeight))

  bitmap.drawEllipse([centerX, centerY], [rx, ry])
})

const fillTool = createDirectTool((bitmap, from, to) => {
  bitmap.fill(from)
})

/** Tool Map */
export const tools: Record<string, TToolOperation> = {
  pen: penTool,
  eraser: eraserTool,
  line: lineTool,
  rectangle: rectangleTool,
  ellipse: ellipseTool,
  fill: fillTool,
} as const // Make the record readonly
