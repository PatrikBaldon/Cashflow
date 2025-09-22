import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { useCashStore } from '../stores/cashStore'
import { formatCurrency, formatDate, formatDateTime } from '../utils/format'

interface PaymentsTableProps {
  onEditPayment: (payment: any) => void
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({ onEditPayment }) => {
  const { payments, isLoading, deletePayment } = useCashStore()

  const handleDeletePayment = async (payment: any) => {
    if (window.confirm(`Sei sicuro di voler eliminare il pagamento di ${payment.customer_name}?`)) {
      await deletePayment(payment.id)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Caricamento pagamenti...</p>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="p-8 text-center">
        <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Nessun pagamento trovato</p>
        <p className="text-sm text-gray-400 mt-1">
          Aggiungi il primo pagamento per iniziare
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Importo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Causale
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Operatore
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creato
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Azioni
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {payment.customer_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(payment.payment_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(payment.amount)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                  {payment.reason}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {payment.operator_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {formatDateTime(payment.created_at)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEditPayment(payment)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Modifica pagamento"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePayment(payment)}
                    className="text-red-600 hover:text-red-900"
                    title="Elimina pagamento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PaymentsTable

