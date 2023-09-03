import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import classnames from 'classnames'
import {TFont, TFontAction, TMenuHeader, TTool} from '../../../types'
import Button from '../Button/Button'
import styles from '../Canvas.module.scss'

type TToolsMenu = TMenuHeader & {
  tools: TTool[]
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}

const ToolsMenu: React.FC<TToolsMenu> = ({
  defaultLabel,
  defaultIcon,
  tools,
  fontState,
  fontDispatch,
}) => {
  const {activeMenu, currentTool, screenFlag} = fontState

  const tool = tools.find(t => currentTool === t.label)
  const label = tool ? tool.label : defaultLabel
  const icon = tool ? tool.icon : defaultIcon

  const menu = (
    <div>
      <FontAwesomeIcon
        icon={icon}
        className={classnames(
          (activeMenu === defaultLabel || currentTool === label) &&
            styles.activeIcon,
          styles.icon,
        )}
        onPointerUp={() =>
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
        {tools.map((props, index) => (
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
  )

  return screenFlag ? (
    menu
  ) : (
    <Tippy placement="top" content={label} hideOnClick={false}>
      {menu}
    </Tippy>
  )
}

export default ToolsMenu
