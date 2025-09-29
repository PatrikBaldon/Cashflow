import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCashStore } from '../stores/cashStore'
import PasswordResetScreen from './PasswordResetScreen'
import ChangeAdminPasswordModal from './ChangeAdminPasswordModal'
import toast from 'react-hot-toast'

interface LoginForm {
  name: string
  password: string
}

const LoginScreen: React.FC = () => {
  const { login } = useAuthStore()
  const { loadCashRegisters } = useCashStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showChangeAdminPassword, setShowChangeAdminPassword] = useState(false)

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm<LoginForm>()

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const result = await login(data)
      if (result.success) {
        await loadCashRegisters(false) // Carica solo le casse pubbliche
        resetLogin()
      } else if (result.requiresPasswordChange) {
        // Mostra il modal per il cambio password dell'admin predefinito
        setShowChangeAdminPassword(true)
      } else {
        toast.error(result.message || 'Credenziali non valide')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (showPasswordReset) {
    return <PasswordResetScreen onBack={() => setShowPasswordReset(false)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Registro Contanti</h2>
          <p className="mt-2 text-sm text-gray-600">Future Dance School</p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Operatore
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerLogin('name', { required: 'Nome operatore richiesto' })}
                  type="text"
                  className="input pl-10"
                  placeholder="Inserisci il tuo nome"
                />
              </div>
              {loginErrors.name && (
                <p className="mt-1 text-sm text-red-600">{loginErrors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerLogin('password', { required: 'Password richiesta' })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Inserisci la password"
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
              {loginErrors.password && (
                <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {isLoading ? 'Accesso...' : 'Accedi'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="btn btn-outline w-full flex items-center justify-center"
              >
                <Shield className="h-4 w-4 mr-2" />
                Reset Password
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Applicazione desktop per la gestione dei pagamenti</p>
          <p className="mt-1">Tutti i dati sono memorizzati localmente</p>
        </div>
      </div>
      
      {/* Change Admin Password Modal */}
      {showChangeAdminPassword && (
        <ChangeAdminPasswordModal
          onSuccess={() => {
            setShowChangeAdminPassword(false)
            // Ricarica la pagina per rifare il login con le nuove credenziali
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default LoginScreen

