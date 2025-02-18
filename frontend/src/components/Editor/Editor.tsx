import { CircleX } from 'lucide-react'
import { useEditorStore } from '@/stores'
import GlyphBrowser from '../GlyphBrowser/GlyphBrowser'
import { Canvas } from './Canvas'
import ToolBar from './ToolBar'
import styles from './styles/Editor.module.css'

const Editor = () => {
  return (
    <div className={styles.container}>
      <div className={styles.canvasPane}>
        <ToolBar />
        <Canvas />
      </div>
      <div className={styles.glyphPane}>
        <GlyphBrowser />
      </div>
      <XButton />
    </div>
  )
}

const XButton = () => {
  const { closeProject } = useEditorStore()

  return (
    <div className={styles.xButton}>
      <CircleX size={24} onClick={closeProject} />
    </div>
  )
}

export default Editor
