import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChangeAdminForm {
  newName: string
  newPassword: string
  confirmPassword: string
}

interface ChangeAdminPasswordModalProps {
  onSuccess: () => void
}

const ChangeAdminPasswordModal: React.FC<ChangeAdminPasswordModalProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<ChangeAdminForm>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: ChangeAdminForm) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await window.electronAPI.auth.changeDefaultAdmin({
        newName: data.newName,
        newPassword: data.newPassword
      })
      
      if (result.success) {
        toast.success('Amministratore creato con successo!')
        reset()
        onSuccess()
      } else {
        setError(result.message || 'Errore durante la creazione dell\'amministratore')
      }
    } catch (error) {
      console.error('Errore cambio password admin:', error)
      setError('Errore durante la creazione dell\'amministratore')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Crea Nuovo Amministratore
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            L'account admin predefinito deve essere sostituito per sicurezza
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Attenzione:</p>
              <p>L'account admin predefinito sarà disabilitato dopo questa operazione.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* New Name */}
          <div>
            <label htmlFor="newName" className="block text-sm font-medium text-gray-700">
              Nome Nuovo Amministratore
            </label>
            <input
              {...register('newName', { 
                required: 'Nome richiesto',
                minLength: { value: 2, message: 'Nome troppo corto' }
              })}
              type="text"
              className="input mt-1"
              placeholder="Inserisci il nome del nuovo amministratore"
            />
            {errors.newName && (
              <p className="mt-1 text-sm text-red-600">{errors.newName.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nuova Password
            </label>
            <input
              {...register('newPassword', { 
                required: 'Password richiesta',
                minLength: { value: 6, message: 'Password deve essere di almeno 6 caratteri' }
              })}
              type="password"
              className="input mt-1"
              placeholder="Inserisci la nuova password"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Conferma Password
            </label>
            <input
              {...register('confirmPassword', { 
                required: 'Conferma password richiesta',
                validate: value => value === newPassword || 'Le password non coincidono'
              })}
              type="password"
              className="input mt-1"
              placeholder="Conferma la nuova password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? 'Creazione...' : 'Crea Amministratore'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Questa operazione può essere eseguita solo una volta</p>
        </div>
      </div>
    </div>
  )
}

export default ChangeAdminPasswordModal
