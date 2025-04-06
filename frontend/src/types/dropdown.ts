export type TDropdownType = 'file' | 'edit' | 'view' | 'tools'

export type TDropdownOptionAction = {
  type: 'action'
  label: string
  shortcut?: string
  actionKey: string // Use this key to reference the action
}

export type TDropdownOptionDialog = {
  type: 'dialog'
  label: string
  shortcut?: string
  modalKey: string // Which modal to open
}

export type TDropdownOptionDivider = {
  type: 'divider'
}

export type TDropdownOption =
  | TDropdownOptionAction
  | TDropdownOptionDialog
  | TDropdownOptionDivider

export type TDropdownConfig = {
  label: string // e.g. "file", "edit", etc.
  options: TDropdownOption[]
}
