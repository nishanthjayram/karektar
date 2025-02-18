import { TSerializedBitmap } from '@common/types'
import { TBitmapConverter } from '@/types/editor'
import Bitmap from '@/classes/Bitmap'

export const bitmapConverter: TBitmapConverter = {
  toBitmap: (serialized: TSerializedBitmap): Bitmap => {
    const bitmap = new Bitmap(serialized.size)
    bitmap.setData(new Uint8Array(serialized.data))
    return bitmap
  },

  fromBitmap: (bitmap: Bitmap): TSerializedBitmap => ({
    size: bitmap.getSize(),
    data: bitmap.getData(),
  }),
}
