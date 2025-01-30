import Bitmap from '@/classes/Bitmap'
import { TPos } from '@/types'

export const isBitmapAction = (type: string): type is TBitmapAction['type'] => {
  const bitmapActions = [
    'setBitmap',
    'draw',
    'erase',
    'drawLine',
    'drawRectangle',
    'drawEllipse',
    'fill',
    'commitPreview',
  ] as const

  return (bitmapActions as readonly string[]).includes(type)
}

type TBitmapAction =
  | { type: 'setBitmap'; bitmap: Bitmap; resetPreview: boolean }
  | { type: 'draw'; from: TPos; to: TPos }
  | { type: 'erase'; from: TPos; to: TPos }
  | { type: 'drawLine'; from: TPos; to: TPos; preview: boolean }
  | { type: 'drawRectangle'; from: TPos; to: TPos; preview: boolean }
  | { type: 'drawEllipse'; center: TPos; radius: TPos; preview: boolean }
  | { type: 'fill'; pos: TPos }
  | { type: 'commitPreview' }
type TStateAction =
  | { type: 'updateScale'; scale: number }
  | { type: 'updatePreview' }

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
const updateLayer = (
  state: TEditorState,
  layerName: keyof TEditorState['layers'],
  operation: (bitmap: Bitmap) => Bitmap,
): TEditorState => ({
  ...state,
  layers: {
    ...state.layers,
    [layerName]: operation(state.layers[layerName].clone()),
  },
})

export const editorReducer = (
  state: TEditorState,
  action: TEditorAction,
): TEditorState => {
  switch (action.type) {
    case 'updateScale':
      return { ...state, scale: action.scale }

    case 'setBitmap': {
      return {
        ...state,
        layers: {
          main: action.bitmap,
          preview: action.resetPreview
            ? new Bitmap(action.bitmap.getSize())
            : state.layers.preview,
        },
      }
    }

    case 'draw':
      return updateLayer(state, 'main', bitmap =>
        bitmap.drawLine(action.from, action.to),
      )

    case 'erase':
      return updateLayer(state, 'main', bitmap =>
        bitmap.erase(action.from, action.to),
      )

    case 'drawLine':
      return action.preview
        ? updateLayer(state, 'preview', bitmap =>
            bitmap.clear().drawLine(action.from, action.to),
          )
        : updateLayer(state, 'main', bitmap => bitmap.combine(state.layers.preview))

    case 'drawRectangle':
      return action.preview
        ? updateLayer(state, 'preview', bitmap =>
            bitmap.clear().drawRectangle(action.from, action.to),
          )
        : updateLayer(state, 'main', bitmap => bitmap.combine(state.layers.preview))

    case 'drawEllipse':
      return action.preview
        ? updateLayer(state, 'preview', bitmap =>
            bitmap.clear().drawEllipse(action.center, action.radius),
          )
        : updateLayer(state, 'main', bitmap => bitmap.combine(state.layers.preview))

    case 'fill':
      return updateLayer(state, 'main', bitmap => bitmap.fill(action.pos))

    case 'commitPreview':
      return {
        ...state,
        layers: {
          main: state.layers.main.clone().combine(state.layers.preview),
          preview: state.layers.preview.clone().clear(),
        },
      }

    default:
      return state
  }
}

export default editorReducer
