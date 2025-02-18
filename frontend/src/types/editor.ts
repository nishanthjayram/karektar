import { TSerializedBitmap } from '@common/types'
import { TPos } from '@/types/common'
import Bitmap from '@/classes/Bitmap'

export type TLayers = {
  main: Bitmap
  preview: Bitmap
}

export type TFontMap = Map<string, Bitmap>
export type TGlyphMap = Map<string, Bitmap>

export type TBitmapConverter = {
  toBitmap: (serialized: TSerializedBitmap) => Bitmap
  fromBitmap: (bitmap: Bitmap) => TSerializedBitmap
}

export type TBitmapAction =
  | { type: 'SET_BITMAP'; payload: { bitmap: Bitmap; resetPreview: boolean } }
  | { type: 'DRAW'; payload: { from: TPos; to: TPos } }
  | { type: 'ERASE'; payload: { from: TPos; to: TPos } }
  | { type: 'DRAW_LINE'; payload: { from: TPos; to: TPos; preview: boolean } }
  | { type: 'DRAW_RECTANGLE'; payload: { from: TPos; to: TPos; preview: boolean } }
  | {
      type: 'DRAW_ELLIPSE'
      payload: { center: TPos; radius: TPos; preview: boolean }
    }
  | { type: 'FILL'; payload: { pos: TPos } }
  | { type: 'COMMIT_PREVIEW' }

type TStateAction =
  | { type: 'UPDATE_SCALE'; payload: { scale: number } }
  | { type: 'UPDATE_PREVIEW' }

export type TEditorAction = TBitmapAction | TStateAction
export type TEditorState = {
  scale: number
  layers: {
    main: Bitmap
    preview: Bitmap
  }
  // history: {
  // store difference between current and previous state
  // }
}
