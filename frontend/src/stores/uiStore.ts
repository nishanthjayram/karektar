import { create } from 'zustand'
import { TUIStore } from '@/types/stores'

export const useUIStore = create<TUIStore>((set, get) => ({
  activeDropdown: null,
  activeModal: null,

  setActiveDropdown: (dropdown: string | null) => set({ activeDropdown: dropdown }),
  setActiveModal: (modal: string | null) => set({ activeModal: modal }),
}))
