import { TDropdownConfig } from '@/types/dropdown'

type ExtractActionOptions =
  (typeof DROPDOWN_BAR_CONFIG)[number]['options'][number] & { type: 'action' }
export type TDropdownActionKey = ExtractActionOptions['actionKey']

export const DROPDOWN_BAR_CONFIG: TDropdownConfig[] = [
  {
    label: 'file',
    options: [
      {
        label: 'New Project',
        type: 'dialog',
        shortcut: 'Ctrl+N',
        modalKey: 'newProject',
      },
      { label: 'Load', type: 'dialog', shortcut: 'Ctrl+L', modalKey: 'loadProject' },
      { label: 'Save', type: 'dialog', shortcut: 'Ctrl+S', modalKey: 'saveProject' },
      {
        label: 'Export',
        type: 'dialog',
        shortcut: 'Ctrl+E',
        modalKey: 'exportProject',
      },
      { type: 'divider' },
      {
        label: 'Exit',
        type: 'action',
        shortcut: 'Ctrl+Q',
        actionKey: 'exit',
      },
    ],
  },
  {
    label: 'edit',
    options: [
      {
        label: 'Undo',
        type: 'action',
        shortcut: 'Ctrl+Z',
        actionKey: 'undo',
      },
      {
        label: 'Redo',
        type: 'action',
        shortcut: 'Ctrl+Y',
        actionKey: 'redo',
      },
    ],
  },
  {
    label: 'view',
    options: [
      {
        label: 'Guidelines',
        type: 'action',
        shortcut: 'Ctrl+G',
        actionKey: 'toggleGuidelines',
      },
      {
        label: 'Model Glyph',
        type: 'action',
        shortcut: 'Ctrl+M',
        actionKey: 'toggleModelGlyph',
      },
    ],
  },
  {
    label: 'tools',
    options: [
      {
        label: 'Preferences',
        type: 'dialog',
        shortcut: 'Ctrl+P',
        modalKey: 'preferences',
      },
    ],
  },
]
