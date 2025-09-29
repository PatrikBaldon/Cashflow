declare global {
  interface Window {
    electronAPI: {
      // Menu actions
      onMenuAction: (callback: (event: any, action: string) => void) => void;
      
      // Authentication
      auth: {
        login: (credentials: { name: string; password: string }) => Promise<{ success: boolean; user?: any; message?: string; requiresPasswordChange?: boolean }>;
        logout: () => Promise<{ success: boolean }>;
        getCurrentUser: () => Promise<any>;
        unlockHiddenCash: (password: string) => Promise<{ success: boolean; message?: string }>;
        lockHiddenCash: () => Promise<{ success: boolean }>;
        checkHiddenAccess: () => Promise<boolean>;
        requestPasswordReset: (data: { vatNumber?: string; email?: string; securityCode: string; operatorName: string }) => Promise<{ success: boolean; message?: string; token?: string; expiresAt?: string; companyName?: string }>;
        verifyResetToken: (data: { token: string }) => Promise<{ success: boolean; message?: string; operatorName?: string; expiresAt?: string }>;
        resetPassword: (data: { token: string; newPassword: string }) => Promise<{ success: boolean; message?: string }>;
        changeDefaultAdmin: (data: { newName: string; newPassword: string }) => Promise<{ success: boolean; message?: string }>;
        updateHiddenCashPassword: (data: { newPassword: string }) => Promise<{ success: boolean; message?: string }>;
        requestHiddenPasswordReset: (data: { vatNumber?: string; email?: string; securityCode: string; currentPassword: string }) => Promise<{ success: boolean; message?: string; token?: string; expiresAt?: string; companyName?: string }>;
        resetHiddenPassword: (data: { token: string; newPassword: string }) => Promise<{ success: boolean; message?: string }>;
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
        totalDaily: (options?: any) => Promise<{ success: boolean; data?: any; message?: string }>;
        totalWeekly: (options?: any) => Promise<{ success: boolean; data?: any; message?: string }>;
        totalMonthly: (options?: any) => Promise<{ success: boolean; data?: any; message?: string }>;
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
      
      // Setup
      setup: {
        isCompleted: () => Promise<{ success: boolean; isCompleted?: boolean; message?: string }>;
        createCompany: (data: { companyName: string; vatNumber: string; email: string; hiddenCashPassword: string }) => Promise<{ success: boolean; message?: string; securityCode?: string; companyId?: number }>;
        getCompanyProfile: () => Promise<{ success: boolean; profile?: any; message?: string }>;
      };
      
      // Excel export
      excel: {
        exportPayments: (data: { cashRegisterId: number; includeHidden?: boolean; filePath?: string }) => Promise<{ success: boolean; filePath?: string; fileName?: string; message?: string }>;
        exportAllCash: (data: { includeHidden?: boolean; filePath?: string }) => Promise<{ success: boolean; filePath?: string; fileName?: string; message?: string }>;
      };
      
      // File dialogs
      dialog: {
        showSaveDialog: (options?: { title?: string; defaultPath?: string }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
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
      
      // Event listeners
      onTotalStatisticsUpdated: (callback: (event: any, data: { totalDaily: number; totalWeekly: number; totalMonthly: number }) => void) => void;
      removeTotalStatisticsListener: (callback: (event: any, data: { totalDaily: number; totalWeekly: number; totalMonthly: number }) => void) => void;
    };
  }
}

export {};
