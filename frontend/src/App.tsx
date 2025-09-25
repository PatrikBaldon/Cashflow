import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import LoginScreen from './components/LoginScreen'
import MainScreen from './components/MainScreen'
import SetupScreen from './components/SetupScreen'
import { useAuthStore } from './stores/authStore'
import { useCashStore } from './stores/cashStore'

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const { loadCashRegisters } = useCashStore()
  const [isLoading, setIsLoading] = useState(true)
  const [setupCompleted, setSetupCompleted] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Prima verifica se il setup è completato
        const setupResult = await window.electronAPI.setup.isCompleted()
        setSetupCompleted(setupResult.isCompleted ?? false)
        
        if (setupResult.isCompleted) {
          await checkAuth()
          if (isAuthenticated) {
            await loadCashRegisters() // Carica solo le casse pubbliche
          }
        }
      } catch (error) {
        console.error('Errore inizializzazione app:', error)
      } finally {
        setCheckingSetup(false)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [checkAuth, isAuthenticated, loadCashRegisters])

  // Listener per aggiornamenti automatici delle statistiche totali
  useEffect(() => {
    const handleTotalStatisticsUpdate = (_event: any, data: { totalDaily: number; totalWeekly: number; totalMonthly: number }) => {
      console.log('Ricevuto aggiornamento statistiche totali:', data)
      const { updateTotalStatisticsFromEvent } = useCashStore.getState()
      updateTotalStatisticsFromEvent(data)
    }

    window.electronAPI.onTotalStatisticsUpdated(handleTotalStatisticsUpdate)

    return () => {
      window.electronAPI.removeTotalStatisticsListener(handleTotalStatisticsUpdate)
    }
  }, [])

  // Se stiamo ancora controllando il setup, mostra loading
  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Inizializzazione...</p>
        </div>
      </div>
    )
  }

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
      {!setupCompleted ? (
        <SetupScreen />
      ) : isAuthenticated ? (
        <MainScreen />
      ) : (
        <LoginScreen />
      )}
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

