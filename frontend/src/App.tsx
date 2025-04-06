// App.tsx
import LoadingScreen from '@components/ui/LoadingScreen/LoadingScreen'
import React from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { useLoginInfo } from '@/hooks/useLoginInfo'
import AuthCallback from '@/components/AuthCallback/AuthCallback'
import Editor from '@/components/Editor/Editor'
import ProjectGallery from '@/components/ProjectDashboard/ProjectGallery'
import LoginWindow from '@/components/login/LoginWindow/LoginWindow'
import DropdownBar from '@/components/ui/DropdownBar/DropdownBar'
import Modal from '@/components/ui/Modal/Modal'
import { useEditorStore } from '@/stores'
import { useUIStore } from '@/stores/uiStore'
import styles from './App.module.css'
import Background from './components/ui/Background/Background'
import { DROPDOWN_BAR_CONFIG } from './constants/dropdown'
import { MODALS_CONFIG } from './constants/modal'

const App = () => {
  const loginInfo = useLoginInfo()
  const { isOpen } = useEditorStore()
  const { activeModal } = useUIStore()

  if (loginInfo.loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <Background />
      <div className={styles.appContainer}>
        {loginInfo.user && <DropdownBar dropdowns={DROPDOWN_BAR_CONFIG} />}
        <Routes>
          <Route path="/api/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<LoginWindow loginInfo={loginInfo} />} />
          <Route
            path="/"
            element={
              isOpen ? (
                <Editor />
              ) : loginInfo.user ? (
                <div className={styles.container}>
                  <ProjectGallery handleLogout={loginInfo.handleLogout} />
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {activeModal && <Modal config={MODALS_CONFIG[activeModal]} />}
      </div>
    </>
  )
}

export default App
