import { TBitmapSize } from '@common/types'
import { useEffect, useState } from 'react'
import { DROPDOWN_BAR_CONFIG } from '@/constants/dropdown'
import { useEditorStore } from '@/stores'
import { useProjectStore } from '@/stores/projectStore'
import DropdownBar from '../ui/DropdownBar/DropdownBar'
import Window from '../ui/Window/Window'
import { TWindowConfig } from '../ui/Window/Window'
import Project from './Project'
import styles from './styles/ProjectGallery.module.css'

type ProjectGalleryProps = {
  handleLogout: () => void
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ handleLogout }) => {
  console.log('Rendering ProjectDashboard')
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedSize, setSelectedSize] = useState<TBitmapSize>(32) // Default size
  const { projects, createProject, deleteProject, loadProjects } = useProjectStore()
  const { openProject } = useEditorStore()

  // Load projects on mount
  useEffect(() => {
    console.log('Loading projects...')
    loadProjects()
  }, [loadProjects])

  return (
    <>
      <Window
        config={{
          header: {
            label: 'Projects',
            onClose: () => {
              console.log('Closing Project Gallery')
              if (confirm('Are you sure you want to logout?')) {
                handleLogout()
              }
            },
          },
        }}
      >
        {
          <>
            <div className={styles.container}>
              {/* Project Creation */}
              {/* <div className={styles.form}>
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="New project name"
                className={styles.input}
              />
              <select
                value={selectedSize}
                onChange={e =>
                  setSelectedSize(parseInt(e.target.value) as TBitmapSize)
                }
                className={styles.select}
              >
                {[16, 32, 64].map(size => (
                  <option key={size} value={size}>
                    {size}x{size}
                  </option>
                ))}
              </select>
              <button
                className={styles.button}
                onClick={() => {
                  if (newProjectName.trim()) {
                    createProject(newProjectName, selectedSize)
                    setNewProjectName('')
                  }
                }}
              >
                Create Project
              </button>
            </div> */}

              {/* Project List */}

              <div className={styles.projectGrid}>
                {Object.values(projects).map(project => (
                  <Project
                    key={project.id}
                    project={project}
                    onClick={() => {
                      openProject(project.id)
                    }}
                  />
                  // <div key={project.id} className={styles.projectCard}>
                  //   <h3>{project.name}</h3>
                  //   <p>
                  //     Size: {project.bitmapSize}x{project.bitmapSize}
                  //   </p>
                  //   <p>
                  //     Created: {new Date(project.dateCreated).toLocaleDateString()}
                  //   </p>
                  //   <p>
                  //     Modified:{' '}
                  //     {new Date(project.dateModified).toLocaleDateString()}
                  //   </p>
                  //   <button
                  //     className={styles.button}
                  //     onClick={() => console.log('Edit project:', project.id)}
                  //   >
                  //     Edit
                  //   </button>
                  //   <button
                  //     className={`${styles.button} ${styles.deleteButton}`}
                  //     onClick={() => deleteProject(project.id)}
                  //   >
                  //     Delete
                  //   </button>
                  // </div>
                ))}
              </div>
            </div>{' '}
          </>
        }
      </Window>
    </>
  )
}

export default ProjectGallery
