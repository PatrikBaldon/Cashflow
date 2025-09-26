const { ipcMain } = require('electron');

class AuthManager {
  constructor(dbManager) {
    this.db = dbManager;
    this.currentUser = null;
    this.hiddenCashPassword = null;
    this.setupIpcHandlers();
  }

  async initialize() {
    // Rimuoviamo l'inizializzazione, ora è gestita in main.js
    // await this.db.initialize(); 
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

    // Accesso casse nascoste (basato su permessi utente)
    ipcMain.handle('auth-unlock-hidden-cash', async (event, password) => {
      try {
        console.log('AuthManager: Unlock attempt with password:', password);
        console.log('AuthManager: Current user:', this.currentUser);
        console.log('AuthManager: Can access hidden:', this.currentUser?.canAccessHidden);
        
        // Verifica se l'utente può accedere alle casse nascoste
        if (!this.currentUser?.canAccessHidden) {
          console.log('AuthManager: User cannot access hidden cash');
          return { success: false, message: 'Non hai i permessi per accedere alle casse nascoste' };
        }

        // Leggi la password delle casse nascoste dal database
        const settings = await this.db.getSettings();
        const hiddenPasswordSetting = settings.find(s => s.key === 'hidden_cash_password');
        const hashedPassword = hiddenPasswordSetting ? hiddenPasswordSetting.value : null;

        if (!hashedPassword) {
          return { success: false, message: 'Password per casse nascoste non impostata.' };
        }
        
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        
        if (isPasswordValid) {
          this.hiddenCashPassword = password; // Salvo la password in chiaro solo in memoria per la sessione corrente
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

    // Richiesta reset password con P.IVA/email e codice di sicurezza
    ipcMain.handle('auth-request-password-reset', async (event, { vatNumber, email, securityCode, operatorName }) => {
      try {
        // Verifica credenziali aziendali
        let company;
        if (vatNumber) {
          company = await this.db.verifyCompanyCredentials(vatNumber, securityCode);
        } else if (email) {
          company = await this.db.verifyCompanyCredentialsByEmail(email, securityCode);
        } else {
          return { success: false, message: 'P.IVA o email richiesta' };
        }
        
        if (!company) {
          return { success: false, message: 'P.IVA/email o codice di sicurezza non validi' };
        }

        // Verifica che l'operatore esista per questa azienda
        const operator = await this.db.getOperatorByNameAndCompany(operatorName, company.id);
        if (!operator) {
          return { success: false, message: 'Operatore non trovato per questa azienda' };
        }

        // Crea il token di reset
        const tokenResult = await this.db.createPasswordResetToken(company.id, operator.id);
        if (!tokenResult.success) {
          return { success: false, message: 'Errore nella creazione del token' };
        }

        // In un'applicazione reale, qui invieresti l'email
        // Per ora, restituiamo il token per scopi di test
        return { 
          success: true, 
          message: 'Token di reset creato con successo',
          token: tokenResult.token, // Solo per scopi di test - rimuovere in produzione
          expiresAt: tokenResult.expiresAt,
          companyName: company.company_name
        };
      } catch (error) {
        console.error('Errore richiesta reset password:', error);
        return { success: false, message: 'Errore durante la richiesta di reset password' };
      }
    });

    // Verifica token reset password
    ipcMain.handle('auth-verify-reset-token', async (event, { token }) => {
      try {
        const tokenData = await this.db.verifyPasswordResetToken(token);
        if (!tokenData) {
          return { success: false, message: 'Token non valido o scaduto' };
        }

        return { 
          success: true, 
          operatorName: tokenData.operator_name,
          expiresAt: tokenData.expires_at
        };
      } catch (error) {
        console.error('Errore verifica token reset:', error);
        return { success: false, message: 'Errore durante la verifica del token' };
      }
    });

    // Reset password con token
    ipcMain.handle('auth-reset-password', async (event, { token, newPassword }) => {
      try {
        const result = await this.db.usePasswordResetToken(token, newPassword);
        if (!result.success) {
          return { success: false, message: result.error };
        }

        return { success: true, message: 'Password aggiornata con successo' };
      } catch (error) {
        console.error('Errore reset password:', error);
        return { success: false, message: 'Errore durante il reset della password' };
      }
    });

    // Aggiorna password casse nascoste
    ipcMain.handle('auth-update-hidden-cash-password', async (event, { newPassword }) => {
      try {
        // Verifica che l'utente sia admin
        if (!this.currentUser?.isAdmin) {
          return { success: false, message: 'Solo gli amministratori possono modificare la password delle casse nascoste' };
        }

        // Aggiorna la password nel database
        await this.db.updateSetting('hidden_cash_password', newPassword);
        
        return { success: true, message: 'Password casse nascoste aggiornata con successo' };
      } catch (error) {
        console.error('Errore aggiornamento password casse nascoste:', error);
        return { success: false, message: 'Errore durante l\'aggiornamento della password' };
      }
    });

    // Richiesta reset password casse nascoste con P.IVA/email, codice di sicurezza e password utente attuale
    ipcMain.handle('auth-request-hidden-password-reset', async (event, { vatNumber, email, securityCode, currentPassword }) => {
      try {
        // Verifica che l'utente sia loggato e sia amministratore
        if (!this.currentUser) {
          return { success: false, message: 'Devi essere loggato per richiedere il reset' };
        }

        if (!this.currentUser.canAccessHidden) {
          return { success: false, message: 'Non hai i permessi amministratore per richiedere il reset' };
        }

        // Verifica password dell'utente attualmente loggato
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare(currentPassword, this.currentUser.password);
        if (!isPasswordValid) {
          return { success: false, message: 'Password amministratore non corretta' };
        }

        // Verifica credenziali aziendali
        let company;
        if (vatNumber) {
          company = await this.db.verifyCompanyCredentials(vatNumber, securityCode);
        } else if (email) {
          company = await this.db.verifyCompanyCredentialsByEmail(email, securityCode);
        } else {
          return { success: false, message: 'P.IVA o email richiesta' };
        }
        
        if (!company) {
          return { success: false, message: 'P.IVA/email o codice di sicurezza non validi' };
        }

        // Crea il token di reset per le casse nascoste
        const tokenResult = await this.db.createHiddenPasswordResetToken(company.id, this.currentUser.id);
        if (!tokenResult.success) {
          return { success: false, message: 'Errore nella creazione del token' };
        }

        return { 
          success: true, 
          token: tokenResult.token,
          expiresAt: tokenResult.expiresAt,
          companyName: company.company_name
        };
      } catch (error) {
        console.error('Errore richiesta reset password casse nascoste:', error);
        return { success: false, message: 'Errore durante la richiesta di reset' };
      }
    });

    // Reset password casse nascoste con token
    ipcMain.handle('auth-reset-hidden-password', async (event, { token, newPassword }) => {
      try {
        // Verifica token
        const tokenData = await this.db.verifyHiddenPasswordResetToken(token);
        if (!tokenData) {
          return { success: false, message: 'Token non valido o scaduto' };
        }

        // Aggiorna password casse nascoste
        await this.db.updateSetting('hidden_cash_password', newPassword);

        // Elimina il token usato
        await this.db.deleteHiddenPasswordResetToken(token);

        return { success: true, message: 'Password casse nascoste aggiornata con successo' };
      } catch (error) {
        console.error('Errore reset password casse nascoste:', error);
        return { success: false, message: 'Errore durante il reset della password' };
      }
    });
  }

  async getSettings() {
    return await this.db.getSettings();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasUnlockedHiddenCash() {
    return this.hiddenCashPassword !== null;
  }

  hasHiddenCashAccess() {
    return !!this.hiddenCashPassword;
  }

  // Rimuoviamo il metodo close(), ora è gestito in main.js
  // close() {
  //   this.db.close();
  // }
}

module.exports = AuthManager;

