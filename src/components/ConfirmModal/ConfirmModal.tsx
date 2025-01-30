import React from 'react'
import Modal from 'react-modal'
import { TConfirmModal, TFontProps } from '../../types'
import styles from './ConfirmModal.module.scss'

type TConfirmModalProps = TFontProps & {
  type: TConfirmModal
  onConfirm?: () => void
  message: string
  cancelFlag?: boolean
}

const ConfirmModal: React.FC<TConfirmModalProps> = ({
  fontState,
  fontDispatch,
  type,
  onConfirm = () => void 0,
  message,
  cancelFlag = true,
}) => {
  const { confirmModal } = fontState

  const onRequestClose = () =>
    fontDispatch({
      type: 'GLYPH_SET_ACTION',
      op: 'UPDATE_CONFIRM_MODAL',
      newConfirmModal: undefined,
    })

  return (
    <Modal
      className={styles.modal}
      overlayClassName={styles.overlay}
      isOpen={confirmModal === type}
    >
      <p>{message}</p>
      <button
        className={styles.button}
        onClick={() => {
          onConfirm()
          onRequestClose()
        }}
      >
        Confirm
      </button>
      {cancelFlag && (
        <button className={styles.button} onClick={onRequestClose}>
          Cancel
        </button>
      )}
    </Modal>
  )
}

export default ConfirmModal
