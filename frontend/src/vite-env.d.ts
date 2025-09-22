declare global {
  interface Window {
    electronAPI: {
      // Menu actions
      onMenuAction: (callback: (event: any, action: string) => void) => void;
      
      // Authentication
      auth: {
        login: (credentials: { name: string; password: string }) => Promise<{ success: boolean; user?: any; message?: string }>;
        logout: () => Promise<{ success: boolean }>;
        getCurrentUser: () => Promise<any>;
        unlockHiddenCash: (password: string) => Promise<{ success: boolean }>;
        lockHiddenCash: () => Promise<{ success: boolean }>;
        checkHiddenAccess: () => Promise<boolean>;
      };
      
      // Cash registers
      cash: {
        getRegisters: (options?: { includeHidden?: boolean; hiddenPassword?: string }) => Promise<{ success: boolean; data?: any[]; message?: string }>;
        createRegister: (data: any) => Promise<{ success: boolean; data?: any; message?: string }>;
        getRegister: (id: number) => Promise<{ success: boolean; data?: any; message?: string }>;
        updateRegister: (id: number, updates: any) => Promise<{ success: boolean; message?: string }>;
        deleteRegister: (id: number) => Promise<{ success: boolean; message?: string }>;
      };
      
      // Payments
      payments: {
        get: (options?: any) => Promise<{ success: boolean; data?: any[]; message?: string }>;
        create: (data: any) => Promise<{ success: boolean; data?: any; message?: string }>;
        update: (id: number, updates: any) => Promise<{ success: boolean; message?: string }>;
        delete: (id: number) => Promise<{ success: boolean; message?: string }>;
      };
      
      // Statistics
      stats: {
        daily: (options?: any) => Promise<{ success: boolean; data?: any; message?: string }>;
        weekly: (options?: any) => Promise<{ success: boolean; data?: any; message?: string }>;
        monthly: (options?: any) => Promise<{ success: boolean; data?: any; message?: string }>;
      };
      
      // Users (admin only)
      users: {
        get: () => Promise<{ success: boolean; data?: any[]; message?: string }>;
        create: (data: any) => Promise<{ success: boolean; data?: any; message?: string }>;
        update: (data: any) => Promise<{ success: boolean; message?: string }>;
        delete: (data: any) => Promise<{ success: boolean; message?: string }>;
        checkAdmin: (data: any) => Promise<{ success: boolean; message?: string }>;
      };
      
      // Settings (admin only)
      settings: {
        get: () => Promise<{ success: boolean; data?: any; message?: string }>;
        update: (data: any) => Promise<{ success: boolean; message?: string }>;
      };
      
      // Excel export
      excel: {
        exportPayments: (data: any) => Promise<{ success: boolean; filePath?: string; message?: string }>;
        exportAllCash: (data: any) => Promise<{ success: boolean; filePath?: string; message?: string }>;
      };
      
      // File operations
      openFile: (filePath: string) => Promise<any>;
      saveFile: (filePath: string, data: any) => Promise<any>;
      
      // App info
      getVersion: () => Promise<string>;
      getPlatform: () => string;
      
      // Window controls
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
    };
  }
}

export {};
