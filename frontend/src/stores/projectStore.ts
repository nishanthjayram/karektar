// stores/projectStore.ts
import { TBitmapSize, TProjectMetadata, TSerializedFontMap } from '@common/types'
import { create } from 'zustand'
import { TFontMap } from '@/types/common'
import { TProjectStore } from '@/types/stores'
import Bitmap from '@/classes/Bitmap'
import { bitmapConverter } from '@/utils/bitmap'

const getWorkerUrl = () =>
  `${window.location.protocol}//${window.location.hostname}:8787`

export const useProjectStore = create<TProjectStore>((set, get) => ({
  projects: {},

  getProjectCount: () => Object.keys(get().projects).length,

  loadProjects: async () => {
    try {
      const response = await fetch(`${getWorkerUrl()}/api/projects/list`, {
        credentials: 'include',
      })
      if (response.ok) {
        const projects = await response.json()
        set({ projects })
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  },

  createProject: async (name: string, bitmapSize: TBitmapSize) => {
    const id = crypto.randomUUID()
    const metadata: TProjectMetadata = {
      id,
      name,
      bitmapSize,
      dateCreated: Date.now(),
      dateModified: Date.now(),
      fontMap: {}, // Empty serialized font map
    }

    try {
      const response = await fetch(`${getWorkerUrl()}/api/projects/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, metadata }),
      })

      if (response.ok) {
        set(state => ({
          projects: { ...state.projects, [id]: metadata },
        }))
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  },

  deleteProject: async (id: string) => {
    try {
      const response = await fetch(
        `${getWorkerUrl()}/api/projects/delete?id=${id}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      )

      if (response.ok) {
        set(state => {
          const { [id]: removed, ...rest } = state.projects
          return { projects: rest }
        })
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  },

  saveProject: async (id: string) => {
    const project = get().projects[id]
    if (!project) return

    try {
      await fetch(`${getWorkerUrl()}/api/projects/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          metadata: {
            ...project,
            dateModified: Date.now(),
          },
        }),
      })
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  },

  saveFontMap: async (projectId: string, fontMap: TFontMap) => {
    const project = get().projects[projectId]
    if (!project) return

    const serializedFontMap: TSerializedFontMap = {}
    fontMap.forEach((bitmap, char) => {
      serializedFontMap[char] = bitmapConverter.fromBitmap(bitmap)
    })

    const updatedProject: TProjectMetadata = {
      ...project,
      fontMap: serializedFontMap,
      dateModified: Date.now(),
    }

    try {
      const response = await fetch(`${getWorkerUrl()}/api/projects/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          metadata: updatedProject,
        }),
      })

      if (response.ok) {
        set(state => ({
          projects: {
            ...state.projects,
            [projectId]: updatedProject,
          },
        }))
      }
    } catch (error) {
      console.error('Failed to save font map:', error)
    }
  },

  loadFontMap: (projectId: string): TFontMap => {
    const project = get().projects[projectId]
    if (!project) return new Map()

    const fontMap = new Map<string, Bitmap>()
    Object.entries(project.fontMap).forEach(([char, serializedBitmap]) => {
      fontMap.set(char, bitmapConverter.toBitmap(serializedBitmap))
    })

    return fontMap
  },
}))
