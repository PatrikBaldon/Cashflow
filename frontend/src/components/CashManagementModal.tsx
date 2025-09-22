import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Plus, Lock, Edit, Trash2 } from 'lucide-react'
import { useCashStore } from '../stores/cashStore'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

interface CashForm {
  name: string
  description: string
  is_hidden: boolean
  hidden_password: string
}

interface CashManagementModalProps {
  onClose: () => void
}

const CashManagementModal: React.FC<CashManagementModalProps> = ({ onClose }) => {
  const { cashRegisters, createCashRegister, loadCashRegisters } = useCashStore()
  const { hasHiddenAccess, user } = useAuthStore()
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingCash, setEditingCash] = useState<any>(null)
  const [deletingCash] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<CashForm>({
    defaultValues: {
      name: '',
      description: '',
      is_hidden: false,
      hidden_password: ''
    }
  })

  const isHidden = watch('is_hidden')

  // Reload cash registers when modal opens or when hidden access changes
  useEffect(() => {
    loadCashRegisters(hasHiddenAccess)
  }, [hasHiddenAccess, loadCashRegisters])

  const onSubmit = async (data: CashForm) => {
    try {
      if (editingCash) {
        // Modifica cassa esistente
        const result = await window.electronAPI.cash.updateRegister(editingCash.id, {
          name: data.name,
          description: data.description,
          is_hidden: data.is_hidden,
          hidden_password: data.is_hidden ? data.hidden_password : null
        })
        
        if (result.success) {
          toast.success('Cassa aggiornata con successo')
          await loadCashRegisters(hasHiddenAccess)
          setEditingCash(null)
          reset()
        } else {
          toast.error(result.message || 'Errore durante l\'aggiornamento')
        }
      } else {
        // Crea nuova cassa
        await createCashRegister({
          name: data.name,
          description: data.description,
          is_hidden: data.is_hidden,
          hidden_password: data.is_hidden ? data.hidden_password : null,
          createdBy: user?.id || 1
        })
        setShowNewForm(false)
        reset()
      }
    } catch (error) {
      console.error('Errore operazione cassa:', error)
      toast.error('Errore durante l\'operazione')
    }
  }

  const handleEdit = (cash: any) => {
    setEditingCash(cash)
    reset({
      name: cash.name,
      description: cash.description || '',
      is_hidden: cash.is_hidden === 1,
      hidden_password: ''
    })
  }

  const handleDelete = async (cash: any) => {
    if (window.confirm(`Sei sicuro di voler eliminare la cassa "${cash.name}"? Questa azione eliminerà anche tutti i pagamenti associati e non può essere annullata.`)) {
      try {
        const result = await window.electronAPI.cash.deleteRegister(cash.id)
        
        if (result.success) {
          toast.success('Cassa eliminata con successo')
          await loadCashRegisters(hasHiddenAccess)
        } else {
          toast.error(result.message || 'Errore durante l\'eliminazione')
        }
      } catch (error) {
        console.error('Errore eliminazione cassa:', error)
        toast.error('Errore durante l\'eliminazione')
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingCash(null)
    reset()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Gestione Casse</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Existing Cashes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Casse Esistenti</h4>
                <button
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Cassa
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cashRegisters.map((cash) => (
                  <div
                    key={cash.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h5 className="font-medium text-gray-900">{cash.name}</h5>
                        {Boolean(cash.is_hidden) && (
                          <Lock className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {Boolean(cash.is_hidden) && !hasHiddenAccess && (
                          <span className="text-xs text-gray-500">🔒 Nascosta</span>
                        )}
                        {Boolean(cash.is_hidden) && hasHiddenAccess && (
                          <span className="text-xs text-green-600">👁️ Visibile</span>
                        )}
                        
                        {/* Pulsanti di azione */}
                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={() => handleEdit(cash)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="Modifica cassa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cash)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                            title="Elimina cassa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {cash.description && (
                      <p className="text-sm text-gray-600 mt-1">{cash.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Creata: {new Date(cash.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* New/Edit Cash Form */}
            {(showNewForm || editingCash) && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  {editingCash ? 'Modifica Cassa' : 'Nuova Cassa'}
                </h4>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome Cassa *
                    </label>
                    <input
                      {...register('name', { required: 'Nome cassa richiesto' })}
                      type="text"
                      className="input mt-1"
                      placeholder="Es. Cassa Principale"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrizione
                    </label>
                    <textarea
                      {...register('description')}
                      rows={2}
                      className="input mt-1"
                      placeholder="Descrizione opzionale della cassa"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('is_hidden')}
                      type="checkbox"
                      id="is_hidden"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="is_hidden" className="ml-2 block text-sm text-gray-900">
                      Cassa nascosta
                    </label>
                  </div>

                  {isHidden && (
                    <div>
                      <label htmlFor="hidden_password" className="block text-sm font-medium text-gray-700">
                        Password per Cassa Nascosta *
                      </label>
                      <input
                        {...register('hidden_password', {
                          required: isHidden ? 'Password richiesta per casse nascoste' : false
                        })}
                        type="password"
                        className="input mt-1"
                        placeholder="Password per accedere alla cassa"
                      />
                      {errors.hidden_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.hidden_password.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Questa password sarà necessaria per accedere alla cassa nascosta
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingCash) {
                          handleCancelEdit()
                        } else {
                          setShowNewForm(false)
                          reset()
                        }
                      }}
                      className="btn btn-outline"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting 
                        ? (editingCash ? 'Aggiornamento...' : 'Creazione...') 
                        : (editingCash ? 'Aggiorna Cassa' : 'Crea Cassa')
                      }
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashManagementModal

