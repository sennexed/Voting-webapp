import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '0',
            border: '2px solid #09090B',
            fontFamily: '"IBM Plex Mono", monospace',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
