import { TModalType } from './modal'

/* --- MENU TYPES --- */
export type TMenuItemConfig = TMenuAction | { type: 'separator' }

export type TMenuItem = {
  label: string
  action?: () => void
  submenu?: TMenuItem[]
}

export type TMenuAction =
  | {
      type: 'action'
      label: string
      onClick: () => void
    }
  | {
      type: 'modal'
      label: string
      modalType: TModalType
      modalProps: ModalProps
    }

export type TMenuConfig = {
  label: string
  items: TMenuItemConfig[]
}
export interface ModalProps {
  onClose: () => void
}

export type TModalType = 'new-project' | 'settings' | 'export' | null
