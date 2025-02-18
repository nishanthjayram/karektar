export type TSymbol = string
export type TGlyph = Uint8Array
export type TGlyphSet = Map<TSymbol, TGlyph>

export type TSaveState = {
  glyphSet: TGlyphSet
  bitmapSize: number
  inputText: string
}

export function serializeSaveState(state: TSaveState): Uint8Array {
  // First pass: validate all glyph data
  for (const [symbol, glyph] of state.glyphSet) {
    const expectedSize = Math.ceil((state.bitmapSize * state.bitmapSize) / 8)
    if (glyph.length !== expectedSize) {
      console.error('Glyph validation failed:', {
        symbol,
        glyphLength: glyph.length,
        expectedLength: expectedSize,
        bitmapSize: state.bitmapSize,
      })
      throw new Error(
        `Invalid glyph size for symbol "${symbol}": ${glyph.length} bytes (expected ${expectedSize})`,
      )
    }
  }

  // Calculate sizes
  const glyphDataSize = Math.ceil((state.bitmapSize * state.bitmapSize) / 8)

  if (glyphDataSize <= 0) {
    throw new Error('Invalid bitmap size')
  }
  let iter
  // eslint-disable-next-line no-cond-assign
  if ((iter = state.glyphSet.values().next()) && iter.value) {
    console.log(iter.value)
    // console.log('Debug sizes:', {
    //   bitmapSize: state.bitmapSize,
    //   glyphDataSize,
    //   glyphSetSize: state.glyphSet.size,
    //   inputTextLength: state.inputText.length,
    //   firstGlyphSize: iter.value ? iter.value.length : 'no glyphs',
    // })
  }

  // Calculate total buffer size
  const totalSize =
    4 + // bitmapSize
    4 + // input text length
    state.inputText.length * 2 + // input text (UTF-16)
    4 + // glyph count
    state.glyphSet.size * (2 + glyphDataSize) // glyph entries

  console.log('Buffer allocation:', {
    totalSize,
    headerSize: 12,
    textSize: state.inputText.length * 2,
    glyphsSize: state.glyphSet.size * (2 + glyphDataSize),
  })

  // Create buffer
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  let offset = 0

  // Write bitmap size
  view.setUint32(offset, state.bitmapSize, true)
  offset += 4

  // Write input text
  view.setUint32(offset, state.inputText.length, true)
  offset += 4
  for (let i = 0; i < state.inputText.length; i++) {
    view.setUint16(offset, state.inputText.charCodeAt(i), true)
    offset += 2
  }

  // Write glyphs
  view.setUint32(offset, state.glyphSet.size, true)
  offset += 4

  let glyphIndex = 0
  for (const [symbol, glyph] of state.glyphSet) {
    try {
      // Write symbol (assuming single UTF-16 code unit for now)
      view.setUint16(offset, symbol.charCodeAt(0), true)
      offset += 2

      // Write bitmap data
      const uint8View = new Uint8Array(buffer, offset, glyphDataSize)
      console.log(`Writing glyph ${glyphIndex}:`, {
        symbol,
        glyphLength: glyph.length,
        bufferRemaining: buffer.byteLength - offset,
        viewSize: uint8View.length,
      })

      uint8View.set(glyph)
      offset += glyphDataSize
      glyphIndex++
    } catch (e) {
      console.error('Error processing glyph:', {
        symbol,
        glyphIndex,
        offset,
        bufferSize: buffer.byteLength,
        glyphSize: glyph.length,
      })
      throw e
    }
  }

  return new Uint8Array(buffer)
}

export function deserializeSaveState(data: Uint8Array): TSaveState {
  const view = new DataView(data.buffer)
  let offset = 0

  // Read bitmap size
  const bitmapSize = view.getUint32(offset, true)
  offset += 4

  // Read input text
  const textLength = view.getUint32(offset, true)
  offset += 4
  let inputText = ''
  for (let i = 0; i < textLength; i++) {
    inputText += String.fromCharCode(view.getUint16(offset, true))
    offset += 2
  }

  // Read glyphs
  const glyphCount = view.getUint32(offset, true)
  offset += 4

  const glyphDataSize = Math.ceil((bitmapSize * bitmapSize) / 8)
  const glyphSet = new Map<TSymbol, TGlyph>()

  for (let i = 0; i < glyphCount; i++) {
    const symbol = String.fromCharCode(view.getUint16(offset, true))
    offset += 2

    const glyph = new Uint8Array(data.buffer.slice(offset, offset + glyphDataSize))
    offset += glyphDataSize

    glyphSet.set(symbol, glyph)
  }

  return {
    glyphSet,
    bitmapSize,
    inputText,
  }
}

// Helper function to test the serialization
export function testSerialization(state: TSaveState): boolean {
  console.log('Testing serialization with state:', {
    bitmapSize: state.bitmapSize,
    inputTextLength: state.inputText.length,
    glyphSetSize: state.glyphSet.size,
  })

  const serialized = serializeSaveState(state)
  const deserialized = deserializeSaveState(serialized)

  // Basic equality checks
  if (
    state.bitmapSize !== deserialized.bitmapSize ||
    state.inputText !== deserialized.inputText ||
    state.glyphSet.size !== deserialized.glyphSet.size
  ) {
    console.error('Basic equality check failed:', {
      originalBitmapSize: state.bitmapSize,
      deserializedBitmapSize: deserialized.bitmapSize,
      originalText: state.inputText,
      deserializedText: deserialized.inputText,
      originalGlyphCount: state.glyphSet.size,
      deserializedGlyphCount: deserialized.glyphSet.size,
    })
    return false
  }

  // Check each glyph
  for (const [symbol, glyph] of state.glyphSet) {
    const deserializedGlyph = deserialized.glyphSet.get(symbol)
    if (!deserializedGlyph) {
      console.error(`Missing glyph after deserialization: ${symbol}`)
      return false
    }
    if (!arraysEqual(glyph, deserializedGlyph)) {
      console.error(`Glyph mismatch for symbol ${symbol}:`, {
        originalLength: glyph.length,
        deserializedLength: deserializedGlyph.length,
        originalFirst10: Array.from(glyph.slice(0, 10)),
        deserializedFirst10: Array.from(deserializedGlyph.slice(0, 10)),
      })
      return false
    }
  }

  return true
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }
  return a.every((val, idx) => val === b[idx])
}
