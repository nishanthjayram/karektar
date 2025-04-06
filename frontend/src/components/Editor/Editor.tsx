import Window, { TWindowConfig } from '@/components/ui/Window/Window'
import { useEditorStore, useProjectStore } from '@/stores'
import GlyphBrowser from '../GlyphBrowser/GlyphBrowser'
import { Canvas } from './Canvas'
import ToolBar from './ToolBar'
import styles from './styles/Editor.module.css'

const Editor = () => {
  const { activeProjectId, closeProject } = useEditorStore()
  const { saveProject } = useProjectStore()

  return (
    <>
      <Window
        config={{
          header: {
            label: 'Editor',
            onClose: () => {
              console.log('Closing Editor')
              if (confirm('Are you sure you want to close the editor?')) {
                if (activeProjectId) {
                  saveProject(activeProjectId)
                }
                closeProject()
              }
            },
          },
        }}
      >
        <div className={styles.container}>
          <div className={styles.canvasPane}>
            <ToolBar />
            <Canvas />
          </div>
          <div className={styles.glyphPane}>
            <GlyphBrowser />
          </div>
        </div>
      </Window>
    </>
  )
}

export default Editor
