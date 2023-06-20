import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import classnames from 'classnames'
import styles from './Button.module.scss'
import {
  TActionLabel,
  TButtonType,
  TFont,
  TFontAction,
  TOptionLabel,
  TToolLabel,
} from '../../../types'
import {assertUnreachable, initializeGlyph} from '../../../utils'

type TButtonProps = TButtonType & {
  active?: boolean
  disabled?: boolean
  tooltipPlacement?: 'top' | 'right'
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}

const Button: React.FC<TButtonProps> = ({
  type,
  label,
  icon,
  active,
  disabled,
  tooltipPlacement = 'top',
  fontState,
  fontDispatch,
}) => {
  const {activeMenu, bitmapSize, captureFlag, guidelinesFlag, modelFlag} = fontState

  const handleToolClick = (tool: TToolLabel) => {
    if (activeMenu) {
      fontDispatch({
        type: 'CANVAS_ACTION',
        op: 'UPDATE_ACTIVE_MENU',
        newActiveMenu: undefined,
      })
    }

    switch (tool) {
      case 'DRAW':
      case 'ERASE':
      case 'FILL':
      case 'LINE':
      case 'RECTANGLE':
      case 'ELLIPSE': {
        return fontDispatch({
          type: 'CANVAS_ACTION',
          op: 'UPDATE_CURRENT_TOOL',
          newCurrentTool: tool,
        })
      }
      default: {
        return assertUnreachable(tool)
      }
    }
  }

  const handleActionClick = (action: TActionLabel) => {
    switch (action) {
      case 'CLEAR': {
        const newGlyphCanvas = initializeGlyph(bitmapSize)
        fontDispatch({
          type: 'GLYPH_SET_ACTION',
          op: 'UPDATE_GLYPH_CANVAS',
          newGlyphCanvas: newGlyphCanvas,
        })
        return fontDispatch({
          type: 'CANVAS_ACTION',
          op: 'UPDATE_CANVAS_HISTORY',
          newGlyphCanvas: newGlyphCanvas,
        })
      }
      case 'UNDO':
      case 'REDO': {
        return fontDispatch({type: 'CANVAS_ACTION', op: action})
      }
      default: {
        return assertUnreachable(action)
      }
    }
  }

  const handleOptionClick = (option: TOptionLabel) => {
    switch (option) {
      case 'GUIDELINES': {
        console.log(guidelinesFlag)
        return fontDispatch({
          type: 'CANVAS_ACTION',
          op: 'UPDATE_GUIDELINES_FLAG',
          newGuidelinesFlag: !guidelinesFlag,
        })
      }
      case 'MODEL': {
        return fontDispatch({
          type: 'CANVAS_ACTION',
          op: 'UPDATE_MODEL_FLAG',
          newModelFlag: !modelFlag,
        })
      }
      default: {
        return assertUnreachable(option)
      }
    }
  }

  return (
    <Tippy content={label} placement={tooltipPlacement} hideOnClick={false}>
      <FontAwesomeIcon
        icon={icon}
        className={classnames(
          active && styles.activeIcon,
          disabled && styles.disabledIcon,
          type === 'option' && styles.optionIcon,
          type !== 'option' && styles.icon,
        )}
        onClick={() => {
          if (captureFlag) {
            return
          }
          switch (type) {
            case 'tool': {
              return handleToolClick(label)
            }
            case 'action': {
              return handleActionClick(label)
            }
            case 'option': {
              return handleOptionClick(label)
            }
            default: {
              return assertUnreachable(type)
            }
          }
        }}
      />
    </Tippy>
  )
}

export default Button
