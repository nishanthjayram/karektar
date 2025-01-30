import {
  IconDefinition,
  faCircle,
  faSquare,
} from '@fortawesome/free-regular-svg-icons'
import {
  faEraser,
  faFill,
  faGear,
  faPen,
  faShapes,
  faSlash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TTool } from '../../../types'
import { TToolName } from '../../../utils/reducers/editorReducer'
import { TPointerAction } from '../../../utils/reducers/pointerReducer'
import styles from './ToolBar.module.css'

type TToolInfo = { icon: IconDefinition; label: string }
type TToolRecord = Record<TTool, TToolInfo>

const toolRecord: TToolRecord = {
  pen: { icon: faPen, label: 'Pen' },
  eraser: { icon: faEraser, label: 'Eraser' },
  fill: { icon: faFill, label: 'Fill' },
  line: { icon: faSlash, label: 'Line' },
  rectangle: { icon: faSquare, label: 'Rectangle' },
  ellipse: { icon: faCircle, label: 'Ellipse' },
}

type TToolButtonProps = {
  tool: TToolName
  pointerDispatch: React.Dispatch<TPointerAction>
  active: boolean
}
const ToolButton: React.FC<TToolButtonProps> = ({
  tool,
  pointerDispatch,
  active,
}) =>
  tool in toolRecord ? (
    <FontAwesomeIcon
      className={`${styles.tool} ${active && styles.activeTool}`}
      icon={toolRecord[tool].icon}
      onClick={() => pointerDispatch({ type: 'setCurrentTool', tool: tool })}
    />
  ) : (
    <div />
  )

type TToolBarProps = {
  tools: TToolName[]
  currentTool: TToolName
  pointerDispatch: React.Dispatch<TPointerAction>
  displaySize: number
}
const ToolBar: React.FC<TToolBarProps> = ({
  tools,
  currentTool,
  pointerDispatch,
  displaySize,
}) => (
  <div className={styles.toolBar} style={{ width: displaySize }}>
    {tools.map(tool => (
      <ToolButton
        key={tool}
        tool={tool}
        pointerDispatch={pointerDispatch}
        active={currentTool === tool}
      />
    ))}
  </div>
)

export default ToolBar
