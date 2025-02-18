import { TTool } from '@/types/common'
import { useEditorStore } from '@/stores'
import { tools } from '../../constants/tools'
import styles from './styles/ToolBar.module.css'

export const ToolBar = () => {
  const { tool: currentTool, setTool } = useEditorStore()

  return (
    <div className={styles.toolbar}>
      {Object.entries(tools).map(([toolId, tool]) => (
        <button
          key={toolId}
          className={`${styles.toolButton} ${
            currentTool === toolId ? styles.active : ''
          }`}
          onClick={() => setTool(toolId as TTool)}
          title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
        >
          <tool.icon className={styles.icon} />
        </button>
      ))}
    </div>
  )
}

export default ToolBar
