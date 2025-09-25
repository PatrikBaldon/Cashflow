import React, { useState } from 'react'
import { X, Settings, Lock, Unlock, Key, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCashStore } from '../stores/cashStore'
import HiddenPasswordResetModal from './HiddenPasswordResetModal'

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, hasHiddenAccess, unlockHiddenCash, lockHiddenCash } = useAuthStore()
  const { loadCashRegisters } = useCashStore()
  const [showHiddenSection, setShowHiddenSection] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showHiddenPasswordReset, setShowHiddenPasswordReset] = useState(false)


  const handlePasswordSubmit = async () => {
    if (passwordInput.trim()) {
      const success = await unlockHiddenCash(passwordInput)
      if (success) {
        // Ricarica le casse con quelle nascoste incluse
        await loadCashRegisters(true)
        setShowPasswordPrompt(false)
        setPasswordInput('')
      }
    }
  }

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false)
    setPasswordInput('')
  }



  // Solo admin può vedere questo modal
  if (!user?.isAdmin) {
    return null
  }



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Impostazioni Avanzate</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <Settings className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Impostazioni Amministratore
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Configurazione avanzata per la gestione dell'applicazione.
                </p>
              </div>
            </div>
          </div>

          {/* Controlli Casse Nascoste */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">Controlli Avanzati</h4>
              <button
                type="button"
                onClick={() => setShowHiddenSection(!showHiddenSection)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {showHiddenSection ? 'Nascondi' : 'Mostra'} controlli riservati
              </button>
            </div>
            
            {showHiddenSection && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                {/* Controllo Casse Riservate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Casse Riservate</span>
                  </div>
                  <div className="flex space-x-2">
                    {hasHiddenAccess ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await lockHiddenCash()
                          await loadCashRegisters(false)
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Blocca
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPasswordPrompt(true)}
                        className="btn btn-outline btn-sm"
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Sblocca
                      </button>
                    )}
                  </div>
                </div>

                {/* Reset Password Casse Nascoste */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-gray-600 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Reset Password Casse Nascoste</span>
                      <p className="text-xs text-gray-600">Richiedi reset password per le casse riservate</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHiddenPasswordReset(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset Password
                  </button>
                </div>

                <p className="text-xs text-gray-600">
                  Le casse riservate sono completamente invisibili agli operatori normali.
                  Solo gli amministratori possono accedervi con la password corretta.
                </p>
              </div>
            )}
          </div>


          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Informazioni</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• La password casse nascoste è impostata durante il setup iniziale</li>
              <li>• Solo gli amministratori possono modificare la password delle casse nascoste</li>
              <li>• Gli operatori possono resettare la propria password dal login</li>
              <li>• Le modifiche sono immediate e non richiedono riavvio</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sblocca Casse Riservate</h3>
              <button
                onClick={handlePasswordCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password Casse Riservate
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="input w-full"
                  placeholder="Inserisci la password"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit()
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handlePasswordCancel}
                  className="btn btn-outline"
                >
                  Annulla
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="btn btn-primary"
                  disabled={!passwordInput.trim()}
                >
                  Sblocca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Password Reset Modal */}
      {showHiddenPasswordReset && (
        <HiddenPasswordResetModal onClose={() => setShowHiddenPasswordReset(false)} />
      )}

    </div>
  )
}

export default SettingsModal
