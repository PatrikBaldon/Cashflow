const { ipcMain } = require('electron');
const DatabaseManager = require('../database/database');

class AuthManager {
  constructor() {
    this.db = new DatabaseManager();
    this.currentUser = null;
    this.hiddenCashPassword = null;
    this.setupIpcHandlers();
  }

  async initialize() {
    await this.db.initialize();
    // Always lock hidden cash registers on app startup
    this.hiddenCashPassword = null;
  }

  setupIpcHandlers() {
    // Login operatore
    ipcMain.handle('auth-login', async (event, { name, password }) => {
      try {
        const user = await this.db.authenticateOperator(name, password);
        if (user) {
          this.currentUser = user;
          return { success: true, user };
        } else {
          return { success: false, message: 'Credenziali non valide' };
        }
      } catch (error) {
        console.error('Errore login:', error);
        return { success: false, message: 'Errore durante il login' };
      }
    });

    // Logout
    ipcMain.handle('auth-logout', async () => {
      this.currentUser = null;
      // Always lock hidden cash registers on logout
      this.hiddenCashPassword = null;
      return { success: true };
    });

    // Verifica sessione
    ipcMain.handle('auth-get-current-user', () => {
      return this.currentUser;
    });

    // Accesso casse nascoste (solo per admin)
    ipcMain.handle('auth-unlock-hidden-cash', async (event, password) => {
      try {
        console.log('AuthManager: Unlock attempt with password:', password);
        console.log('AuthManager: Current user:', this.currentUser);
        console.log('AuthManager: Is admin:', this.currentUser?.isAdmin);
        
        // Solo gli admin possono accedere alle casse nascoste
        if (!this.currentUser?.isAdmin) {
          console.log('AuthManager: User is not admin');
          return { success: false, message: 'Solo gli amministratori possono accedere alle casse nascoste' };
        }

        // Verifica password per casse nascoste
        const settings = await this.db.getSettings();
        const defaultPassword = settings.find(s => s.key === 'default_hidden_password')?.value || 'admin123';
        console.log('AuthManager: Default password from settings:', defaultPassword);
        
        if (password === defaultPassword) {
          this.hiddenCashPassword = password;
          console.log('AuthManager: Password correct, access granted');
          return { success: true };
        } else {
          console.log('AuthManager: Password incorrect');
          return { success: false, message: 'Password non valida per le casse nascoste' };
        }
      } catch (error) {
        console.error('Errore verifica password casse nascoste:', error);
        return { success: false, message: 'Errore durante la verifica' };
      }
    });

    // Blocca casse nascoste
    ipcMain.handle('auth-lock-hidden-cash', () => {
      this.hiddenCashPassword = null;
      return { success: true };
    });

    // Verifica accesso casse nascoste
    ipcMain.handle('auth-check-hidden-access', () => {
      return !!this.hiddenCashPassword;
    });
  }

  async getSettings() {
    return await this.db.getSettings();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasHiddenCashAccess() {
    return !!this.hiddenCashPassword;
  }

  close() {
    this.db.close();
  }
}

module.exports = AuthManager;

