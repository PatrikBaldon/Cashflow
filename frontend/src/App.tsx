import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import LoginScreen from './components/LoginScreen'
import MainScreen from './components/MainScreen'
import SetupScreen from './components/SetupScreen'
import CreateFirstAdminScreen from './components/CreateFirstAdminScreen'
import { useAuthStore } from './stores/authStore'
import { useCashStore } from './stores/cashStore'

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const { loadCashRegisters } = useCashStore()
  const [isLoading, setIsLoading] = useState(true)
  const [setupCompleted, setSetupCompleted] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Prima verifica se il setup è completato
        const setupResult = await window.electronAPI.setup.isCompleted()
        setSetupCompleted(setupResult.isCompleted ?? false)
        
        if (setupResult.isCompleted) {
          // Verifica se ci sono operatori (se no, mostra creazione admin)
          const operatorsResult = await window.electronAPI.setup.hasOperators()
          console.log('Setup completed, operators result:', operatorsResult)
          if (operatorsResult.success && !operatorsResult.hasOperators) {
            console.log('No operators found, showing create admin screen')
            setShowCreateAdmin(true)
          } else {
            console.log('Operators found or error, proceeding to auth check')
            await checkAuth()
            // Non caricare le casse qui, verrà fatto dopo il login
          }
        } else {
          console.log('Setup not completed, showing setup screen')
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

  console.log('Rendering App - setupCompleted:', setupCompleted, 'showCreateAdmin:', showCreateAdmin, 'isAuthenticated:', isAuthenticated)

  return (
    <div className="min-h-screen bg-gray-50">
      {!setupCompleted ? (
        <SetupScreen />
      ) : showCreateAdmin ? (
        <CreateFirstAdminScreen 
          onSuccess={() => {
            setShowCreateAdmin(false)
            checkAuth()
          }}
          onBack={() => {
            setShowCreateAdmin(false)
            setSetupCompleted(false)
          }}
        />
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

