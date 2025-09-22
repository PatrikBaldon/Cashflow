import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Settings, Lock, Eye, EyeOff, Unlock } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCashStore } from '../stores/cashStore'
import toast from 'react-hot-toast'

interface SettingsForm {
  hiddenPassword: string
  newHiddenPassword: string
  confirmHiddenPassword: string
}

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, hasHiddenAccess, unlockHiddenCash, lockHiddenCash } = useAuthStore()
  const { loadCashRegisters } = useCashStore()
  const [settings, setSettings] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showHiddenSection, setShowHiddenSection] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<SettingsForm>({
    defaultValues: {
      hiddenPassword: '',
      newHiddenPassword: '',
      confirmHiddenPassword: ''
    }
  })

  const newPassword = watch('newHiddenPassword')
  // const confirmPassword = watch('confirmHiddenPassword')

  // Solo admin può vedere questo modal
  if (!user?.isAdmin) {
    return null
  }

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.settings.get()
      if (result.success) {
        setSettings(result.data)
        const hiddenPassword = result.data.find((s: any) => s.key === 'default_hidden_password')?.value || ''
        reset({
          hiddenPassword,
          newHiddenPassword: '',
          confirmHiddenPassword: ''
        })
      }
    } catch (error) {
      console.error('Errore caricamento impostazioni:', error)
    }
  }

  const handlePasswordSubmit = async () => {
    if (passwordInput.trim()) {
      const success = await unlockHiddenCash(passwordInput)
      if (success) {
        await loadCashRegisters(true)
        setShowPasswordPrompt(false)
        setPasswordInput('')
        toast.success('Casse riservate sbloccate')
      } else {
        toast.error('Password non corretta')
      }
    }
  }

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false)
    setPasswordInput('')
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true)
    try {
      // Verifica password attuale
      const currentPassword = settings.find(s => s.key === 'default_hidden_password')?.value || 'admin123'
      if (data.hiddenPassword !== currentPassword) {
        toast.error('Password attuale non corretta')
        return
      }

      // Verifica nuova password
      if (data.newHiddenPassword && data.newHiddenPassword !== data.confirmHiddenPassword) {
        toast.error('Le nuove password non coincidono')
        return
      }

      // Aggiorna password
      if (data.newHiddenPassword) {
        const result = await window.electronAPI.settings.update({
          key: 'default_hidden_password',
          value: data.newHiddenPassword
        })
        
        if (result.success) {
          toast.success('Password casse nascoste aggiornata con successo')
          loadSettings()
          reset({
            hiddenPassword: data.newHiddenPassword,
            newHiddenPassword: '',
            confirmHiddenPassword: ''
          })
        } else {
          toast.error(result.message || 'Errore aggiornamento password')
        }
      } else {
        toast('Nessuna modifica da salvare')
      }
    } catch (error) {
      console.error('Errore aggiornamento impostazioni:', error)
      toast.error('Errore durante l\'aggiornamento')
    } finally {
      setIsLoading(false)
    }
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

          {/* Controlli Casse Nascoste - Nascosti */}
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
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
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
                          toast.success('Casse riservate bloccate')
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
                <p className="text-xs text-gray-600">
                  Le casse riservate sono completamente invisibili agli operatori normali.
                  Solo gli amministratori possono accedervi con la password corretta.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Password Casse Riservate</h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="hiddenPassword" className="block text-sm font-medium text-gray-700">
                    Password Attuale *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('hiddenPassword', { required: 'Password attuale richiesta' })}
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Inserisci password attuale"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.hiddenPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.hiddenPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newHiddenPassword" className="block text-sm font-medium text-gray-700">
                    Nuova Password
                  </label>
                  <input
                    {...register('newHiddenPassword', {
                      minLength: { value: 6, message: 'Password deve essere di almeno 6 caratteri' }
                    })}
                    type="password"
                    className="input mt-1"
                    placeholder="Inserisci nuova password (opzionale)"
                  />
                  {errors.newHiddenPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newHiddenPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmHiddenPassword" className="block text-sm font-medium text-gray-700">
                    Conferma Nuova Password
                  </label>
                  <input
                    {...register('confirmHiddenPassword', {
                      validate: value => 
                        !newPassword || value === newPassword || 'Le password non coincidono'
                    })}
                    type="password"
                    className="input mt-1"
                    placeholder="Conferma nuova password"
                  />
                  {errors.confirmHiddenPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmHiddenPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Annulla
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Salvataggio...' : 'Salva Impostazioni'}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Informazioni</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• La password casse nascoste è necessaria per accedere alle casse riservate</li>
              <li>• Solo gli amministratori possono modificare queste impostazioni</li>
              <li>• La password di default è "admin123" (cambiala per sicurezza)</li>
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
    </div>
  )
}

export default SettingsModal
