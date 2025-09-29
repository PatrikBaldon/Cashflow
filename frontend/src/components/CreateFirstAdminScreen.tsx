import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Lock, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateAdminForm {
  name: string
  password: string
  confirmPassword: string
}

interface CreateFirstAdminScreenProps {
  onSuccess: () => void
  onBack: () => void
}

export default function CreateFirstAdminScreen({ onSuccess, onBack }: CreateFirstAdminScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<CreateAdminForm>()

  const password = watch('password')

  const onSubmit = async (data: CreateAdminForm) => {
    setIsLoading(true)
    try {
      const result = await window.electronAPI.setup.createFirstAdmin({
        name: data.name,
        password: data.password
      })

      if (result.success) {
        toast.success('Amministratore creato con successo!')
        reset()
        onSuccess()
      } else {
        toast.error(result.message || 'Errore nella creazione dell\'amministratore')
      }
    } catch (error) {
      console.error('Errore creazione amministratore:', error)
      toast.error('Errore durante la creazione dell\'amministratore')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Crea Amministratore
          </h1>
          <p className="text-gray-600">
            Crea il primo account amministratore per accedere all'applicazione
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome utente */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome utente
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('name', {
                  required: 'Nome utente richiesto',
                  minLength: {
                    value: 3,
                    message: 'Nome utente deve essere di almeno 3 caratteri'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Nome utente non può superare i 50 caratteri'
                  }
                })}
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Inserisci nome utente"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password', {
                  required: 'Password richiesta',
                  minLength: {
                    value: 6,
                    message: 'Password deve essere di almeno 6 caratteri'
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Inserisci password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Conferma Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Conferma Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('confirmPassword', {
                  required: 'Conferma password richiesta',
                  validate: (value) =>
                    value === password || 'Le password non coincidono'
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Conferma password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Pulsanti */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creazione...' : 'Crea Amministratore'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Account Amministratore</p>
              <p>
                Questo account avrà accesso completo all'applicazione, inclusa la gestione degli utenti e delle impostazioni.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
