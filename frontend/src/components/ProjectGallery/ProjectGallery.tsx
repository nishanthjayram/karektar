import { useEditorStore } from '@/stores'
import { useProjectStore } from '@/stores/projectStore'
import Project from './Project'
import styles from './styles/ProjectGallery.module.css'

export const ProjectGallery = () => {
  const projects = useProjectStore(state => state.projects)
  const { openProject } = useEditorStore()

  return (
    <div className={styles.container}>
      <h1>Projects</h1>
      <div className={styles.gallery}>
        {Object.values(projects)
          .sort((a, b) => b.dateModified - a.dateModified)
          .map(project => (
            <Project
              key={project.id}
              project={project}
              onClick={() => openProject(project.id)}
            />
          ))}
      </div>
    </div>
  )
}

export default ProjectGallery
