import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Building2, Mail, Hash, User, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface ResetForm {
  vatNumber: string
  securityCode: string
  operatorName: string
  newPassword: string
  confirmPassword: string
}

const PasswordResetScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<'credentials' | 'password'>('credentials')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const [operatorName, setOperatorName] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ResetForm>()

  const newPassword = watch('newPassword')

  const onCredentialsSubmit = async (data: ResetForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Determina se è P.IVA o email
      const isEmail = data.vatNumber.includes('@')
      
      const result = await window.electronAPI.auth.requestPasswordReset({
        vatNumber: isEmail ? '' : data.vatNumber,
        email: isEmail ? data.vatNumber : '',
        securityCode: data.securityCode,
        operatorName: data.operatorName
      })
      
      if (result.success) {
        setToken(result.token ?? '')
        setOperatorName(data.operatorName)
        setStep('password')
      } else {
        setError(result.message || 'Errore durante la richiesta di reset')
      }
    } catch (error) {
      console.error('Errore reset password:', error)
      setError('Errore durante la richiesta di reset')
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: ResetForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await window.electronAPI.auth.resetPassword({
        token,
        newPassword: data.newPassword
      })
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.message || 'Errore durante il reset della password')
      }
    } catch (error) {
      console.error('Errore reset password:', error)
      setError('Errore durante il reset della password')
    } finally {
      setIsLoading(false)
    }
  }


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Password Aggiornata!</h2>
            <p className="mt-2 text-sm text-gray-600">
              La password per l'operatore <strong>{operatorName}</strong> è stata aggiornata con successo
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Torna al Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 'credentials' ? 'Reset Password' : 'Nuova Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'credentials' 
              ? 'Inserisci le credenziali aziendali e il nome operatore'
              : 'Inserisci la nuova password'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form 
            className="space-y-6" 
            onSubmit={handleSubmit(step === 'credentials' ? onCredentialsSubmit : onPasswordSubmit)}
          >
            {step === 'credentials' ? (
              <>
                {/* VAT Number or Email */}
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

                {/* Operator Name */}
                <div>
                  <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700">
                    Nome Operatore
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('operatorName', { 
                        required: 'Nome operatore richiesto',
                        minLength: { value: 2, message: 'Nome troppo corto' }
                      })}
                      type="text"
                      className="input pl-10"
                      placeholder="Inserisci il nome operatore"
                    />
                  </div>
                  {errors.operatorName && (
                    <p className="mt-1 text-sm text-red-600">{errors.operatorName.message}</p>
                  )}
                </div>

              </>
            ) : (
              <>
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nuova Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('newPassword', { 
                        required: 'Password richiesta',
                        minLength: { value: 6, message: 'Password deve essere di almeno 6 caratteri' }
                      })}
                      type="password"
                      className="input pl-10"
                      placeholder="Inserisci la nuova password"
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Conferma Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPassword', { 
                        required: 'Conferma password richiesta',
                        validate: value => value === newPassword || 'Le password non coincidono'
                      })}
                      type="password"
                      className="input pl-10"
                      placeholder="Conferma la nuova password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {isLoading ? 'Elaborazione...' : (step === 'credentials' ? 'Verifica Credenziali' : 'Aggiorna Password')}
              </button>

              {step === 'password' && (
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="btn btn-secondary w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna Indietro
                </button>
              )}

              <button
                type="button"
                onClick={onBack}
                className="btn btn-outline w-full"
              >
                Torna al Login
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Contatta l'amministratore per ottenere il codice di sicurezza</p>
        </div>
      </div>
    </div>
  )
}

export default PasswordResetScreen
