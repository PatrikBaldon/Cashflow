const { ipcMain } = require('electron');
const DatabaseManager = require('../database/database');

class UserService {
  constructor(authManager = null) {
    this.db = new DatabaseManager();
    this.authManager = authManager;
    this.setupIpcHandlers();
  }

  async initialize() {
    await this.db.initialize();
  }

  setAuthManager(authManager) {
    this.authManager = authManager;
  }

  setupIpcHandlers() {
    // Gestione utenti
    ipcMain.handle('users-get', async () => {
      try {
        // Ottieni l'utente corrente per determinare l'azienda
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          return { success: false, message: 'Utente non autenticato' };
        }

        const users = await this.db.getOperators(currentUser.companyId);
        return { success: true, data: users };
      } catch (error) {
        console.error('Errore recupero utenti:', error);
        return { success: false, message: 'Errore durante il recupero degli utenti' };
      }
    });

    ipcMain.handle('users-create', async (event, { name, password, isAdmin = false, canAccessHidden = false }) => {
      try {
        // Ottieni l'utente corrente per determinare l'azienda
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          return { success: false, message: 'Utente non autenticato' };
        }

        const user = await this.db.createOperator(currentUser.companyId, name, password, isAdmin, canAccessHidden);
        return { success: true, data: user };
      } catch (error) {
        console.error('Errore creazione utente:', error);
        return { success: false, message: 'Errore durante la creazione dell\'utente' };
      }
    });

    ipcMain.handle('users-update', async (event, { userId, updates }) => {
      try {
        const result = await this.db.updateOperator(userId, updates);
        return { success: result.success, data: result };
      } catch (error) {
        console.error('Errore aggiornamento utente:', error);
        return { success: false, message: 'Errore durante l\'aggiornamento dell\'utente' };
      }
    });

    ipcMain.handle('users-delete', async (event, { userId }) => {
      try {
        const result = await this.db.deleteOperator(userId);
        return { success: result.success, data: result };
      } catch (error) {
        console.error('Errore eliminazione utente:', error);
        return { success: false, message: 'Errore durante l\'eliminazione dell\'utente' };
      }
    });

    // Gestione impostazioni
    ipcMain.handle('settings-get', async () => {
      try {
        const settings = await this.db.getSettings();
        return { success: true, data: settings };
      } catch (error) {
        console.error('Errore recupero impostazioni:', error);
        return { success: false, message: 'Errore durante il recupero delle impostazioni' };
      }
    });

    ipcMain.handle('settings-update', async (event, { key, value }) => {
      try {
        const result = await this.db.updateSetting(key, value);
        return { success: result.success, data: result };
      } catch (error) {
        console.error('Errore aggiornamento impostazione:', error);
        return { success: false, message: 'Errore durante l\'aggiornamento dell\'impostazione' };
      }
    });

    // Verifica permessi admin
    ipcMain.handle('users-check-admin', async (event, { userId }) => {
      try {
        const user = await this.db.getOperatorById(userId);
        return { success: true, data: { isAdmin: user?.is_admin || false } };
      } catch (error) {
        console.error('Errore verifica permessi admin:', error);
        return { success: false, message: 'Errore durante la verifica dei permessi' };
      }
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = UserService;
