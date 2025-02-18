import { useProjectStore } from '@/stores/projectStore'
import GlyphBrowser from '../GlyphBrowser/GlyphBrowser'
import styles from './styles/FontPreview.module.css'

type FontPreviewProps = {
  projectId: string
}

const FontPreview: React.FC<FontPreviewProps> = ({ projectId }) => {
  const project = useProjectStore(state => state.projects[projectId])
  if (!project || !project.fontMap) return <div>No font data available</div>

  return (
    <div className={styles.container}>
      <h3>{project.name} - Font Preview</h3>
      <GlyphBrowser fontMap={project.fontMap} />
    </div>
  )
}

export default FontPreview
