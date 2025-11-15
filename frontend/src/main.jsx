import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Path from './router/router.jsx'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Path />
    </ThemeProvider>
  </React.StrictMode>,
)
