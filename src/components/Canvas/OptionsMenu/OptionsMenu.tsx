import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import classnames from 'classnames'
import {TFont, TFontAction, TMenuHeader, TOption} from '../../../types'
import Button from '../Button/Button'
import styles from '../Canvas.module.scss'

type TOptionsMenuProps = TMenuHeader & {
  options: TOption[]
  fontState: TFont
  fontDispatch: React.Dispatch<TFontAction>
}

const OptionsMenu: React.FC<TOptionsMenuProps> = ({
  defaultLabel,
  defaultIcon,
  options,
  fontState,
  fontDispatch,
}) => {
  const {activeMenu, screenFlag} = fontState
  const toggleMenu = () =>
    fontDispatch({
      type: 'CANVAS_ACTION',
      op: 'UPDATE_ACTIVE_MENU',
      newActiveMenu: activeMenu === defaultLabel ? undefined : defaultLabel,
    })

  const handleKeyDown = (evt: React.KeyboardEvent<SVGSVGElement>) => {
    if (evt.key !== 'Enter' && evt.key !== ' ') {
      return
    }

    evt.preventDefault()
    toggleMenu()
  }

  const menu = (
    <div>
      <FontAwesomeIcon
        icon={defaultIcon}
        role="button"
        tabIndex={0}
        aria-label={defaultLabel}
        data-testid="menu-options"
        className={classnames(
          activeMenu === defaultLabel && styles.activeIcon,
          styles.icon,
        )}
        onPointerUp={toggleMenu}
        onKeyDown={handleKeyDown}
      />
      <div
        className={classnames(
          activeMenu !== defaultLabel && styles.menu,
          activeMenu === defaultLabel && styles.menuOpen,
        )}
      >
        {options.map((props, index) => (
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
    <Tippy placement="top" content={defaultLabel} hideOnClick={false}>
      {menu}
    </Tippy>
  )
}

export default OptionsMenu
