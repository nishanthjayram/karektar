// DropdownBar.tsx
import React from 'react'
import { TDropdownConfig } from '@/types/dropdown'
import { useUIStore } from '@/stores/uiStore'
import { DropdownButton } from '../Dropdown/Dropdown'
import styles from './DropdownBar.module.css'

type DropdownBarProps = {
  dropdowns: TDropdownConfig[]
}

const DropdownBar: React.FC<DropdownBarProps> = ({ dropdowns }) => {
  const { activeDropdown, setActiveDropdown, setActiveModal } = useUIStore()

  // Map action keys to functions
  const actionMapping: Record<string, () => void> = {
    exit: () => {
      console.log('Exiting the application...')
      // Add exit logic here
    },
    undo: () => console.log('Undo action'),
    redo: () => console.log('Redo action'),
  }

  const handleAction = (actionKey: string) => {
    const actionFn = actionMapping[actionKey]
    if (actionFn) actionFn()
  }

  const handleDialogAction = (modalKey: string) => {
    setActiveModal(modalKey)
  }

  return (
    <div className={styles.container} role="menubar" aria-label="Application Menu">
      {dropdowns.map(config => {
        return (
          <DropdownButton
            key={config.label}
            config={config}
            onDialogAction={handleDialogAction}
            onAction={handleAction}
          />
        )
      })}
    </div>
  )
}

export default DropdownBar
