import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import classnames from 'classnames'
import {TFont, TFontAction, TMenuHeader, TTool} from '../../../types'
import Button from '../Button/Button'
import styles from '../Canvas.module.scss'

type TShapesMenuProps = TMenuHeader & {
  shapeTools: TTool[]
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}

const ShapesMenu: React.FC<TShapesMenuProps> = ({
  defaultLabel,
  defaultIcon,
  shapeTools,
  fontState,
  fontDispatch,
}) => {
  const {activeMenu, currentTool} = fontState

  const shapeTool = shapeTools.find(tool => currentTool === tool.label)
  const label = shapeTool ? shapeTool.label : defaultLabel
  const icon = shapeTool ? shapeTool.icon : defaultIcon

  return (
    <Tippy placement="top" content={label} hideOnClick={false}>
      <div>
        <FontAwesomeIcon
          icon={icon}
          className={classnames(
            (activeMenu === defaultLabel || currentTool === label) &&
              styles.activeIcon,
            styles.icon,
          )}
          onClick={() =>
            fontDispatch({
              type: 'CANVAS_ACTION',
              op: 'UPDATE_ACTIVE_MENU',
              newActiveMenu: activeMenu === defaultLabel ? undefined : defaultLabel,
            })
          }
        />
        <div
          className={classnames(
            activeMenu !== defaultLabel && styles.menu,
            activeMenu === defaultLabel && styles.menuOpen,
          )}
        >
          {shapeTools.map((props, index) => (
            <Button
              key={index}
              {...props}
              tooltipPlacement="right"
              fontState={fontState}
              fontDispatch={fontDispatch}
            />
          ))}
        </div>
      </div>
    </Tippy>
  )
}

export default ShapesMenu
