import { TMenuConfig } from '@/types/menu'

export const FILE_MENU_CONFIG: TMenuConfig = {
  label: 'File',
  items: [
    {
      type: 'modal',
      label: 'New Font...',
      modalType: 'newProject',
    },
    {
      type: 'action',
      label: 'Open...',
      onClick: () => console.log('Opening...'),
    },
    { type: 'separator' },
    {
      type: 'action',
      label: 'Save',
      onClick: () => console.log('Saving...'),
    },
    {
      type: 'action',
      label: 'Export',
      onClick: () => console.log('Exporting...'),
    },
  ],
}
