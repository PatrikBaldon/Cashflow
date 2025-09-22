import { create } from 'zustand'
import toast from 'react-hot-toast'

interface User {
  id: number
  name: string
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hasHiddenAccess: boolean
  login: (credentials: { name: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  unlockHiddenCash: (password: string) => Promise<boolean>
  lockHiddenCash: () => Promise<void>
  checkHiddenAccess: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  hasHiddenAccess: false,

  login: async (credentials) => {
    try {
      const result = await window.electronAPI.auth.login(credentials)
      
      if (result.success) {
        set({ 
          user: result.user, 
          isAuthenticated: true 
        })
        toast.success(`Benvenuto, ${result.user.name}!`)
        return true
      } else {
        toast.error(result.message || 'Credenziali non valide')
        return false
      }
    } catch (error) {
      console.error('Errore login:', error)
      toast.error('Errore durante il login')
      return false
    }
  },

  logout: async () => {
    try {
      await window.electronAPI.auth.logout()
      set({ 
        user: null, 
        isAuthenticated: false, 
        hasHiddenAccess: false 
      })
      toast.success('Logout effettuato')
    } catch (error) {
      console.error('Errore logout:', error)
      toast.error('Errore durante il logout')
    }
  },

  checkAuth: async () => {
    try {
      const user = await window.electronAPI.auth.getCurrentUser()
      if (user) {
        set({ user, isAuthenticated: true })
        await get().checkHiddenAccess()
      }
    } catch (error) {
      console.error('Errore verifica autenticazione:', error)
    }
  },

  unlockHiddenCash: async (password) => {
    try {
      const result = await window.electronAPI.auth.unlockHiddenCash(password)
      
      if (result.success) {
        set({ hasHiddenAccess: true })
        toast.success('Accesso alle casse nascoste sbloccato')
        return true
      } else {
        toast.error('Password non valida')
        return false
      }
    } catch (error) {
      console.error('Errore sblocco casse nascoste:', error)
      toast.error('Errore durante lo sblocco')
      return false
    }
  },

  lockHiddenCash: async () => {
    try {
      await window.electronAPI.auth.lockHiddenCash()
      set({ hasHiddenAccess: false })
      toast.success('Casse nascoste bloccate')
    } catch (error) {
      console.error('Errore blocco casse nascoste:', error)
      toast.error('Errore durante il blocco')
    }
  },

  checkHiddenAccess: async () => {
    try {
      const result = await window.electronAPI.auth.checkHiddenAccess()
      set({ hasHiddenAccess: result })
    } catch (error) {
      console.error('Errore verifica accesso casse nascoste:', error)
    }
  },
}))

