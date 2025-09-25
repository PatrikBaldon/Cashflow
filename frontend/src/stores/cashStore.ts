import { create } from 'zustand'
import toast from 'react-hot-toast'

interface CashRegister {
  id: number
  name: string
  is_hidden: boolean
  description?: string
  hidden_password?: string
  created_at: string
}

interface Payment {
  id: number
  cash_register_id: number
  customer_name: string
  payment_date: string
  amount: number
  reason: string
  operator_name: string
  created_at: string
  updated_at: string
}

interface Statistics {
  daily: number
  weekly: number
  monthly: number
  totalDaily: number
  totalWeekly: number
  totalMonthly: number
}

interface CashState {
  cashRegisters: CashRegister[]
  selectedCashRegister: CashRegister | null
  payments: Payment[]
  statistics: Statistics
  isLoading: boolean
  
  // Actions
  loadCashRegisters: (includeHidden?: boolean) => Promise<void>
  selectCashRegister: (register: CashRegister | null) => void
  loadPayments: (cashRegisterId: number) => Promise<void>
  loadStatistics: (cashRegisterId: number) => Promise<void>
  loadTotalStatistics: () => Promise<void>
  updateTotalStatisticsFromEvent: (data: { totalDaily: number; totalWeekly: number; totalMonthly: number }) => void
  createPayment: (payment: Omit<Payment, 'id' | 'operator_name' | 'created_at' | 'updated_at'>, operatorId: number) => Promise<boolean>
  updatePayment: (id: number, updates: Partial<Payment>) => Promise<boolean>
  deletePayment: (id: number) => Promise<boolean>
  createCashRegister: (register: Omit<CashRegister, 'id' | 'created_at'>) => Promise<boolean>
}

