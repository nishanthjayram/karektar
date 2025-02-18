import { useEffect, useRef, useState } from 'react'
import { TMenuItem } from '@/types/menu'
import styles from './DropdownMenu.module.css'

type DropdownProps = {
  className?: string
  label: string
  labelType?: 'icon' | 'text'
  menuItems: TMenuItem[]
}

export const DropdownMenu = ({
  className = '',
  label,
  labelType = 'text',
  menuItems,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className={`${styles.menuContainer} ${className}`} ref={menuRef}>
      <button className={styles.menuButton} onClick={() => setIsOpen(prev => !prev)}>
        {labelType ? (
          labelType === 'icon' ? (
            <img src={label} alt="menu" />
          ) : (
            label
          )
        ) : (
          label
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className={styles.menuItem}
              onClick={() => {
                item.action?.()
                setIsOpen(false)
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
