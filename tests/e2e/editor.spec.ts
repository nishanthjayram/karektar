import {expect, test} from '@playwright/test'
import {
  dragCells,
  drawCell,
  editorCanvas,
  expectCanvasCellFilled,
  mockLocalDraftMode,
  readCanvasPixel,
} from './helpers/canvas'

test.beforeEach(async ({page}) => {
  await mockLocalDraftMode(page)
  await page.goto('/')
})

test('loads the editor in local draft mode', async ({page}) => {
  await expect(page.getByTestId('app-page')).toBeVisible()
  await expect(page.getByTestId('account-user')).toHaveText('Local draft mode')
  await expect(editorCanvas(page)).toBeVisible()
  await expect(page.getByTestId('active-glyph')).toHaveText('a')
})

test('submits a custom prompt and updates the glyph set', async ({page}) => {
  await page.getByTestId('prompt-input').fill('cab!')
  await page.getByTestId('submit-button').dispatchEvent('pointerup')
  await page.getByTestId('confirm-button').click()

  await expect(page.getByTestId('active-glyph')).toHaveText('a')
  await expect(page.getByTestId('glyph-a')).toBeVisible()
  await expect(page.getByTestId('glyph-b')).toBeVisible()
  await expect(page.getByTestId('glyph-c')).toBeVisible()
  await expect(page.getByLabel('Glyph !')).toBeVisible()
})

test('draws a cell on the canvas and supports undo and redo', async ({page}) => {
  const initialPixel = await readCanvasPixel(page, [2, 2])

  await drawCell(page, [2, 2])
  await expectCanvasCellFilled(page, [2, 2])

  await page.getByTestId('action-undo').click()
  await expect.poll(() => readCanvasPixel(page, [2, 2])).toEqual(initialPixel)

  await page.getByTestId('action-redo').click()
  await expectCanvasCellFilled(page, [2, 2])
})

test('uses the rectangle shape tool for a drag interaction', async ({page}) => {
  await page.getByTestId('menu-shapes').click()
  await page.getByTestId('tool-rectangle').click()

  await dragCells(page, [1, 1], [3, 3])

  await expectCanvasCellFilled(page, [1, 1])
  await expectCanvasCellFilled(page, [3, 3])
})

test('confirms reset and clears drawn work', async ({page}) => {
  const initialPixel = await readCanvasPixel(page, [2, 2])

  await drawCell(page, [2, 2])
  await expectCanvasCellFilled(page, [2, 2])

  await page.getByTestId('reset-button').dispatchEvent('pointerup')
  await expect(page.getByTestId('confirm-message')).toBeVisible()
  await page.getByTestId('confirm-button').click()

  await expect.poll(() => readCanvasPixel(page, [2, 2])).toEqual(initialPixel)
})

test('opens the export confirmation and reaches the font name prompt', async ({
  page,
}) => {
  await page.evaluate(() => {
    const testWindow = window as typeof window & {__exportPromptCount: number}
    testWindow.__exportPromptCount = 0
    window.prompt = () => {
      testWindow.__exportPromptCount += 1
      return null
    }
  })

  await page.getByTestId('export-button').dispatchEvent('pointerup')
  await expect(page.getByTestId('confirm-message')).toBeVisible()
  await page.getByTestId('confirm-button').click()

  await expect(page.getByTestId('confirm-message')).toBeHidden()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & {__exportPromptCount: number})
            .__exportPromptCount,
      ),
    )
    .toBe(1)
})
