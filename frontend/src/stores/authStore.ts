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
  login: (credentials: { name: string; password: string }) => Promise<{ success: boolean; user?: any; message?: string; requiresPasswordChange?: boolean }>
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
        return result
      } else {
        // Non mostrare toast qui, sarà gestito dal componente
        return result
      }
    } catch (error) {
      console.error('Errore login:', error)
      return { success: false, message: 'Errore durante il login' }
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
      console.log('Attempting to unlock hidden cash with password:', password)
      const result = await window.electronAPI.auth.unlockHiddenCash(password)
      console.log('Unlock result:', result)
      
      if (result.success) {
        set({ hasHiddenAccess: true })
        console.log('Hidden cash access granted')
        return true
      } else {
        console.log('Unlock failed:', (result as any).message || 'Unknown error')
        return false
      }
    } catch (error) {
      console.error('Errore sblocco casse nascoste:', error)
      return false
    }
  },

  lockHiddenCash: async () => {
    try {
      await window.electronAPI.auth.lockHiddenCash()
      set({ hasHiddenAccess: false })
    } catch (error) {
      console.error('Errore blocco casse nascoste:', error)
      toast.error('Errore durante il blocco')
    }
  },

  checkHiddenAccess: async () => {
    try {
      const hasAccess = await window.electronAPI.auth.checkHiddenAccess()
      set({ hasHiddenAccess: hasAccess })
    } catch (error) {
      console.error('Errore verifica accesso casse nascoste:', error)
    }
  },
}))