export const useCashStore = create<CashState>((set, get) => ({
  cashRegisters: [],
  selectedCashRegister: null,
  payments: [],
  statistics: { daily: 0, weekly: 0, monthly: 0, totalDaily: 0, totalWeekly: 0, totalMonthly: 0 },
  isLoading: false,

  loadCashRegisters: async (includeHidden = false) => {
    set({ isLoading: true })
    try {
      console.log('Loading cash registers with includeHidden:', includeHidden)
      const result = await window.electronAPI.cash.getRegisters({
        includeHidden
      })
      
      console.log('Cash registers API result:', result)
      
      if (result.success && result.data) {
        set({ cashRegisters: result.data })
        console.log('Cash registers loaded:', result.data.length, 'registers:', result.data)
        if (result.data.length > 0) {
          const { selectedCashRegister } = get()
          console.log('Current selected cash register:', selectedCashRegister)
          if (!selectedCashRegister) {
            console.log('Auto-selecting first cash register:', result.data[0])
            set({ selectedCashRegister: result.data[0] })
            // Carica anche i pagamenti e le statistiche per la cassa selezionata
            get().loadPayments(result.data[0].id)
            get().loadStatistics(result.data[0].id)
            get().loadTotalStatistics()
          } else {
            // Se c'è già una cassa selezionata, verifica che esista ancora
            const selectedStillExists = result.data.find(cash => cash.id === selectedCashRegister.id)
            if (!selectedStillExists) {
              console.log('Selected cash register no longer exists, selecting first available')
              set({ selectedCashRegister: result.data[0] })
              get().loadPayments(result.data[0].id)
              get().loadStatistics(result.data[0].id)
            }
          }
        }
      } else {
        console.error('Error loading cash registers:', result.message)
        toast.error(result.message || 'Errore caricamento casse')
      }
    } catch (error) {
      console.error('Errore caricamento casse:', error)
      toast.error('Errore durante il caricamento delle casse')
    } finally {
      set({ isLoading: false })
    }
  },

  selectCashRegister: (register) => {
    set({ selectedCashRegister: register })
    if (register) {
      get().loadPayments(register.id)
      get().loadStatistics(register.id)
      get().loadTotalStatistics()
    } else {
      set({ payments: [], statistics: { daily: 0, weekly: 0, monthly: 0, totalDaily: 0, totalWeekly: 0, totalMonthly: 0 } })
    }
  },

  loadPayments: async (cashRegisterId) => {
    set({ isLoading: true })
    try {
      const result = await window.electronAPI.payments.get({ cashRegisterId })
      
      if (result.success && result.data) {
        set({ payments: result.data })
      } else {
        toast.error(result.message || 'Errore caricamento pagamenti')
      }
    } catch (error) {
      console.error('Errore caricamento pagamenti:', error)
      toast.error('Errore durante il caricamento dei pagamenti')
    } finally {
      set({ isLoading: false })
    }
  },

  loadStatistics: async (cashRegisterId) => {
    try {
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        window.electronAPI.stats.daily({ cashRegisterId }),
        window.electronAPI.stats.weekly({ cashRegisterId }),
        window.electronAPI.stats.monthly({ cashRegisterId })
      ])

      if (dailyResult.success && weeklyResult.success && monthlyResult.success) {
        const { statistics } = get()
        set({
          statistics: {
            ...statistics,
            daily: dailyResult.data?.total || 0,
            weekly: weeklyResult.data?.total || 0,
            monthly: monthlyResult.data?.total || 0
          }
        })
      }
    } catch (error) {
      console.error('Errore caricamento statistiche:', error)
    }
  },

  loadTotalStatistics: async () => {
    try {
      console.log('Caricamento statistiche totali...')
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        window.electronAPI.stats.totalDaily(),
        window.electronAPI.stats.totalWeekly(),
        window.electronAPI.stats.totalMonthly()
      ])

      console.log('Risultati statistiche totali:', { dailyResult, weeklyResult, monthlyResult })

      if (dailyResult.success && weeklyResult.success && monthlyResult.success) {
        const { statistics } = get()
        const newStats = {
          ...statistics,
          totalDaily: dailyResult.data?.total || 0,
          totalWeekly: weeklyResult.data?.total || 0,
          totalMonthly: monthlyResult.data?.total || 0
        }
        console.log('Aggiornamento statistiche con totali:', newStats)
        set({ statistics: newStats })
      } else {
        console.error('Errore nelle statistiche totali:', { dailyResult, weeklyResult, monthlyResult })
      }
    } catch (error) {
      console.error('Errore caricamento statistiche totali:', error)
    }
  },

  // Metodo per aggiornare le statistiche totali quando riceve un evento
  updateTotalStatisticsFromEvent: (data: { totalDaily: number; totalWeekly: number; totalMonthly: number }) => {
    const { statistics } = get()
    const newStats = {
      ...statistics,
      totalDaily: data.totalDaily,
      totalWeekly: data.totalWeekly,
      totalMonthly: data.totalMonthly
    }
    console.log('Aggiornamento statistiche totali da evento:', newStats)
    set({ statistics: newStats })
  },

  createPayment: async (payment: Omit<Payment, 'id' | 'operator_name' | 'created_at' | 'updated_at'>, operatorId: number) => {
    try {
      if (!operatorId) {
        toast.error('ID operatore mancante')
        return false
      }

      const result = await window.electronAPI.payments.create({
        ...payment,
        operatorId: operatorId
      })

      if (result.success) {
        toast.success('Pagamento creato con successo')
        const { selectedCashRegister } = get()
        if (selectedCashRegister) {
          get().loadPayments(selectedCashRegister.id)
          get().loadStatistics(selectedCashRegister.id)
        }
        return true
      } else {
        toast.error(result.message || 'Errore creazione pagamento')
        return false
      }
    } catch (error) {
      console.error('Errore creazione pagamento:', error)
      toast.error('Errore durante la creazione del pagamento')
      return false
    }
  },

  updatePayment: async (id, updates) => {
    try {
      const result = await window.electronAPI.payments.update(id, updates)

      if (result.success) {
        toast.success('Pagamento aggiornato con successo')
        const { selectedCashRegister } = get()
        if (selectedCashRegister) {
          get().loadPayments(selectedCashRegister.id)
          get().loadStatistics(selectedCashRegister.id)
        }
        return true
      } else {
        toast.error(result.message || 'Errore aggiornamento pagamento')
        return false
      }
    } catch (error) {
      console.error('Errore aggiornamento pagamento:', error)
      toast.error('Errore durante l\'aggiornamento del pagamento')
      return false
    }
  },

  deletePayment: async (id) => {
    try {
      const result = await window.electronAPI.payments.delete(id)

      if (result.success) {
        toast.success('Pagamento eliminato con successo')
        const { selectedCashRegister } = get()
        if (selectedCashRegister) {
          get().loadPayments(selectedCashRegister.id)
          get().loadStatistics(selectedCashRegister.id)
        }
        return true
      } else {
        toast.error(result.message || 'Errore eliminazione pagamento')
        return false
      }
    } catch (error) {
      console.error('Errore eliminazione pagamento:', error)
      toast.error('Errore durante l\'eliminazione del pagamento')
      return false
    }
  },

  createCashRegister: async (register) => {
    try {
      const result = await window.electronAPI.cash.createRegister(register)

      if (result.success) {
        toast.success('Cassa creata con successo')
        get().loadCashRegisters() // Carica solo le casse pubbliche
        return true
      } else {
        toast.error(result.message || 'Errore creazione cassa')
        return false
      }
    } catch (error) {
      console.error('Errore creazione cassa:', error)
      toast.error('Errore durante la creazione della cassa')
      return false
    }
  },
}))

