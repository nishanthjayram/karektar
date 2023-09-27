import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App/App'
import './fonts/ChicagoFLF.ttf'
import './index.scss'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App bitmapSize={16} />
  </React.StrictMode>,
)
