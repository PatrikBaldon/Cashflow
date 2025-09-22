import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Plus, Edit2, Trash2, Shield, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

interface UserForm {
  name: string
  password: string
  isAdmin: boolean
}

interface User {
  id: number
  name: string
  is_admin: boolean
  created_at: string
  last_login?: string
}

interface UserManagementModalProps {
  onClose: () => void
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<UserForm>({
    defaultValues: {
      name: '',
      password: '',
      isAdmin: false
    }
  })

  // Solo admin può vedere questo modal
  if (!user?.isAdmin) {
    return null
  }

  const loadUsers = async () => {
    try {
      const result = await window.electronAPI.users.get()
      if (result.success) {
        setUsers(result.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento utenti:', error)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const onSubmit = async (data: UserForm) => {
    setIsLoading(true)
    try {
      if (editingUser) {
        // Aggiorna utente esistente
        const result = await window.electronAPI.users.update({
          userId: editingUser.id,
          updates: {
            name: data.name,
            password: data.password || undefined,
            is_admin: data.isAdmin
          }
        })
        
        if (result.success) {
          toast.success('Utente aggiornato con successo')
          setShowUserForm(false)
          setEditingUser(null)
          reset()
          loadUsers()
        } else {
          toast.error(result.message || 'Errore aggiornamento utente')
        }
      } else {
        // Crea nuovo utente
        const result = await window.electronAPI.users.create(data)
        
        if (result.success) {
          toast.success('Utente creato con successo')
          setShowUserForm(false)
          reset()
          loadUsers()
        } else {
          toast.error(result.message || 'Errore creazione utente')
        }
      }
    } catch (error) {
      console.error('Errore salvataggio utente:', error)
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setValue('name', user.name)
    setValue('password', '')
    setValue('isAdmin', user.is_admin)
    setShowUserForm(true)
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (userId === user?.id) {
      toast.error('Non puoi eliminare il tuo stesso account')
      return
    }

    if (window.confirm(`Sei sicuro di voler eliminare l'utente "${userName}"?`)) {
      try {
        const result = await window.electronAPI.users.delete({ userId })
        if (result.success) {
          toast.success('Utente eliminato con successo')
          loadUsers()
        } else {
          toast.error(result.message || 'Errore eliminazione utente')
        }
      } catch (error) {
        console.error('Errore eliminazione utente:', error)
        toast.error('Errore durante l\'eliminazione')
      }
    }
  }

  const handleNewUser = () => {
    setEditingUser(null)
    reset()
    setShowUserForm(true)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Gestione Utenti</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-md font-medium text-gray-900">Utenti Registrati</h4>
            <button
              onClick={handleNewUser}
              className="btn btn-primary btn-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Utente
            </button>
          </div>

          {/* Lista Utenti */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((userItem) => (
              <div
                key={userItem.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {Boolean(userItem.is_admin) ? (
                        <Shield className="h-5 w-5 text-blue-600 mr-2" />
                      ) : (
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900">{userItem.name}</h5>
                        <p className="text-sm text-gray-500">
                          {Boolean(userItem.is_admin) ? 'Amministratore' : 'Operatore'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Creato: {new Date(userItem.created_at).toLocaleDateString('it-IT')}
                    </span>
                    {userItem.id !== user?.id && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditUser(userItem)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifica utente"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Elimina utente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Utente */}
          {showUserForm && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="text-md font-medium text-gray-900 mb-4">
                {editingUser ? 'Modifica Utente' : 'Nuovo Utente'}
              </h5>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome Utente *
                  </label>
                  <input
                    {...register('name', { required: 'Nome utente richiesto' })}
                    type="text"
                    className="input mt-1"
                    placeholder="Inserisci nome utente"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password {editingUser ? '(lascia vuoto per non modificare)' : '*'}
                  </label>
                  <input
                    {...register('password', { 
                      required: !editingUser ? 'Password richiesta' : false,
                      minLength: editingUser ? undefined : { value: 6, message: 'Password deve essere di almeno 6 caratteri' }
                    })}
                    type="password"
                    className="input mt-1"
                    placeholder="Inserisci password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...register('isAdmin')}
                    type="checkbox"
                    id="isAdmin"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                    Amministratore (accesso completo e casse nascoste)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false)
                      setEditingUser(null)
                      reset()
                    }}
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
                    {isLoading ? 'Salvataggio...' : (editingUser ? 'Aggiorna' : 'Crea')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagementModal
