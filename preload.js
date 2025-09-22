const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-payment', callback);
    ipcRenderer.on('menu-print-report', callback);
  },
  
  // Authentication
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
    logout: () => ipcRenderer.invoke('auth-logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth-get-current-user'),
    unlockHiddenCash: (password) => ipcRenderer.invoke('auth-unlock-hidden-cash', password),
    lockHiddenCash: () => ipcRenderer.invoke('auth-lock-hidden-cash'),
    checkHiddenAccess: () => ipcRenderer.invoke('auth-check-hidden-access'),
  },
  
  // Cash registers
  cash: {
    getRegisters: (options) => ipcRenderer.invoke('cash-get-registers', options),
    createRegister: (data) => ipcRenderer.invoke('cash-create-register', data),
    getRegister: (id) => ipcRenderer.invoke('cash-get-register', { id }),
    updateRegister: (id, updates) => ipcRenderer.invoke('cash-update-register', { id, updates }),
    deleteRegister: (id) => ipcRenderer.invoke('cash-delete-register', { id }),
  },
  
  // Payments
  payments: {
    get: (options) => ipcRenderer.invoke('payments-get', options),
    create: (data) => ipcRenderer.invoke('payments-create', {
      cashRegisterId: data.cash_register_id,
      customerName: data.customer_name,
      paymentDate: data.payment_date,
      amount: data.amount,
      reason: data.reason,
      operatorId: data.operatorId
    }),
    update: (id, updates) => ipcRenderer.invoke('payments-update', { paymentId: id, updates }),
    delete: (id) => ipcRenderer.invoke('payments-delete', { paymentId: id }),
  },
  
  // Statistics
  stats: {
    daily: (options) => ipcRenderer.invoke('stats-daily', options),
    weekly: (options) => ipcRenderer.invoke('stats-weekly', options),
    monthly: (options) => ipcRenderer.invoke('stats-monthly', options),
  },
  
  // Users (admin only)
  users: {
    get: () => ipcRenderer.invoke('users-get'),
    create: (data) => ipcRenderer.invoke('users-create', data),
    update: (data) => ipcRenderer.invoke('users-update', data),
    delete: (data) => ipcRenderer.invoke('users-delete', data),
    checkAdmin: (data) => ipcRenderer.invoke('users-check-admin', data),
  },
  
  // Settings (admin only)
  settings: {
    get: () => ipcRenderer.invoke('settings-get'),
    update: (data) => ipcRenderer.invoke('settings-update', data),
  },
  
  // Excel export
  excel: {
    exportPayments: (data) => ipcRenderer.invoke('excel-export-payments', data),
    exportAllCash: (data) => ipcRenderer.invoke('excel-export-all-cash', data),
  },
  
  // File dialogs
  dialog: {
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  },
  
  // File operations
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => process.platform,
  
  // Window controls
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
});
