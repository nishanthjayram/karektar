import { TBitmapSize, TPos } from '@/types/common'
import { DEFAULT_BITMAP_SIZE } from '@/constants'
import { BufferPool } from './BufferPool'

const globalBufferPool = new BufferPool()

type TBitmapIndex = {
  byteIndex: number
  bitIndex: number
}
const getBitmapIndex = (index: number): TBitmapIndex => {
  return {
    byteIndex: index >> 3,
    bitIndex: 7 - (index & 0x7),
  }
}
export class Bitmap implements Disposable {
  private data: Uint8Array
  private readonly size: TBitmapSize
  private disposed = false

  constructor(size: TBitmapSize = DEFAULT_BITMAP_SIZE) {
    this.size = size
    const bufferSize = Math.ceil((size * size) / 8)
    this.data = globalBufferPool.acquire(bufferSize)
  }

  [Symbol.dispose](): void {
    if (this.disposed) return

    globalBufferPool.release(this.data)
    this.disposed = true
    // @ts-expect-error: Marking as disposed
    this.data = null
  }

  private ensureNotDisposed(): void {
    if (this.disposed) {
      throw new Error('Cannot operate on disposed Bitmap')
    }
  }

  // Helper functions
  private posToIndex([x, y]: TPos): number {
    return y * this.size + x
  }

  private checkPos([x, y]: TPos): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size
  }

  // Getters and setters
  getSize(): TBitmapSize {
    return this.size
  }

  getData(): Uint8Array {
    return this.data
  }

  setData(data: Uint8Array): this {
    this.ensureNotDisposed()
    if (data.length !== this.data.length) {
      throw new Error('Invalid data length')
    }
    const oldBuffer = this.data
    this.data = globalBufferPool.acquire(data.length)
    this.data.set(data)
    globalBufferPool.release(oldBuffer)
    return this
  }

  isEmpty(): boolean {
    return this.data.every(byte => byte === 0)
  }

  // Core bitmap operations
  clear(): this {
    this.ensureNotDisposed()
    const newBuffer = globalBufferPool.acquire(this.data.length)
    globalBufferPool.release(this.data)
    this.data = newBuffer
    return this
  }

  // TODO: Optimize via buffer pooling
  clone(): Bitmap {
    this.ensureNotDisposed()
    const copy = new Bitmap(this.size)
    copy.data.set(this.data)
    return copy
  }

  getPixel([x, y]: TPos): number {
    this.ensureNotDisposed()
    if (!this.checkPos([x, y])) return 0
    const index = this.posToIndex([x, y])
    const { byteIndex, bitIndex } = getBitmapIndex(index)
    return (this.data[byteIndex] >> bitIndex) & 1
  }

  setPixel([x, y]: TPos, value: boolean): this {
    this.ensureNotDisposed()
    if (!this.checkPos([x, y])) return this
    const index = this.posToIndex([x, y])
    const { byteIndex, bitIndex } = getBitmapIndex(index)
    if (value) {
      this.data[byteIndex] |= 1 << bitIndex
    } else {
      this.data[byteIndex] &= ~(1 << bitIndex)
    }
    return this
  }

  erase([x0, y0]: TPos, [x1, y1]: TPos): this {
    this.ensureNotDisposed()
    for (const [x, y] of getLine([x0, y0], [x1, y1])) {
      this.setPixel([x, y], false)
    }
    return this
  }

  drawLine([x0, y0]: TPos, [x1, y1]: TPos): this {
    this.ensureNotDisposed()
    for (const [x, y] of getLine([x0, y0], [x1, y1])) {
      this.setPixel([x, y], true)
    }
    return this
  }

  drawRectangle([x0, y0]: TPos, [x1, y1]: TPos): this {
    this.ensureNotDisposed()
    return this.drawLine([x0, y0], [x1, y0])
      .drawLine([x1, y0], [x1, y1])
      .drawLine([x1, y1], [x0, y1])
      .drawLine([x0, y1], [x0, y0])
  }

  drawEllipse([x0, y0]: TPos, [rx, ry]: TPos): this {
    this.ensureNotDisposed()
    for (const pos of getEllipse([x0, y0], rx, ry)) {
      this.setPixel(pos, true)
    }
    return this
  }

  fill([x, y]: TPos): this {
    this.ensureNotDisposed()
    if (!this.checkPos([x, y])) return this
    if (this.getPixel([x, y])) return this

    const queue: TPos[] = [[x, y]]
    const seen = new Set<number>()

    while (queue.length > 0) {
      const pos = queue.pop()!
      const idx = this.posToIndex(pos)

      if (seen.has(idx)) continue
      seen.add(idx)

      if (!this.getPixel(pos)) {
        const [x, y] = pos
        this.setPixel(pos, true)

        const neighbors: TPos[] = [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ]

        for (const neighbor of neighbors) {
          if (this.checkPos(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
    }
    return this
  }

  combine(preview: Bitmap): this {
    this.ensureNotDisposed()
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] |= preview.data[i]
    }
    return this
  }

  serialize(): string {
    return Array.from(this.data)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  }
}

/* SHAPE GENERATORS */
export function* getLine([x0, y0]: TPos, [x1, y1]: TPos): Generator<TPos> {
  let x = x0
  let y = y0
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy

  while (true) {
    yield [x, y]
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
}

export function* getEllipse(
  [cx, cy]: TPos,
  rx: number,
  ry: number,
): Generator<TPos> {
  // Helper function to plot points
  function* plotPoints(x: number, y: number): Generator<TPos> {
    yield [cx + x, cy + y]
    yield [cx - x, cy + y]
    yield [cx + x, cy - y]
    yield [cx - x, cy - y]
  }

  let x = 0
  let y = ry

  // Pre-calculate constants
  const rx2 = rx * rx
  const ry2 = ry * ry
  const tworx2 = 2 * rx2
  const twory2 = 2 * ry2

  // First region decision parameter and increment
  let pk = ry2 - rx2 * ry + 0.25 * rx2
  let dx = 0
  let dy = tworx2 * y

  while (dx < dy) {
    yield* plotPoints(x, y)

    if (pk < 0) {
      x++
      dx += twory2
      pk += dx + ry2
    } else {
      x++
      y--
      dx += twory2
      dy -= tworx2
      pk += dx - dy + ry2
    }
  }

  // Second region
  pk = ry2 * Math.pow(x + 0.5, 2) + rx2 * Math.pow(y - 1, 2) - rx2 * ry2

  while (y >= 0) {
    yield* plotPoints(x, y)

    if (pk > 0) {
      y--
      dy -= tworx2
      pk += rx2 - dy
    } else {
      x++
      y--
      dx += twory2
      dy -= tworx2
      pk += dx - dy + rx2
    }
  }
}

export default Bitmap
