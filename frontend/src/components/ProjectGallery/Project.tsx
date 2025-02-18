import { TProjectMetadata } from '@/types/project'
import styles from './styles/Project.module.css'

type TProjectProps = {
  project: TProjectMetadata
  onClick: () => void
}

const daysSinceModified = (dateModified: Date) =>
  Math.floor((Date.now() - dateModified.getTime()) / (1000 * 60 * 60 * 24))

const Project: React.FC<TProjectProps> = ({ project, onClick }) => {
  const dateModified = new Date(project.dateModified)

  return (
    <div className={styles.container}>
      <div className={styles.pane} onClick={onClick}>
        {project.bitmapSize}×{project.bitmapSize}
      </div>
      <div className={styles.metadata}>
        <h2>{project.name}</h2>
        <p>Last edited {daysSinceModified(dateModified)} days ago</p>
      </div>
    </div>
  )
}

export default Project
