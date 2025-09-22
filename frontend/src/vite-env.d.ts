/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    auth: {
      login: (credentials: { name: string; password: string }) => Promise<{ success: boolean; user?: any; message?: string }>
      logout: () => Promise<{ success: boolean }>
      getCurrentUser: () => Promise<any>
      unlockHiddenCash: (password: string) => Promise<{ success: boolean; message?: string }>
      lockHiddenCash: () => Promise<{ success: boolean }>
      checkHiddenAccess: () => Promise<{ hasAccess: boolean }>
    }
    cash: {
      getRegisters: (options?: { includeHidden?: boolean; hiddenPassword?: string }) => Promise<{ success: boolean; data?: any[]; message?: string }>
      createRegister: (data: any) => Promise<{ success: boolean; data?: any; message?: string }>
      getRegister: (id: number) => Promise<{ success: boolean; data?: any; message?: string }>
    }
    payments: {
      get: (options: { cashRegisterId: number; startDate?: string; endDate?: string }) => Promise<{ success: boolean; data?: any[]; message?: string }>
      create: (data: any) => Promise<{ success: boolean; data?: any; message?: string }>
      update: (id: number, updates: any) => Promise<{ success: boolean; data?: any; message?: string }>
      delete: (id: number) => Promise<{ success: boolean; data?: any; message?: string }>
    }
    stats: {
      daily: (options: { cashRegisterId: number; date?: string }) => Promise<{ success: boolean; data?: { total: number }; message?: string }>
      weekly: (options: { cashRegisterId: number; weekStart?: string }) => Promise<{ success: boolean; data?: { total: number }; message?: string }>
      monthly: (options: { cashRegisterId: number; year?: number; month?: number }) => Promise<{ success: boolean; data?: { total: number }; message?: string }>
    }
    operators: {
      get: () => Promise<{ success: boolean; data?: any[]; message?: string }>
      create: (data: any) => Promise<{ success: boolean; data?: any; message?: string }>
    }
    onMenuAction: (callback: (event: any, action: string) => void) => void
    openFile: (filePath: string) => Promise<any>
    saveFile: (filePath: string, data: any) => Promise<any>
    getVersion: () => Promise<string>
    getPlatform: () => string
    minimize: () => Promise<any>
    maximize: () => Promise<any>
    close: () => Promise<any>
  }
}

