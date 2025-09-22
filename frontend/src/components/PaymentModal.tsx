import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCashStore } from '../stores/cashStore'
import { useAuthStore } from '../stores/authStore'
import { getTodayString } from '../utils/format'
import toast from 'react-hot-toast'

interface PaymentForm {
  customer_name: string
  payment_date: string
  amount: number
  reason: string
}

interface PaymentModalProps {
  payment?: any
  onClose: () => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({ payment, onClose }) => {
  const { selectedCashRegister, createPayment, updatePayment } = useCashStore()
  const { user } = useAuthStore()
  const isEditing = !!payment

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<PaymentForm>({
    defaultValues: {
      customer_name: '',
      payment_date: getTodayString(),
      amount: 0,
      reason: ''
    }
  })

  useEffect(() => {
    if (payment) {
      setValue('customer_name', payment.customer_name)
      setValue('payment_date', payment.payment_date)
      setValue('amount', payment.amount)
      setValue('reason', payment.reason)
    }
  }, [payment, setValue])

  const onSubmit = async (data: PaymentForm) => {
    console.log('PaymentModal onSubmit - selectedCashRegister:', selectedCashRegister)
    console.log('PaymentModal onSubmit - user:', user)
    
    if (!selectedCashRegister) {
      toast.error('Nessuna cassa selezionata')
      return
    }

    if (!user?.id) {
      toast.error('Utente non autenticato')
      return
    }

    try {
      if (isEditing) {
        await updatePayment(payment.id, data)
      } else {
        console.log('Creating payment with cash_register_id:', selectedCashRegister.id)
        await createPayment({
          cash_register_id: selectedCashRegister.id,
          ...data
        }, user.id)
      }
      onClose()
    } catch (error) {
      console.error('Errore salvataggio pagamento:', error)
      toast.error('Errore durante il salvataggio del pagamento')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Modifica Pagamento' : 'Nuovo Pagamento'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
              Nome e Cognome *
            </label>
            <input
              {...register('customer_name', { required: 'Nome cliente richiesto' })}
              type="text"
              className="input mt-1"
              placeholder="Inserisci nome e cognome"
            />
            {errors.customer_name && (
              <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
              Data Pagamento *
            </label>
            <input
              {...register('payment_date', { required: 'Data pagamento richiesta' })}
              type="date"
              className="input mt-1"
            />
            {errors.payment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Importo (€) *
            </label>
            <input
              {...register('amount', { 
                required: 'Importo richiesto',
                min: { value: 0.01, message: 'Importo deve essere maggiore di 0' }
              })}
              type="number"
              step="0.01"
              min="0.01"
              className="input mt-1"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Causale *
            </label>
            <textarea
              {...register('reason', { required: 'Causale richiesta' })}
              rows={3}
              className="input mt-1"
              placeholder="Inserisci la causale del pagamento"
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvataggio...' : (isEditing ? 'Aggiorna' : 'Salva')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal

