import React from 'react'
import { ChevronDown } from 'lucide-react'
import { useCashStore } from '../stores/cashStore'
import { useAuthStore } from '../stores/authStore'

const CashSelector: React.FC = () => {
  const { cashRegisters, selectedCashRegister, selectCashRegister } = useCashStore()
  const { hasHiddenAccess } = useAuthStore()

  const handleCashChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cashId = parseInt(event.target.value)
    const selectedCash = cashId ? cashRegisters.find(cash => cash.id === cashId) : null
    selectCashRegister(selectedCash || null)
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="cash-select" className="text-sm font-medium text-gray-700">
        Cassa:
      </label>
      <div className="relative">
        <select
          id="cash-select"
          value={selectedCashRegister?.id || ''}
          onChange={handleCashChange}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Seleziona cassa</option>
          {cashRegisters.map((cash) => (
            <option key={cash.id} value={cash.id}>
              {cash.name}
              {Boolean(cash.is_hidden) && (hasHiddenAccess ? ' 👁️' : ' 🔒')}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

export default CashSelector

