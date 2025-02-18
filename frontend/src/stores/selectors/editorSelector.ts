import { IStore } from '@/types/stores'

// Separate selectors for individual properties if needed
export const selectScale = (state: IStore) => state.scale
export const selectLayers = (state: IStore) => state.layers

// export const selectMainLayer = (state: IStore) => state.layers.main
// export const selectPreviewLayer = (state: IStore) => state.layers.preview
