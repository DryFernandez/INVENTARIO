import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Path from './router/router.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <Path />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
