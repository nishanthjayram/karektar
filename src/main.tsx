import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import './fonts/ChicagoFLF.ttf'
import './index.module.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
