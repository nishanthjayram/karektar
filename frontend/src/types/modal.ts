export interface ModalProps {
  onClose: () => void
}
export type TModalType = 'newProject' | null
export type ModalComponent = React.FC<ModalProps>
