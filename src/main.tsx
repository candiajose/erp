import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#222222',
            boxShadow: '0 4px 12px rgba(34, 34, 34, 0.08)',
            borderRadius: '8px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)