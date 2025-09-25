import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, Mail, Hash, Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface SetupForm {
  companyName: string
  vatNumber: string
  email: string
  hiddenCashPassword: string
  confirmHiddenCashPassword: string
}

const SetupScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [securityCode, setSecurityCode] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<SetupForm>()

  const hiddenCashPassword = watch('hiddenCashPassword')

  const onSubmit = async (data: SetupForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await window.electronAPI.setup.createCompany({
        companyName: data.companyName,
        vatNumber: data.vatNumber,
        email: data.email,
        hiddenCashPassword: data.hiddenCashPassword
      })
      
      if (result.success) {
        setSecurityCode(result.securityCode ?? '')
        setSetupComplete(true)
        reset()
      } else {
        setError(result.message || 'Errore durante la configurazione')
      }
    } catch (error) {
      console.error('Errore setup:', error)
      setError('Errore durante la configurazione')
    } finally {
      setIsLoading(false)
    }
  }

  const copySecurityCode = () => {
    navigator.clipboard.writeText(securityCode)
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Configurazione Completata!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Il profilo aziendale è stato creato con successo
            </p>
          </div>

          {/* Security Code Card */}
          <div className="bg-white py-8 px-6 shadow-xl rounded-lg border-2 border-green-200">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Shield className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Codice di Sicurezza</h3>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>IMPORTANTE:</strong> Salva questo codice in un posto sicuro!
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Ti servirà per il reset delle password degli utenti.
                </p>
                
                <div className="bg-white p-3 rounded border">
                  <code className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {securityCode}
                  </code>
                </div>
                
                <button
                  onClick={copySecurityCode}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copia Codice
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold">Attenzione:</p>
                    <p>Questo codice non verrà mostrato di nuovo. Assicurati di salvarlo in un posto sicuro!</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Continua all'Applicazione
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Configurazione Iniziale</h2>
          <p className="mt-2 text-sm text-gray-600">
            Registro Contanti - Future Dance School
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Configura il profilo aziendale per iniziare
          </p>
        </div>

        {/* Setup Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Nome Azienda
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('companyName', { 
                    required: 'Nome azienda richiesto',
                    minLength: { value: 2, message: 'Nome troppo corto' }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Inserisci il nome dell'azienda"
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            {/* VAT Number */}
            <div>
              <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">
                Partita IVA
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('vatNumber', { 
                    required: 'Partita IVA richiesta',
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: 'P.IVA deve essere di 11 cifre'
                    }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="12345678901"
                  maxLength={11}
                />
              </div>
              {errors.vatNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.vatNumber.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Inserisci la Partita IVA senza spazi o trattini
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Aziendale
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email richiesta',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email non valida'
                    }
                  })}
                  type="email"
                  className="input pl-10"
                  placeholder="azienda@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Hidden Cash Password */}
            <div>
              <label htmlFor="hiddenCashPassword" className="block text-sm font-medium text-gray-700">
                Password Casse Nascoste
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('hiddenCashPassword', { 
                    required: 'Password casse nascoste richiesta',
                    minLength: { value: 6, message: 'Password deve essere di almeno 6 caratteri' }
                  })}
                  type="password"
                  className="input pl-10"
                  placeholder="Inserisci password per casse nascoste"
                />
              </div>
              {errors.hiddenCashPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.hiddenCashPassword.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password per accedere alle casse riservate/nascoste
              </p>
            </div>

            {/* Confirm Hidden Cash Password */}
            <div>
              <label htmlFor="confirmHiddenCashPassword" className="block text-sm font-medium text-gray-700">
                Conferma Password Casse Nascoste
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmHiddenCashPassword', { 
                    required: 'Conferma password richiesta',
                    validate: value => value === hiddenCashPassword || 'Le password non coincidono'
                  })}
                  type="password"
                  className="input pl-10"
                  placeholder="Conferma password per casse nascoste"
                />
              </div>
              {errors.confirmHiddenCashPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmHiddenCashPassword.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {isLoading ? 'Configurazione...' : 'Configura Azienda'}
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Questa configurazione viene eseguita solo una volta</p>
          <p className="mt-1">Tutti i dati sono memorizzati localmente</p>
        </div>
      </div>
    </div>
  )
}

export default SetupScreen
