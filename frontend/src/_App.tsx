import { useEffect, useState } from 'react'
import { TWindowConfig } from '@/components/ui/Window/Window'
import { useProjectStore } from '@/stores/projectStore'
import styles from './App.module.css'
import Login from './Login'
import LoginWindow from './components/login/LoginWindow/LoginWindow'
import Window from './components/ui/Window/Window'
import { useEditorStore } from './stores/editorStore'
import { seedTestProjects } from './tests'

{loginInfo.user ? (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 10px',
      gap: '10px',
      flexFlow: 'column nowrap',
    }}
  >
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexFlow: 'row nowrap',
      }}
    >
      Welcome {loginInfo.user.name}
      <button onClick={loginInfo.handleLogout}>Logout</button>
    </div>
    <div>{draft ? `Current draft: ${draft}` : 'Draft not loaded'}</div>
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexFlow: 'row nowrap',
      }}
    >
      <button
        onClick={async () => {
          const newDraft = `Draft saved at ${new Date().toLocaleTimeString()}`
          await saveDraft(newDraft)
          getDraft().then(d => {
            setDraft(d)
          })
        }}
        style={{
          width: 'auto',
        }}
      >
        Save draft
      </button>
      <button
        style={{
          width: 'auto',
        }}
        onClick={() => {
          getDraft().then(d => setDraft(d))
        }}
      >
        Load draft
      </button>
    </div>
  </div>
) 
const App = () => {
  // const [isSignedIn, setIsSignedIn] = useState(true)
  // const activeProjectId = useEditorStore(state => state.activeProjectId)
  // const projects = useProjectStore(state => state.projects)
  // const activeProject = activeProjectId ? projects[activeProjectId] : null

  // Run seeds once on mount and when editor state changes
  // useEffect(() => {
  //   console.log('Seeding test projects...')
  //   seedTestProjects()
  // }, [])

  // useEffect(() => {
  //   console.log('Seeding editor from active project...')
  //   seedTestEditor()
  // }, [activeProjectId])

  return (
    <div className={styles.appContainer}>
      <div className={styles.login}>
        {/* <button onClick={() => setIsSignedIn(!isSignedIn)}>
          {isSignedIn ? 'Sign out' : 'Sign in'}
        </button> */}
      </div>
      {/* <div className={styles.appContent}>
        {isSignedIn ? activeProjectId ? <Editor /> : <ProjectGallery /> : <div />}
      </div> */}
      <div className={styles.appContent}>
        <LoginWindow />
      </div>
      {/* <SubtleAtkinsonText /> */}
      {/* <RetroDitheredBackground /> */}
      {/* <AnimatedDitheredBackground /> */}
    </div>
  )
}

export default App
