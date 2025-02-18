import { TBitmapSize } from '@/types/common'
import { IStore } from '@/types/stores'
import { DEFAULT_BITMAP_SIZE } from '@/constants'

export const selectProjects = (state: IStore) => state.projects
export const selectActiveProjectId = (state: IStore) => state.activeProjectId
export const selectActiveProject = (state: IStore) =>
  state.activeProjectId ? state.projects[state.activeProjectId] : null
export const selectBitmapSize = (state: IStore): TBitmapSize =>
  selectActiveProject(state)?.bitmapSize || DEFAULT_BITMAP_SIZE
