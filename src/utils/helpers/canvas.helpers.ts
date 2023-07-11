import {assertUnreachable} from './app.helpers'
import {TPos, TRect, TShapeRange, TToolLabel} from '../../types'

export const checkPos = ([x, y]: TPos, bitmapSize: number) =>
  x >= 0 && y >= 0 && x <= bitmapSize - 1 && y <= bitmapSize - 1

export const getMousePos = (
  evt: React.PointerEvent<HTMLCanvasElement>,
  bitmapSize: number,
  pixelSize: number,
): TPos | null => {
  const [x, y] = [
    Math.floor(evt.nativeEvent.offsetX / pixelSize),
    Math.floor(evt.nativeEvent.offsetY / pixelSize),
  ]
  return checkPos([x, y], bitmapSize) ? [x, y] : null
}

export const posToIndex = (pos: TPos, bitmapSize: number): number =>
  bitmapSize * pos[1] + pos[0]
export const indexToPos = (idx: number, bitmapSize: number): TPos => [
  idx % bitmapSize,
  Math.floor(idx / bitmapSize),
]

export const getDistance = ([x0, y0]: TPos, [x1, y1]: TPos): TPos => [
  Math.abs(x1 - x0),
  Math.abs(y1 - y0),
]
export const getRect = (
  idx: number,
  bitmapSize: number,
  pixelSize: number,
): TRect => {
  const [x, y] = indexToPos(idx, bitmapSize)
  return [x * pixelSize + 1, y * pixelSize + 1, pixelSize - 1, pixelSize - 1]
}

export const plotLine = ([x0, y0]: TPos, [x1, y1]: TPos, bitmapSize: number) => {
  const coords = new Array<TPos>()

  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let error = dx + dy

  while (true) {
    coords.push([x0, y0])
    if (x0 === x1 && y0 === y1) {
      break
    }

    const e2 = 2 * error

    if (e2 >= dy) {
      if (x0 === x1) {
        break
      }
      error = error + dy
      x0 = x0 + sx
    }
    if (e2 <= dx) {
      if (y0 === y1) {
        break
      }
      error = error + dx
      y0 = y0 + sy
    }
  }

  return coords.map(c => posToIndex(c, bitmapSize))
}

export const plotRect = ([x0, y0]: TPos, [x1, y1]: TPos, bitmapSize: number) => {
  const coords = new Array<TPos>()
  for (let i = x0; i <= x1; i++) {
    coords.push([i, y0])
    coords.push([i, y1])
  }
  for (let j = y0; j <= y1; j++) {
    coords.push([x0, j])
    coords.push([x1, j])
  }

  return coords.map(c => posToIndex(c, bitmapSize))
}

export const plotEllipse = ([xc, yc]: TPos, [rx, ry]: TPos, bitmapSize: number) => {
  const coords = new Array<TPos>()
  let [x, y] = [0, ry]

  let d1 = ry * ry - rx * rx * ry + 0.25 * rx * rx
  let dx = 2 * ry * ry * x
  let dy = 2 * rx * rx * y

  while (dx < dy) {
    coords.push(
      [x + xc, y + yc],
      [-x + xc, y + yc],
      [x + xc, -y + yc],
      [-x + xc, -y + yc],
    )

    if (d1 < 0) {
      x++
      dx = dx + 2 * ry * ry
      d1 = d1 + dx + ry * ry
    } else {
      x++
      y--
      dx = dx + 2 * ry * ry
      dy = dy - 2 * rx * rx
      d1 = d1 + dx - dy + ry * ry
    }
  }

  let d2 =
    ry * ry * ((x + 0.5) * (x + 0.5)) +
    rx * rx * ((y - 1) * (y - 1)) -
    rx * rx * ry * ry

  while (y >= 0) {
    coords.push(
      [x + xc, y + yc],
      [-x + xc, y + yc],
      [x + xc, -y + yc],
      [-x + xc, -y + yc],
    )

    if (d2 > 0) {
      y--
      dy = dy - 2 * rx * rx
      d2 = d2 + rx * rx - dy
    } else {
      y--
      x++
      dx = dx + 2 * ry * ry
      dy = dy - 2 * rx * rx
      d2 = d2 + dx - dy + rx * rx
    }
  }

  return coords.map(c => posToIndex(c, bitmapSize))
}

export const plotShape = (
  shapeTool: TToolLabel,
  bitmapSize: number,
  shapeRange: TShapeRange,
) => {
  if (!shapeRange) {
    return
  }

  const [startPos, endPos] = shapeRange
  switch (shapeTool) {
    case 'LINE': {
      return plotLine(startPos, endPos, bitmapSize)
    }
    case 'RECTANGLE': {
      return plotRect(startPos, endPos, bitmapSize)
    }
    case 'ELLIPSE': {
      return plotEllipse(endPos, getDistance(startPos, endPos), bitmapSize)
    }
    case 'DRAW':
    case 'ERASE':
    case 'FILL': {
      return
    }
    default: {
      return assertUnreachable(shapeTool)
    }
  }
}

export const fill = (start: TPos, glyphCanvas: boolean[], bitmapSize: number) => {
  if (glyphCanvas[posToIndex(start, bitmapSize)]) {
    return
  }

  const queue = [start]
  const visited = new Array<TPos>()

  while (queue.length > 0) {
    const pos = queue.pop()

    if (pos === undefined) {
      break
    }

    const [x, y] = pos
    const cells: TPos[] = [
      [x, y],
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]
    cells.forEach(c => {
      if (
        checkPos(c, bitmapSize) &&
        !visited.some(e => e.join() === c.join()) &&
        !glyphCanvas[posToIndex(c, bitmapSize)]
      ) {
        queue.push(c)
        visited.push(c)
      }
    })
  }

  return visited.map(c => posToIndex(c, bitmapSize))
}
