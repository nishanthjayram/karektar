import { IStore } from '@/types/stores'

export const selectToolState = (state: IStore) => ({
  currentTool: state.currentTool,
  isPointerDown: state.isPointerDown,
  pointerPos: state.pointerPos,
  dragStartPos: state.dragStartPos,
})

export const selectCurrentTool = (state: IStore) => state.currentTool
export const selectIsPointerDown = (state: IStore) => state.isPointerDown
export const selectPointerPos = (state: IStore) => state.pointerPos
export const selectDragStartPos = (state: IStore) => state.dragStartPos
export const selectSetTool = (state: IStore) => state.setTool

// export const selectToolState = (state: IStore) => ({
//   currentTool: state.currentTool,
//   isPointerDown: state.isPointerDown,
//   pointerPos: state.pointerPos,
//   dragStartPos: state.dragStartPos,
// })

// export const selectIsDrawing = (state: IStore) =>
//   state.isPointerDown && state.pointerPos !== null

// export const selectToolHandlers = (state: IStore) => ({
//   handlePointerDown: state.handlePointerDown,
//   handlePointerMove: state.handlePointerMove,
//   handlePointerUp: state.handlePointerUp,
// })

// export const selectSetTool = (state: IStore) => state.setTool
