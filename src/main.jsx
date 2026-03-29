import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App' 
import './index.css'
import { DynamicIslandProvider } from './contexts/DynamicIslandContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DynamicIslandProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DynamicIslandProvider>
  </React.StrictMode>,
)
