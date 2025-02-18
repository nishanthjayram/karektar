import { create } from 'zustand'

type TModalType = 'new-project' | 'settings' | 'export' | null

type TModalStore = {
  activeModal: TModalType
  openModal: (modal: TModalType) => void
  closeModal: () => void
}

export const useModalStore = create<TModalStore>(set => ({
  activeModal: null,
  openModal: modal => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}))
