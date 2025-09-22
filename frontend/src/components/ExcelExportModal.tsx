import React, { useState } from 'react'
import { X, Download, FileSpreadsheet } from 'lucide-react'
import { useCashStore } from '../stores/cashStore'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

interface ExcelExportModalProps {
  onClose: () => void
}

const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ onClose }) => {
  const { selectedCashRegister, cashRegisters } = useCashStore()
  const { hasHiddenAccess } = useAuthStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'single' | 'all'>('single')

  const handleExportSingle = async () => {
    if (!selectedCashRegister) {
      toast.error('Nessuna cassa selezionata')
      return
    }

    setIsExporting(true)
    try {
      const result = await window.electronAPI.excel.exportPayments({
        cashRegisterId: selectedCashRegister.id,
        includeHidden: false
      })

      if (result.success) {
        toast.success(`File Excel salvato: ${result.filePath}`)
        onClose()
      } else {
        toast.error(result.message || 'Errore durante l\'export')
      }
    } catch (error) {
      console.error('Errore export Excel:', error)
      toast.error('Errore durante l\'export Excel')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      const result = await window.electronAPI.excel.exportAllCash({
        includeHidden: hasHiddenAccess
      })

      if (result.success) {
        toast.success(`File Excel salvato: ${result.filePath}`)
        onClose()
      } else {
        toast.error(result.message || 'Errore durante l\'export')
      }
    } catch (error) {
      console.error('Errore export Excel:', error)
      toast.error('Errore durante l\'export Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileSpreadsheet className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Export Excel</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Tipo di Export</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="exportType"
                    value="single"
                    checked={exportType === 'single'}
                    onChange={(e) => setExportType(e.target.value as 'single' | 'all')}
                    className="mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Cassa Selezionata
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedCashRegister ? selectedCashRegister.name : 'Nessuna cassa selezionata'}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="exportType"
                    value="all"
                    checked={exportType === 'all'}
                    onChange={(e) => setExportType(e.target.value as 'single' | 'all')}
                    className="mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Tutte le Casse
                    </div>
                    <div className="text-xs text-gray-500">
                      {hasHiddenAccess 
                        ? `Tutte le casse (incluse nascoste) - ${cashRegisters.length} casse`
                        : `Solo casse pubbliche - ${cashRegisters.length} casse`
                      }
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex">
                <Download className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">File salvato in Downloads</p>
                  <p className="text-xs mt-1">
                    Il file Excel verrà salvato automaticamente nella cartella Downloads del tuo computer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-outline"
              disabled={isExporting}
            >
              Annulla
            </button>
            <button
              onClick={exportType === 'single' ? handleExportSingle : handleExportAll}
              disabled={isExporting || (exportType === 'single' && !selectedCashRegister)}
              className="btn btn-primary"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExcelExportModal
