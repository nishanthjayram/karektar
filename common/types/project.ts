import { TBitmapSize } from './bitmap'

export type TSerializedBitmap = {
  size: TBitmapSize
  data: Uint8Array
}

export type TSerializedFontMap = {
  [char: string]: TSerializedBitmap
}

export type TProjectMetadata = {
  id: string
  name: string
  bitmapSize: TBitmapSize
  dateCreated: number
  dateModified: number
  fontMap: TSerializedFontMap
}

export type TSession = {
  userId: string
  email: string
  name: string
  expiresAt: number
}
