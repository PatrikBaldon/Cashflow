const { ipcMain } = require('electron');
// Rimuoviamo l'import, non serve più
// const DatabaseManager = require('../database/database');

class CashService {
  constructor(dbManager, authManager = null) {
    this.db = dbManager;
    this.authManager = authManager;
    this.setupIpcHandlers();
  }

  // Rimuoviamo il metodo initialize(), ora è gestito in main.js
  // async initialize() {
  //   await this.db.initialize();
  // }

  // Rimuoviamo setAuthManager, ora viene passato nel costruttore
  // setAuthManager(authManager) {
  //   this.authManager = authManager;
  // }

  setupIpcHandlers() {
    // Gestione casse
    ipcMain.handle('cash-get-registers', async (event, { includeHidden = false, hiddenPassword = null } = {}) => {
      try {
        console.log('CashService: Getting registers with includeHidden:', includeHidden);
        console.log('CashService: AuthManager available:', !!this.authManager);
        console.log('CashService: Has hidden access:', this.authManager?.hasHiddenCashAccess());
        
        // Ottieni l'utente corrente per determinare l'azienda
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          return { success: false, message: 'Utente non autenticato' };
        }

        // Se includeHidden è true, verifica che l'utente abbia accesso alle casse nascoste
        if (includeHidden) {
          // Verifica se l'utente corrente ha accesso alle casse nascoste
          if (!this.authManager || !this.authManager.hasHiddenCashAccess()) {
            console.log('CashService: No hidden access, returning public registers only');
            // Non restituire errore, restituisci solo le casse pubbliche
            const registers = await this.db.getCashRegisters(currentUser.companyId, false);
            return { success: true, data: registers };
          }
        }
        
        const registers = await this.db.getCashRegisters(currentUser.companyId, includeHidden);
        console.log('CashService: Returning registers:', registers.length, 'registers');
        
        // Aggiorna le statistiche totali quando cambia lo stato delle casse nascoste
        this.updateTotalStatistics();
        
        return { success: true, data: registers };
      } catch (error) {
        console.error('Errore recupero casse:', error);
        return { success: false, message: 'Errore durante il recupero delle casse' };
      }
    });

    ipcMain.handle('cash-create-register', async (event, { name, isHidden = false, description = '' }) => {
      try {
        // Ottieni l'utente corrente
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          return { success: false, message: 'Utente non autenticato' };
        }

        // Se è una cassa nascosta, verifica che l'utente abbia accesso
        if (isHidden && (!this.authManager || !this.authManager.hasHiddenCashAccess())) {
          // Non permettere la creazione di casse nascoste senza accesso
          return { success: false, message: 'Accesso alle casse nascoste non autorizzato' };
        }
        
        const register = await this.db.createCashRegister(currentUser.companyId, name, isHidden, description, currentUser.id);
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

    // Statistiche totali (tutte le casse)
    ipcMain.handle('stats-total-daily', async (event, { date = null } = {}) => {
      try {
        console.log('CashService: stats-total-daily chiamato');
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          console.log('CashService: Utente non autenticato per stats-total-daily');
          return { success: false, message: 'Utente non autenticato' };
        }

        // Controlla se l'utente ha effettivamente sbloccato le casse nascoste
        const hasUnlockedHidden = this.authManager?.hasUnlockedHiddenCash() || false;
        const includeHidden = currentUser.canAccessHidden && hasUnlockedHidden;
        console.log('CashService: Calcolando totale giornaliero per companyId:', currentUser.companyId, 'canAccessHidden:', currentUser.canAccessHidden, 'hasUnlockedHidden:', hasUnlockedHidden, 'includeHidden:', includeHidden);
        const total = await this.db.getTotalDailyTotal(currentUser.companyId, date, includeHidden);
        console.log('CashService: Totale giornaliero calcolato:', total);
        return { success: true, data: { total } };
      } catch (error) {
        console.error('Errore calcolo totale giornaliero tutte le casse:', error);
        return { success: false, message: 'Errore durante il calcolo del totale giornaliero' };
      }
    });

    ipcMain.handle('stats-total-weekly', async (event, { weekStart = null } = {}) => {
      try {
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          return { success: false, message: 'Utente non autenticato' };
        }

        // Controlla se l'utente ha effettivamente sbloccato le casse nascoste
        const hasUnlockedHidden = this.authManager?.hasUnlockedHiddenCash() || false;
        const includeHidden = currentUser.canAccessHidden && hasUnlockedHidden;
        const total = await this.db.getTotalWeeklyTotal(currentUser.companyId, weekStart, includeHidden);
        return { success: true, data: { total } };
      } catch (error) {
        console.error('Errore calcolo totale settimanale tutte le casse:', error);
        return { success: false, message: 'Errore durante il calcolo del totale settimanale' };
      }
    });

    ipcMain.handle('stats-total-monthly', async (event, { year = null, month = null } = {}) => {
      try {
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          return { success: false, message: 'Utente non autenticato' };
        }

        // Controlla se l'utente ha effettivamente sbloccato le casse nascoste
        const hasUnlockedHidden = this.authManager?.hasUnlockedHiddenCash() || false;
        const includeHidden = currentUser.canAccessHidden && hasUnlockedHidden;
        const total = await this.db.getTotalMonthlyTotal(currentUser.companyId, year, month, includeHidden);
        return { success: true, data: { total } };
      } catch (error) {
        console.error('Errore calcolo totale mensile tutte le casse:', error);
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

  // Metodo per aggiornare le statistiche totali
  async updateTotalStatistics() {
    try {
      const currentUser = this.authManager?.getCurrentUser();
      if (!currentUser) {
        return;
      }

      // Controlla se l'utente ha effettivamente sbloccato le casse nascoste
      const hasUnlockedHidden = this.authManager?.hasUnlockedHiddenCash() || false;
      const includeHidden = currentUser.canAccessHidden && hasUnlockedHidden;

      // Calcola le nuove statistiche totali
      const [dailyTotal, weeklyTotal, monthlyTotal] = await Promise.all([
        this.db.getTotalDailyTotal(currentUser.companyId, null, includeHidden),
        this.db.getTotalWeeklyTotal(currentUser.companyId, null, includeHidden),
        this.db.getTotalMonthlyTotal(currentUser.companyId, null, null, includeHidden)
      ]);

      // Emetti un evento per notificare il frontend dell'aggiornamento
      const { BrowserWindow } = require('electron');
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('total-statistics-updated', {
          totalDaily: dailyTotal,
          totalWeekly: weeklyTotal,
          totalMonthly: monthlyTotal
        });
      }
    } catch (error) {
      console.error('Errore aggiornamento statistiche totali:', error);
    }
  }

  // Rimuoviamo il metodo close(), ora è gestito in main.js
  // close() {
  //   this.db.close();
  // }
}

module.exports = CashService;

