// App.tsx
import { BITMAP_SIZES, TBitmapSize } from '@common/types'
import { useState } from 'react'
import styles from './App.module.css'
import LoginWindow from './components/login/LoginWindow/LoginWindow'
import { useLoginInfo } from './hooks/useLoginInfo'
import { useProjectStore } from './stores/projectStore'

const App = () => {
  const loginInfo = useLoginInfo()
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedSize, setSelectedSize] = useState<TBitmapSize>(BITMAP_SIZES[0])

  const { projects, createProject, deleteProject } = useProjectStore()

  if (loginInfo.isLoginRoute || !loginInfo.user) {
    return <LoginWindow loginInfo={loginInfo} />
  }

  return (
    <div className={styles.container}>
      {/* Header with user info */}
      <div className={styles.header}>
        <span>Welcome {loginInfo.user.name}</span>
        <button className={styles.button} onClick={loginInfo.handleLogout}>
          Logout
        </button>
      </div>

      {/* Project creation form */}
      <div className={styles.form}>
        <input
          type="text"
          value={newProjectName}
          onChange={e => setNewProjectName(e.target.value)}
          placeholder="New project name"
          className={styles.input}
        />
        <select
          value={selectedSize}
          onChange={e => setSelectedSize(parseInt(e.target.value) as TBitmapSize)}
          className={styles.select}
        >
          {BITMAP_SIZES.map(size => (
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
      </div>

      {/* Projects list */}
      <div className={styles.projectList}>
        <h2>Your Projects</h2>
        {Object.entries(projects).length === 0 ? (
          <p>No projects yet. Create one to get started!</p>
        ) : (
          <div className={styles.projectGrid}>
            {Object.values(projects).map(project => (
              <div key={project.id} className={styles.projectCard}>
                <h3>{project.name}</h3>
                <div className={styles.projectInfo}>
                  <p>
                    Size: {project.bitmapSize}x{project.bitmapSize}
                  </p>
                  <p>
                    Created: {new Date(project.dateCreated).toLocaleDateString()}
                  </p>
                  <p>
                    Modified: {new Date(project.dateModified).toLocaleDateString()}
                  </p>
                  <p>
                    Glyphs: {project.fontMap && Object.keys(project.fontMap).length}
                  </p>
                </div>
                <div className={styles.projectActions}>
                  <button
                    className={styles.button}
                    onClick={() => {
                      // TODO: Implement edit project
                      console.log('Edit project:', project.id)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.button} ${styles.deleteButton}`}
                    onClick={() => deleteProject(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
