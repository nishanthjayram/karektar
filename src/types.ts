export type TPos = [x: number, y: number]
export type TTool =
  | 'DRAW'
  | 'ERASE'
  | 'LINE'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'FILL'
  | 'INVERT'
  | 'CLEAR'
  | 'UNDO'
  | 'REDO'
export type TRect = [x: number, y: number, w: number, h: number]
export type TRange = [startPos: TPos, endPos: TPos]
export type THistory = [states: boolean[][], index: number]
