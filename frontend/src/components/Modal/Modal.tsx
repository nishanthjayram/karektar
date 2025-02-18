import { DropdownMenu } from '@components/DropdownMenu/DropdownMenu'
import styles from './Modal.module.css'

type TModalConfig = {
  title: string
  components: Array<TModalComponent>
}

type TModalComponent =
  | { type: 'header'; text: string }
  | { type: 'label'; text: string }
  | { type: 'textfield'; placeholder: string }
  | { type: 'dropdown'; label: string; options: string[] }
  | { type: 'separator' }

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  config: TModalConfig
}

export const Modal = ({ isOpen, onClose, config }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span>{config.title}</span>
          <button className={styles.closeButton} onClick={onClose}>
            X
          </button>
        </div>

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
                return (
                  <DropdownMenu
                    key={idx}
                    label={component.label}
                    menuItems={component.options.map(option => ({
                      label: option,
                      action: () => console.log(option),
                    }))}
                  />
                )

              case 'separator':
                return <hr key={idx} className={styles.separator} />

              default:
                return null
            }
          })}
        </div>

        <button className={styles.confirmButton} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  )
}
