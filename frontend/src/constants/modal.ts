import { BITMAP_SIZES } from '@common/types'
import { TDropdownType } from '@/types/dropdown'
import { TModalConfig } from '@/components/ui/Modal/Modal'

export type TModalKey = keyof typeof MODALS_CONFIG
export type TModalType = TModalKey | null

export const MODALS_CONFIG: Record<string, TModalConfig> = {
  newProject: {
    title: 'Create New Project',
    components: [
      { type: 'label', text: 'Project Name:' },
      { type: 'textfield', placeholder: 'Enter project name...' },
      {
        type: 'dropdown',
        label: 'Bitmap Size',
        displayValue: `${BITMAP_SIZES[0]}x${BITMAP_SIZES[0]}`,
        options: BITMAP_SIZES.map(size => ({
          type: 'action',
          label: `${size}x${size}`,
          actionKey: `${size}x${size}`,
        })),
      },
    ],
  },

  saveProject: {
    title: 'Save Project',
    components: [
      { type: 'label', text: 'Enter a name for the project:' },
      { type: 'textfield', placeholder: 'Enter project name...' },
    ],
  },

  exportProject: {
    title: 'Export Project',
    components: [
      { type: 'label', text: 'Select export format:' },
      {
        type: 'dropdown',
        label: 'Formats',
        options: [
          { type: 'action', label: 'OTF', actionKey: 'exportOTF' },
          { type: 'action', label: 'TTF', actionKey: 'exportTTF' },
          { type: 'action', label: 'WOFF2', actionKey: 'exportWOFF2' },
        ],
      },
    ],
  },
}
