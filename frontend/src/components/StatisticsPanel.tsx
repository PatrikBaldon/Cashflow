import React from 'react'
import { TrendingUp, Calendar, Clock } from 'lucide-react'
import { useCashStore } from '../stores/cashStore'
import { formatCurrency } from '../utils/format'

const StatisticsPanel: React.FC = () => {
  const { statistics, selectedCashRegister } = useCashStore()

  if (!selectedCashRegister) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiche</h3>
        <p className="text-gray-500 text-sm">Seleziona una cassa per visualizzare le statistiche</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiche</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">Oggi</p>
                <p className="text-xs text-blue-600">Incasso giornaliero</p>
              </div>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {formatCurrency(statistics.daily)}
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">Questa Settimana</p>
                <p className="text-xs text-green-600">Incasso settimanale</p>
              </div>
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(statistics.weekly)}
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-900">Questo Mese</p>
                <p className="text-xs text-purple-600">Incasso mensile</p>
              </div>
            </div>
            <p className="text-lg font-bold text-purple-900">
              {formatCurrency(statistics.monthly)}
            </p>
          </div>
        </div>
      </div>

      {/* Cash Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Cassa Selezionata</h4>
        <p className="text-sm text-gray-600">{selectedCashRegister.name}</p>
        {selectedCashRegister.description && (
          <p className="text-xs text-gray-500 mt-1">{selectedCashRegister.description}</p>
        )}
        {Boolean(selectedCashRegister.is_hidden) && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
            🔒 Cassa Nascosta
          </span>
        )}
      </div>
    </div>
  )
}

export default StatisticsPanel

