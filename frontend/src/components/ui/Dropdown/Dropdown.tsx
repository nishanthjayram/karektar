// Dropdown.tsx
import React, { useRef } from 'react'
import { TDropdownConfig, TDropdownOption } from '@/types/dropdown'
import { useUIStore } from '@/stores/uiStore'
import styles from './Dropdown.module.css'

export type DropdownMenuProps = {
  options: TDropdownOption[]
  onDialogAction?: (modalKey: string) => void
  onAction?: (actionKey: string) => void
  style?: React.CSSProperties
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  options,
  onDialogAction,
  onAction,
  style,
}) => {
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const { setActiveDropdown } = useUIStore()

  // Set up refs for focusable menu items (dividers are skipped)
  menuItemsRef.current = Array(options.length).fill(null)

  const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      const nextIndex = (index + 1) % options.length
      menuItemsRef.current[nextIndex]?.focus()
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      const prevIndex = (index - 1 + options.length) % options.length
      menuItemsRef.current[prevIndex]?.focus()
      e.preventDefault()
    } else if (e.key === 'Home') {
      menuItemsRef.current[0]?.focus()
      e.preventDefault()
    } else if (e.key === 'End') {
      menuItemsRef.current[options.length - 1]?.focus()
      e.preventDefault()
    }
  }

  return (
    <div
      className={styles.dropdown}
      style={style}
      role="menu"
      aria-orientation="vertical"
    >
      {options.map((item, idx) => {
        if (item.type === 'divider') {
          return <div key={idx} className={styles.divider} role="separator" />
        }
        return (
          <div
            key={idx}
            ref={el => (menuItemsRef.current[idx] = el)}
            className={styles.menuItem}
            role="menuitem"
            tabIndex={0}
            onClick={() => {
              if (item.type === 'dialog' && onDialogAction) {
                onDialogAction(item.modalKey)
              } else if (item.type === 'action' && onAction) {
                onAction(item.actionKey)
              }
              setActiveDropdown(null)
            }}
            onKeyDown={e => {
              handleItemKeyDown(e, idx)
              if (e.key === 'Enter' || e.key === ' ') {
                if (item.type === 'dialog' && onDialogAction) {
                  onDialogAction(item.modalKey)
                } else if (item.type === 'action' && onAction) {
                  onAction(item.actionKey)
                }
                setActiveDropdown(null)
                e.preventDefault()
              } else if (item.shortcut && e.key === item.shortcut) {
                if (item.type === 'dialog' && onDialogAction) {
                  onDialogAction(item.modalKey)
                } else if (item.type === 'action' && onAction) {
                  onAction(item.actionKey)
                }
                setActiveDropdown(null)
                e.preventDefault()
              }
            }}
          >
            <span className={styles.menuLabel}>{item.label}</span>
            {item.shortcut && (
              <span className={styles.shortcut}>{item.shortcut}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export type DropdownButtonProps = {
  config: TDropdownConfig
  onDialogAction?: (modalKey: string) => void
  onAction?: (actionKey: string) => void
  showArrow?: boolean
  buttonStyle?: React.CSSProperties
  menuStyle?: React.CSSProperties
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  config,
  onDialogAction,
  onAction,
  showArrow,
  buttonStyle,
  menuStyle,
}) => {
  const { activeDropdown, setActiveDropdown } = useUIStore()
  const isActive = activeDropdown === config.label

  return (
    <div className={styles.dropdownWrapper}>
      <div
        className={`${styles.dropdownButton} ${isActive ? styles.active : ''}`}
        style={buttonStyle}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isActive}
        onPointerDown={e => {
          e.preventDefault()
          console.log('Dropdown button clicked')
          setActiveDropdown(isActive ? null : config.label)
        }}
      >
        {config.label}
        {showArrow && <span className={styles.arrow} />}
      </div>
      {isActive && (
        <DropdownMenu
          style={menuStyle}
          options={config.options}
          onDialogAction={onDialogAction}
          onAction={onAction}
        />
      )}
    </div>
  )
}
