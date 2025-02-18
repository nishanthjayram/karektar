import { create } from 'zustand'

export type TMenuStore = {
  activeMenu: string | null
  openMenu: (menu: string) => void
  closeMenu: () => void
}

export const useMenuStore = create<TMenuStore>(set => ({
  activeMenu: null,
  openMenu: menu => set({ activeMenu: menu }),
  closeMenu: () => set({ activeMenu: null }),
}))
