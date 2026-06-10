import {describe, expect, test} from 'vitest'
import {
  fill,
  indexToPos,
  plotLine,
  plotRect,
  posToIndex,
} from '../../src/utils/helpers/canvas.helpers'

describe('canvas helpers', () => {
  test('converts between positions and flat indices', () => {
    expect(posToIndex([3, 2], 16)).toBe(35)
    expect(indexToPos(35, 16)).toEqual([3, 2])
  })

  test('plots a diagonal line across the bitmap grid', () => {
    expect(plotLine([0, 0], [3, 3], 16)).toEqual([0, 17, 34, 51])
  })

  test('plots a rectangle outline', () => {
    expect(new Set(plotRect([1, 1], [3, 3], 16))).toEqual(
      new Set([17, 19, 33, 35, 49, 51, 18, 50]),
    )
  })

  test('fills the connected empty region without crossing filled cells', () => {
    const glyph = new Array<boolean>(16).fill(false)
    glyph[1] = true
    glyph[4] = true
    glyph[5] = true

    expect(new Set(fill([0, 0], glyph, 4))).toEqual(new Set([0]))
  })
})
