import React, { useState, useEffect } from 'react'
import { LogOut, Plus, Settings, Users, Shield, FileSpreadsheet } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCashStore } from '../stores/cashStore'
import toast from 'react-hot-toast'
import CashSelector from './CashSelector'
import StatisticsPanel from './StatisticsPanel'
import PaymentsTable from './PaymentsTable'
import PaymentModal from './PaymentModal'
import CashManagementModal from './CashManagementModal'
import UserManagementModal from './UserManagementModal'
import SettingsModal from './SettingsModal'
import ExcelExportModal from './ExcelExportModal'

const MainScreen: React.FC = () => {
  const { user, logout, hasHiddenAccess, lockHiddenCash } = useAuthStore()
  const { selectedCashRegister, loadCashRegisters } = useCashStore()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCashManagement, setShowCashManagement] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showExcelExport, setShowExcelExport] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)

  // Ricarica le casse quando cambia l'accesso alle casse nascoste
  useEffect(() => {
    loadCashRegisters(hasHiddenAccess)
  }, [hasHiddenAccess, loadCashRegisters])

  const handleLogout = async () => {
    await logout()
  }

  const handleNewPayment = () => {
    if (!selectedCashRegister) {
      toast.error('Seleziona una cassa prima di aggiungere un pagamento')
      return
    }
    setEditingPayment(null)
    setShowPaymentModal(true)
  }

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment)
    setShowPaymentModal(true)
  }

  // const handleLockHiddenCash = async () => {
  //   await lockHiddenCash()
  //   await loadCashRegisters()
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Registro Contanti
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                Future Dance School
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cash Selector */}
              <CashSelector />

              {/* Admin Controls - Solo per admin */}
              {Boolean(user?.isAdmin) && (
                <>
                  {/* User Management */}
                  <button
                    onClick={() => setShowUserManagement(true)}
                    className="btn btn-outline btn-sm"
                    title="Gestione utenti"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Utenti
                  </button>

                  {/* Settings - Include controlli casse nascoste nascosti */}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="btn btn-outline btn-sm"
                    title="Impostazioni avanzate"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Impostazioni
                  </button>
                </>
              )}

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    {user?.name}
                  </span>
                  {Boolean(user?.isAdmin) && (
                    <Shield className="h-4 w-4 text-blue-600 ml-2" />
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Statistics Panel */}
          <div className="lg:col-span-1">
            <StatisticsPanel />
          </div>

          {/* Payments Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Pagamenti
                    {selectedCashRegister && (
                      <span className="ml-2 text-sm text-gray-500">
                        - {selectedCashRegister.name}
                      </span>
                    )}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowCashManagement(true)}
                      className="btn btn-outline btn-sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Gestisci Casse
                    </button>
                    <button
                      onClick={() => setShowExcelExport(true)}
                      className="btn btn-outline btn-sm"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </button>
                    <button
                      onClick={handleNewPayment}
                      className="btn btn-primary btn-sm"
                      disabled={!selectedCashRegister}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuovo Pagamento
                    </button>
                  </div>
                </div>
              </div>

              {/* Payments Table */}
              <PaymentsTable onEditPayment={handleEditPayment} />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          payment={editingPayment}
          onClose={() => {
            setShowPaymentModal(false)
            setEditingPayment(null)
          }}
        />
      )}

      {showCashManagement && (
        <CashManagementModal
          onClose={() => setShowCashManagement(false)}
        />
      )}


      {showUserManagement && (
        <UserManagementModal
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}

      {showExcelExport && (
        <ExcelExportModal
          onClose={() => setShowExcelExport(false)}
        />
      )}
    </div>
  )
}

export default MainScreen

