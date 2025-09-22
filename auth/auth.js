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
        // Solo gli admin possono accedere alle casse nascoste
        if (!this.currentUser?.isAdmin) {
          return { success: false, message: 'Solo gli amministratori possono accedere alle casse nascoste' };
        }

        // Verifica password per casse nascoste
        const settings = await this.db.getSettings();
        const defaultPassword = settings.find(s => s.key === 'default_hidden_password')?.value || 'admin123';
        
        if (password === defaultPassword) {
          this.hiddenCashPassword = password;
          return { success: true };
        } else {
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
      return { hasAccess: !!this.hiddenCashPassword };
    });
  }

  async getSettings() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT key, value FROM settings`;
      this.db.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
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

