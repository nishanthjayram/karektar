export class BufferPool {
  private pools: Map<number, Uint8Array[]> = new Map()
  private maxPoolSize: number = 50

  acquire(size: number): Uint8Array {
    let pool = this.pools.get(size)
    return pool?.pop() ?? new Uint8Array(size)
  }

  release(buffer: Uint8Array): void {
    const size = buffer.length
    let pool = this.pools.get(size) ?? this.pools.set(size, []).get(size)!

    if (pool.length < this.maxPoolSize) {
      buffer.fill(0)
      pool.push(buffer)
    }
  }

  clear(): void {
    this.pools.clear()
  }
}
