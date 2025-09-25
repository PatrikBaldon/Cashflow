import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Building2, Mail, Hash, Lock, Key, AlertCircle, CheckCircle } from 'lucide-react'

interface HiddenResetForm {
  vatNumber: string
  securityCode: string
  currentPassword: string
  newHiddenPassword: string
  confirmHiddenPassword: string
}

interface HiddenPasswordResetModalProps {
  onClose: () => void
}

const HiddenPasswordResetModal: React.FC<HiddenPasswordResetModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'credentials' | 'password'>('credentials')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<HiddenResetForm>()

  const newHiddenPassword = watch('newHiddenPassword')

  const onCredentialsSubmit = async (data: HiddenResetForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Determina se è P.IVA o email
      const isEmail = data.vatNumber.includes('@')
      
      const result = await window.electronAPI.auth.requestHiddenPasswordReset({
        vatNumber: isEmail ? '' : data.vatNumber,
        email: isEmail ? data.vatNumber : '',
        securityCode: data.securityCode,
        currentPassword: data.currentPassword
      })
      
      if (result.success) {
        setToken(result.token ?? '')
        setStep('password')
      } else {
        setError(result.message || 'Errore durante la richiesta di reset')
      }
    } catch (error) {
      console.error('Errore reset password casse nascoste:', error)
      setError('Errore durante la richiesta di reset')
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: HiddenResetForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await window.electronAPI.auth.resetHiddenPassword({
        token,
        newPassword: data.newHiddenPassword
      })
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.message || 'Errore durante il reset della password')
      }
    } catch (error) {
      console.error('Errore reset password casse nascoste:', error)
      setError('Errore durante il reset della password')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 text-center">
            <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Password Aggiornata!</h3>
            <p className="text-sm text-gray-600 mb-6">
              La password per le casse nascoste è stata aggiornata con successo
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Key className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">
              {step === 'credentials' ? 'Reset Password Casse Nascoste' : 'Nuova Password Casse Nascoste'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            {step === 'credentials' 
              ? 'Inserisci le credenziali aziendali e la tua password amministratore attuale per richiedere il reset'
              : 'Inserisci la nuova password per le casse nascoste'
            }
          </p>

          <form 
            className="space-y-4" 
            onSubmit={handleSubmit(step === 'credentials' ? onCredentialsSubmit : onPasswordSubmit)}
          >
            {step === 'credentials' ? (
              <>
                {/* P.IVA o Email */}
                <div>
                  <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">
                    P.IVA o Email Aziendale
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {watch('vatNumber')?.includes('@') ? (
                        <Mail className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Building2 className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      {...register('vatNumber', { 
                        required: 'P.IVA o email richiesta',
                        validate: value => {
                          const isEmail = value.includes('@')
                          if (isEmail) {
                            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Email non valida'
                          } else {
                            return /^[0-9]{11}$/.test(value) || 'P.IVA deve essere di 11 cifre'
                          }
                        }
                      })}
                      type="text"
                      className="input pl-10"
                      placeholder="12345678901 o azienda@example.com"
                    />
                  </div>
                  {errors.vatNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.vatNumber.message}</p>
                  )}
                </div>

                {/* Security Code */}
                <div>
                  <label htmlFor="securityCode" className="block text-sm font-medium text-gray-700">
                    Codice di Sicurezza
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('securityCode', { 
                        required: 'Codice di sicurezza richiesto',
                        pattern: {
                          value: /^[A-Z0-9]{8}$/,
                          message: 'Codice deve essere di 8 caratteri alfanumerici'
                        }
                      })}
                      type="text"
                      className="input pl-10"
                      placeholder="ABC12345"
                      maxLength={8}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.securityCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.securityCode.message}</p>
                  )}
                </div>

                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Password Amministratore Attuale
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('currentPassword', { 
                        required: 'Password amministratore richiesta',
                        minLength: { value: 6, message: 'Password deve essere di almeno 6 caratteri' }
                      })}
                      type="password"
                      className="input pl-10"
                      placeholder="Inserisci la tua password amministratore attuale"
                    />
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* New Hidden Password */}
                <div>
                  <label htmlFor="newHiddenPassword" className="block text-sm font-medium text-gray-700">
                    Nuova Password Casse Nascoste
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('newHiddenPassword', { 
                        required: 'Password richiesta',
                        minLength: { value: 6, message: 'Password deve essere di almeno 6 caratteri' }
                      })}
                      type="password"
                      className="input pl-10"
                      placeholder="Inserisci la nuova password per le casse nascoste"
                    />
                  </div>
                  {errors.newHiddenPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newHiddenPassword.message}</p>
                  )}
                </div>

                {/* Confirm Hidden Password */}
                <div>
                  <label htmlFor="confirmHiddenPassword" className="block text-sm font-medium text-gray-700">
                    Conferma Password Casse Nascoste
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmHiddenPassword', { 
                        required: 'Conferma password richiesta',
                        validate: value => value === newHiddenPassword || 'Le password non coincidono'
                      })}
                      type="password"
                      className="input pl-10"
                      placeholder="Conferma la nuova password per le casse nascoste"
                    />
                  </div>
                  {errors.confirmHiddenPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmHiddenPassword.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              {step === 'password' && (
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="btn btn-outline"
                >
                  Indietro
                </button>
              )}
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
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Elaborazione...' : (step === 'credentials' ? 'Richiedi Reset' : 'Aggiorna Password')}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Informazioni</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Puoi usare P.IVA (11 cifre) o email aziendale</li>
              <li>• Il codice di sicurezza è fornito durante il setup iniziale</li>
              <li>• Inserisci la password dell'utente amministratore attualmente loggato</li>
              <li>• Il token di reset è valido per 1 ora</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HiddenPasswordResetModal
