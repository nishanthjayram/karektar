import classnames from 'classnames'
import {Dispatch, SetStateAction, useState} from 'react'
import styles from './Cell.module.scss'

const Cell = ({
  bitmapSize,
  filled,
  toggleCell,
  mouseDownFlag,
  setMouseDownFlag,
  drawFlag,
  setDrawFlag,
}: {
  bitmapSize: number
  filled: boolean
  toggleCell: () => void
  mouseDownFlag: boolean
  setMouseDownFlag: Dispatch<SetStateAction<boolean>>
  drawFlag: boolean
  setDrawFlag: Dispatch<SetStateAction<boolean>>
}) => {
  const [alreadyToggledFlag, setAlreadyToggledFlag] = useState(false)

  if (!mouseDownFlag && alreadyToggledFlag) {
    setAlreadyToggledFlag(false)
  }

  const updateCell = () => {
    toggleCell()
    setAlreadyToggledFlag(true)
  }
  return (
    <div
      className={classnames(
        !filled && styles.empty,
        filled && styles.filled,
        styles.cell,
      )}
      style={{
        width: `${400 / bitmapSize}px`,
        height: `${400 / bitmapSize}px`,
      }}
      onMouseDown={e => {
        if (e.button !== 0) {
          return
        }
        setMouseDownFlag(true)
        setDrawFlag(!filled)
        updateCell()
      }}
      onMouseUp={() => {
        setMouseDownFlag(false)
        setDrawFlag(true)
      }}
      onMouseMove={() => {
        if (mouseDownFlag && drawFlag !== filled && !alreadyToggledFlag) {
          updateCell()
        }
      }}
    />
  )
}

export default Cell
