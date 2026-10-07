import React from 'react'
import { Toaster as HotToaster } from 'react-hot-toast'

export const Toaster: React.FC = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1c1917',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.925rem',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(180, 83, 9, 0.08)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: 'hsl(35, 75%, 45%)',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(0, 84%, 45%)',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
