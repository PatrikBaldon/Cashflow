const { ipcMain } = require('electron');
const DatabaseManager = require('../database/database');

class CashService {
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
    // Gestione casse
    ipcMain.handle('cash-get-registers', async (event, { includeHidden = false, hiddenPassword = null } = {}) => {
      try {
        console.log('CashService: Getting registers with includeHidden:', includeHidden);
        console.log('CashService: AuthManager available:', !!this.authManager);
        console.log('CashService: Has hidden access:', this.authManager?.hasHiddenCashAccess());
        
        // Se includeHidden è true, verifica che l'utente abbia accesso alle casse nascoste
        if (includeHidden) {
          // Verifica se l'utente corrente ha accesso alle casse nascoste
          if (!this.authManager || !this.authManager.hasHiddenCashAccess()) {
            console.log('CashService: No hidden access, returning public registers only');
            // Non restituire errore, restituisci solo le casse pubbliche
            const registers = await this.db.getCashRegisters(false);
            return { success: true, data: registers };
          }
        }
        
        const registers = await this.db.getCashRegisters(includeHidden);
        console.log('CashService: Returning registers:', registers.length, 'registers');
        return { success: true, data: registers };
      } catch (error) {
        console.error('Errore recupero casse:', error);
        return { success: false, message: 'Errore durante il recupero delle casse' };
      }
    });

    ipcMain.handle('cash-create-register', async (event, { name, isHidden = false, hiddenPassword = null, description = '', createdBy = 1 }) => {
      try {
        // Se è una cassa nascosta, verifica che l'utente abbia accesso
        if (isHidden && (!this.authManager || !this.authManager.hasHiddenCashAccess())) {
          // Non permettere la creazione di casse nascoste senza accesso
          return { success: false, message: 'Accesso alle casse nascoste non autorizzato' };
        }
        
        const register = await this.db.createCashRegister(name, isHidden, hiddenPassword, description, createdBy);
        return { success: true, data: register };
      } catch (error) {
        console.error('Errore creazione cassa:', error);
        return { success: false, message: 'Errore durante la creazione della cassa' };
      }
    });

    ipcMain.handle('cash-get-register', async (event, { id }) => {
      try {
        const register = await this.db.getCashRegisterById(id);
        return { success: true, data: register };
      } catch (error) {
        console.error('Errore recupero cassa:', error);
        return { success: false, message: 'Errore durante il recupero della cassa' };
      }
    });

    ipcMain.handle('cash-update-register', async (event, { id, updates }) => {
      try {
        const result = await this.db.updateCashRegister(id, updates);
        return { success: true, data: result };
      } catch (error) {
        console.error('Errore aggiornamento cassa:', error);
        return { success: false, message: 'Errore durante l\'aggiornamento della cassa' };
      }
    });

    ipcMain.handle('cash-delete-register', async (event, { id }) => {
      try {
        const result = await this.db.deleteCashRegister(id);
        return { success: true, data: result };
      } catch (error) {
        console.error('Errore eliminazione cassa:', error);
        return { success: false, message: 'Errore durante l\'eliminazione della cassa' };
      }
    });

    // Gestione pagamenti
    ipcMain.handle('payments-get', async (event, { cashRegisterId, startDate = null, endDate = null }) => {
      try {
        const payments = await this.db.getPayments(cashRegisterId, startDate, endDate);
        return { success: true, data: payments };
      } catch (error) {
        console.error('Errore recupero pagamenti:', error);
        return { success: false, message: 'Errore durante il recupero dei pagamenti' };
      }
    });

    ipcMain.handle('payments-create', async (event, { cashRegisterId, customerName, paymentDate, amount, reason, operatorId }) => {
      try {
        const payment = await this.db.createPayment(cashRegisterId, customerName, paymentDate, amount, reason, operatorId);
        return { success: true, data: payment };
      } catch (error) {
        console.error('Errore creazione pagamento:', error);
        return { success: false, message: 'Errore durante la creazione del pagamento' };
      }
    });

    ipcMain.handle('payments-update', async (event, { paymentId, updates }) => {
      try {
        const result = await this.db.updatePayment(paymentId, updates);
        return { success: result.success, data: result };
      } catch (error) {
        console.error('Errore aggiornamento pagamento:', error);
        return { success: false, message: 'Errore durante l\'aggiornamento del pagamento' };
      }
    });

    ipcMain.handle('payments-delete', async (event, { paymentId }) => {
      try {
        const result = await this.db.deletePayment(paymentId);
        return { success: result.success, data: result };
      } catch (error) {
        console.error('Errore eliminazione pagamento:', error);
        return { success: false, message: 'Errore durante l\'eliminazione del pagamento' };
      }
    });

    // Statistiche
    ipcMain.handle('stats-daily', async (event, { cashRegisterId, date = null }) => {
      try {
        const total = await this.db.getDailyTotal(cashRegisterId, date);
        return { success: true, data: { total } };
      } catch (error) {
        console.error('Errore calcolo totale giornaliero:', error);
        return { success: false, message: 'Errore durante il calcolo del totale giornaliero' };
      }
    });

    ipcMain.handle('stats-weekly', async (event, { cashRegisterId, weekStart = null }) => {
      try {
        const total = await this.db.getWeeklyTotal(cashRegisterId, weekStart);
        return { success: true, data: { total } };
      } catch (error) {
        console.error('Errore calcolo totale settimanale:', error);
        return { success: false, message: 'Errore durante il calcolo del totale settimanale' };
      }
    });

    ipcMain.handle('stats-monthly', async (event, { cashRegisterId, year = null, month = null }) => {
      try {
        const total = await this.db.getMonthlyTotal(cashRegisterId, year, month);
        return { success: true, data: { total } };
      } catch (error) {
        console.error('Errore calcolo totale mensile:', error);
        return { success: false, message: 'Errore durante il calcolo del totale mensile' };
      }
    });

    // Gestione operatori
    ipcMain.handle('operators-get', async () => {
      try {
        const operators = await this.db.getOperators();
        return { success: true, data: operators };
      } catch (error) {
        console.error('Errore recupero operatori:', error);
        return { success: false, message: 'Errore durante il recupero degli operatori' };
      }
    });

    ipcMain.handle('operators-create', async (event, { name, password, isAdmin = false }) => {
      try {
        const operator = await this.db.createOperator(name, password, isAdmin);
        return { success: true, data: operator };
      } catch (error) {
        console.error('Errore creazione operatore:', error);
        return { success: false, message: 'Errore durante la creazione dell\'operatore' };
      }
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = CashService;

