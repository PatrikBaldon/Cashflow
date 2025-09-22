import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import LoginScreen from './components/LoginScreen'
import MainScreen from './components/MainScreen'
import { useAuthStore } from './stores/authStore'
import { useCashStore } from './stores/cashStore'

function App() {
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const { loadCashRegisters } = useCashStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuth()
        if (isAuthenticated) {
          await loadCashRegisters()
        }
      } catch (error) {
        console.error('Errore inizializzazione app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [checkAuth, isAuthenticated, loadCashRegisters])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? <MainScreen /> : <LoginScreen />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App

