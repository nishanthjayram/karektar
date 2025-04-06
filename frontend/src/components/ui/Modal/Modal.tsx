// Modal.tsx
import React from 'react'
import { TDropdownOption } from '@/types/dropdown'
import { useUIStore } from '@/stores/uiStore'
import { DropdownButton } from '../Dropdown/Dropdown'
import Window, { TWindowConfig } from '../Window/Window'
import styles from './Modal.module.css'

export type TModalConfig = {
  title: string
  components: Array<TModalElement>
}

export type TModalElement =
  | { type: 'header'; text: string }
  | { type: 'label'; text: string }
  | { type: 'textfield'; placeholder: string }
  | {
      type: 'dropdown'
      label: string
      displayValue?: string
      options: TDropdownOption[]
      onAction?: (actionKey: string) => void
      onDialogAction?: (modalKey: string) => void
    }
  | { type: 'separator' }

type TModalProps = {
  config: TModalConfig
}

const Modal: React.FC<TModalProps> = ({ config }) => {
  const { activeModal, setActiveModal } = useUIStore()
  const { activeDropdown } = useUIStore()
  if (!activeModal) return null

  // Configure the header for the Window component.
  const windowConfig: TWindowConfig = {
    header: {
      label: config.title,
      onClose: () => setActiveModal(null),
    },
  }

  const modalContainerStyle: React.CSSProperties = {
    height: 'calc(100% - 300px)',
    width: 'calc(100% - 600px)',
  }

  return (
    <div className={styles.overlay}>
      <Window config={windowConfig} containerStyle={modalContainerStyle}>
        <div className={styles.modalBody}>
          {config.components.map((component, idx) => {
            switch (component.type) {
              case 'header':
                return (
                  <h3 key={idx} className={styles.header}>
                    {component.text}
                  </h3>
                )
              case 'label':
                return (
                  <label key={idx} className={styles.label}>
                    {component.text}
                  </label>
                )
              case 'textfield':
                return (
                  <input
                    key={idx}
                    type="text"
                    placeholder={component.placeholder}
                    className={styles.textField}
                  />
                )
              case 'dropdown':
                // Render an inline dropdown within the modal.
                return (
                  <React.Fragment key={idx}>
                    <label className={styles.label}>{component.label}</label>
                    <DropdownButton
                      config={{
                        label: component.displayValue ?? component.label,
                        options: component.options,
                      }}
                      showArrow
                      buttonStyle={{
                        padding: '5px',
                        border: '1px solid black',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onAction={component.onAction}
                      onDialogAction={component.onDialogAction}
                    />
                  </React.Fragment>
                )
              case 'separator':
                return <hr key={idx} className={styles.separator} />
              default:
                return null
            }
          })}
          <button
            className={styles.confirmButton}
            onClick={() => setActiveModal(null)}
          >
            OK
          </button>
        </div>
      </Window>
    </div>
  )
}

export default Modal
