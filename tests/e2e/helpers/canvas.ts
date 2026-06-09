import {expect, type Locator, type Page} from '@playwright/test'

const FILLED_CELL_RGB = [43, 43, 43] as const

export const editorCanvas = (page: Page) => page.getByTestId('editor-canvas')

export const mockLocalDraftMode = async (page: Page) => {
  await page.route('**/api/auth/check', route =>
    route.fulfill({status: 401, body: 'Unauthorized'}),
  )
}

export const canvasCellCenter = async (
  canvas: Locator,
  cell: [number, number],
  bitmapSize = 16,
) => {
  const box = await canvas.boundingBox()
  if (!box) {
    throw new Error('Editor canvas is not visible')
  }

  const cellSize = box.width / bitmapSize
  return {
    x: box.x + cellSize * cell[0] + cellSize / 2,
    y: box.y + cellSize * cell[1] + cellSize / 2,
  }
}

export const drawCell = async (page: Page, cell: [number, number]) => {
  const canvas = editorCanvas(page)
  const point = await canvasCellCenter(canvas, cell)

  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  await page.mouse.up()
}

export const dragCells = async (
  page: Page,
  start: [number, number],
  end: [number, number],
) => {
  const canvas = editorCanvas(page)
  const startPoint = await canvasCellCenter(canvas, start)
  const endPoint = await canvasCellCenter(canvas, end)

  await page.mouse.move(startPoint.x, startPoint.y)
  await page.mouse.down()
  await page.waitForTimeout(50)
  await page.mouse.move(endPoint.x, endPoint.y)
  await page.mouse.up()
}

export const readCanvasPixel = async (page: Page, cell: [number, number]) =>
  page.getByTestId('editor-canvas').evaluate((canvas, targetCell) => {
    const editorCanvas = canvas as HTMLCanvasElement
    const ctx = editorCanvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context is unavailable')
    }

    const [cellX, cellY] = targetCell as [number, number]
    const cellSize = editorCanvas.width / 16
    const x = Math.floor(cellSize * cellX + cellSize / 2)
    const y = Math.floor(cellSize * cellY + cellSize / 2)

    return Array.from(ctx.getImageData(x, y, 1, 1).data)
  }, cell)

export const expectCanvasCellFilled = async (page: Page, cell: [number, number]) => {
  await expect.poll(() => readCanvasPixel(page, cell)).toEqual([
    ...FILLED_CELL_RGB,
    255,
  ])
}
