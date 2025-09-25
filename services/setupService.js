const { ipcMain } = require('electron');
const DatabaseManager = require('../database/database');

class SetupService {
  constructor() {
    this.db = new DatabaseManager();
    this.setupIpcHandlers();
  }

  async initialize() {
    await this.db.initialize();
  }

  setupIpcHandlers() {
    // Verifica se il setup è completato
    ipcMain.handle('setup-is-completed', async () => {
      try {
        const isCompleted = await this.db.isSetupCompleted();
        return { success: true, isCompleted };
      } catch (error) {
        console.error('Errore verifica setup:', error);
        return { success: false, message: 'Errore durante la verifica del setup' };
      }
    });

    // Crea profilo aziendale
    ipcMain.handle('setup-create-company', async (event, { companyName, vatNumber, email, hiddenCashPassword }) => {
      try {
        // Validazione P.IVA italiana
        if (!this.isValidVatNumber(vatNumber)) {
          return { success: false, message: 'P.IVA non valida. Inserire una P.IVA italiana valida.' };
        }

        // Validazione email
        if (!this.isValidEmail(email)) {
          return { success: false, message: 'Email non valida.' };
        }

        // Validazione password casse nascoste
        if (!hiddenCashPassword || hiddenCashPassword.length < 6) {
          return { success: false, message: 'Password casse nascoste deve essere di almeno 6 caratteri.' };
        }

        const result = await this.db.createCompanyProfile(companyName, vatNumber, email, hiddenCashPassword);
        if (!result.success) {
          return { success: false, message: result.error };
        }

        // Crea l'operatore admin di default
        const adminResult = await this.db.createOperator(
          result.companyId,
          'admin',
          'admin123',
          true, // isAdmin
          true  // canAccessHidden
        );

        if (!adminResult.success) {
          return { success: false, message: 'Errore nella creazione dell\'amministratore' };
        }

        // Crea la cassa principale
        const cashResult = await this.db.createCashRegister(
          result.companyId,
          'Cassa Principale',
          false, // isHidden
          'Cassa principale per i pagamenti regolari',
          adminResult.operatorId
        );

        if (!cashResult.success) {
          return { success: false, message: 'Errore nella creazione della cassa principale' };
        }

        return { 
          success: true, 
          message: 'Profilo aziendale creato con successo',
          securityCode: result.securityCode,
          companyId: result.companyId
        };
      } catch (error) {
        console.error('Errore creazione profilo aziendale:', error);
        return { success: false, message: 'Errore durante la creazione del profilo aziendale' };
      }
    });

    // Ottiene il profilo aziendale
    ipcMain.handle('setup-get-company-profile', async () => {
      try {
        const profile = await this.db.getCompanyProfile();
        return { success: true, profile };
      } catch (error) {
        console.error('Errore recupero profilo aziendale:', error);
        return { success: false, message: 'Errore durante il recupero del profilo aziendale' };
      }
    });
  }

  // Validazione P.IVA italiana
  isValidVatNumber(vatNumber) {
    // Rimuove spazi e caratteri non numerici
    const cleanVat = vatNumber.replace(/\s/g, '').replace(/[^0-9]/g, '');
    
    // P.IVA italiana deve avere 11 cifre
    if (cleanVat.length !== 11) {
      return false;
    }

    // Algoritmo di validazione P.IVA italiana
    const digits = cleanVat.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < 10; i++) {
      let digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[10];
  }

  // Validazione email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  close() {
    this.db.close();
  }
}

module.exports = SetupService;
