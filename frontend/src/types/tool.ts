import Bitmap from '@/classes/Bitmap'
import { TPointerState } from './common'

export type TToolOperation = {
  operate: (bitmap: Bitmap, pointer: TPointerState) => Bitmap
  needsPreview: boolean
}
