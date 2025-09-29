const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');

class DatabaseManager {
  constructor() {
    this.db = null;
    // Usa il percorso dell'app per Electron compilato
    const appPath = require('electron').app ? require('electron').app.getPath('userData') : __dirname;
    this.dbPath = path.join(appPath, 'registro_contanti.db');
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  // Inizializza il database
  async initialize() {
    try {
      // Assicurati che la directory esista
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.db = new Database(this.dbPath);
      console.log('Database connesso con successo:', this.dbPath);
      await this.createTables();
    } catch (err) {
      console.error('Errore apertura database:', err);
      console.error('Percorso database:', this.dbPath);
      console.error('Better-sqlite3 disponibile:', !!Database);
      throw err;
    }
  }

  // Crea le tabelle se non esistono
  async createTables() {
    try {
      // Usa il percorso relativo per lo schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (!fs.existsSync(schemaPath)) {
        // Fallback per Electron compilato
        const appPath = require('electron').app ? require('electron').app.getAppPath() : __dirname;
        const fallbackSchemaPath = path.join(appPath, 'database', 'schema.sql');
        if (fs.existsSync(fallbackSchemaPath)) {
          const schema = fs.readFileSync(fallbackSchemaPath, 'utf8');
          this.db.exec(schema);
        } else {
          throw new Error('Schema SQL non trovato');
        }
      } else {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
      }
      console.log('Tabelle create/verificate con successo');
    } catch (err) {
      console.error('Errore creazione tabelle:', err);
      throw err;
    }
  }

  // Gestisce la chiave di crittografia
  getOrCreateEncryptionKey() {
    const appPath = require('electron').app ? require('electron').app.getPath('userData') : __dirname;
    const keyPath = path.join(appPath, '.encryption_key');
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8');
    } else {
      const key = CryptoJS.lib.WordArray.random(256/8).toString();
      // Assicurati che la directory esista
      const keyDir = path.dirname(keyPath);
      if (!fs.existsSync(keyDir)) {
        fs.mkdirSync(keyDir, { recursive: true });
      }
      fs.writeFileSync(keyPath, key);
      return key;
    }
  }

  // Cripta i dati
  encrypt(text) {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  // Decripta i dati
  decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Crea un nuovo utente
  /* METODI OBSOLETI PER LA TABELLA 'users' - NON UTILIZZATI
  async createUser(username, password, role = 'user') {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = this.db.prepare(`
        INSERT INTO users (username, password, role, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(username, hashedPassword, role);
      return { success: true, userId: result.lastInsertRowid };
    } catch (err) {
      console.error('Errore creazione utente:', err);
      return { success: false, error: err.message };
    }
  }
  */

  // Verifica le credenziali utente
  async verifyUser(username, password) {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get(username);
      
      if (!user) {
        return { success: false, error: 'Utente non trovato' };
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return { success: false, error: 'Password non valida' };
      }

      // Aggiorna ultimo accesso
      const updateStmt = this.db.prepare('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?');
      updateStmt.run(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.created_at
        }
      };
    } catch (err) {
      console.error('Errore verifica utente:', err);
      return { success: false, error: err.message };
    }
  }

  // Ottiene tutti gli utenti
  async getUsers() {
    try {
      const stmt = this.db.prepare('SELECT id, username, role, created_at, last_login FROM users ORDER BY created_at DESC');
      const users = stmt.all();
      return { success: true, users };
    } catch (err) {
      console.error('Errore recupero utenti:', err);
      return { success: false, error: err.message };
    }
  }

  // Aggiorna un utente
  async updateUser(userId, updates) {
    try {
      const fields = [];
      const values = [];

      if (updates.username) {
        fields.push('username = ?');
        values.push(updates.username);
      }
      if (updates.password) {
        const hashedPassword = bcrypt.hashSync(updates.password, 10);
        fields.push('password = ?');
        values.push(hashedPassword);
      }
      if (updates.role) {
        fields.push('role = ?');
        values.push(updates.role);
      }

      if (fields.length === 0) {
        return { success: false, error: 'Nessun campo da aggiornare' };
      }

      values.push(userId);
      const stmt = this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);

      return { success: true };
    } catch (err) {
      console.error('Errore aggiornamento utente:', err);
      return { success: false, error: err.message };
    }
  }

  // Elimina un utente
  async deleteUser(userId) {
    try {
      const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
      stmt.run(userId);
      return { success: true };
    } catch (err) {
      console.error('Errore eliminazione utente:', err);
      return { success: false, error: err.message };
    }
  }

  // Crea un nuovo pagamento
  /* METODO DUPLICATO - NON UTILIZZATO
  async createPayment(payment) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO payments (amount, description, type, category, date, user_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(
        payment.amount,
        payment.description,
        payment.type,
        payment.category,
        payment.date,
        payment.userId
      );
      
      return { success: true, paymentId: result.lastInsertRowid };
    } catch (err) {
      console.error('Errore creazione pagamento:', err);
      return { success: false, error: err.message };
    }
  }
  */

  // Ottiene i pagamenti con filtri
  /* METODO DUPLICATO - NON UTILIZZATO
  async getPayments(filters = {}) {
    try {
      let query = 'SELECT * FROM payments WHERE 1=1';
      const params = [];
      if (filters.userId) {
        query += ' AND user_id = ?';
        params.push(filters.userId);
      }
      if (filters.startDate) {
        query += ' AND date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        query += ' AND date <= ?';
        params.push(filters.endDate);
      }
      if (filters.type) {
        query += ' AND type = ?';
        params.push(filters.type);
      }
      query += ' ORDER BY date DESC, created_at DESC';
      const stmt = this.db.prepare(query);
      const payments = stmt.all(...params);
      // Calcola totale
      const total = payments.reduce((sum, payment) => {
        return payment.type === 'income' ? sum + payment.amount : sum - payment.amount;
      }, 0);
      return { success: true, payments, total };
    } catch (err) {
      console.error('Errore recupero pagamenti:', err);
      return { success: false, error: err.message };
    }
  }
  */

  // Aggiorna un pagamento
  /* METODO DUPLICATO - NON UTILIZZATO
  async updatePayment(paymentId, updates) {
    try {
      const fields = [];
      const values = [];
      if (updates.amount !== undefined) {
        fields.push('amount = ?');
        values.push(updates.amount);
      }
      if (updates.description) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.type) {
        fields.push('type = ?');
        values.push(updates.type);
      }
      if (updates.category) {
        fields.push('category = ?');
        values.push(updates.category);
      }
      if (updates.date) {
        fields.push('date = ?');
        values.push(updates.date);
      }
      if (fields.length === 0) {
        return { success: false, error: 'Nessun campo da aggiornare' };
      }
      values.push(paymentId);
      const stmt = this.db.prepare(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
      return { success: true };
    } catch (err) {
      console.error('Errore aggiornamento pagamento:', err);
      return { success: false, error: err.message };
    }
  }
  */

  // Elimina un pagamento
  /* METODO DUPLICATO - NON UTILIZZATO
  async deletePayment(paymentId) {
    try {
      const stmt = this.db.prepare('DELETE FROM payments WHERE id = ?');
      stmt.run(paymentId);
      return { success: true };
    } catch (err) {
      console.error('Errore eliminazione pagamento:', err);
      return { success: false, error: err.message };
    }
  }
  */

  // Ottiene statistiche
  /* METODO DUPLICATO - NON UTILIZZATO
  async getStatistics(filters = {}) {
    try {
      let query = 'SELECT type, SUM(amount) as total FROM payments WHERE 1=1';
      const params = [];
      if (filters.userId) {
        query += ' AND user_id = ?';
        params.push(filters.userId);
      }
      if (filters.startDate) {
        query += ' AND date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        query += ' AND date <= ?';
        params.push(filters.endDate);
      }
      query += ' GROUP BY type';
      const stmt = this.db.prepare(query);
      const results = stmt.all(...params);
      const stats = {
        totalIncome: 0,
        totalExpenses: 0,
        netCashFlow: 0
      };
      results.forEach(row => {
        if (row.type === 'income') {
          stats.totalIncome = row.total;
        } else if (row.type === 'expense') {
          stats.totalExpenses = row.total;
        }
      });
      stats.netCashFlow = stats.totalIncome - stats.totalExpenses;
      return { success: true, statistics: stats };
    } catch (err) {
      console.error('Errore recupero statistiche:', err);
      return { success: false, error: err.message };
    }
  }
  */

  // Crea backup del database
  async createBackup() {
    try {
      const backupDir = path.join(__dirname, '..', 'data', 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup_${timestamp}.db`);
      
      fs.copyFileSync(this.dbPath, backupPath);
      
      return { success: true, backupPath };
    } catch (err) {
      console.error('Errore creazione backup:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== METODI PER OPERATORI =====
  
  // Autentica un operatore
  async authenticateOperator(name, password) {
    try {
      const stmt = this.db.prepare(`
        SELECT o.*, cp.company_name, cp.vat_number
        FROM operators o
        JOIN company_profiles cp ON o.company_id = cp.id
        WHERE o.name = ?
      `);
      const operator = stmt.get(name);
      
      if (!operator) {
        return null;
      }

      const isValid = await bcrypt.compare(password, operator.password_hash);
      if (!isValid) {
        return null;
      }

      // Aggiorna ultimo accesso
      const updateStmt = this.db.prepare('UPDATE operators SET last_login = datetime(\'now\') WHERE id = ?');
      updateStmt.run(operator.id);

      return {
        id: operator.id,
        companyId: operator.company_id,
        name: operator.name,
        isAdmin: operator.is_admin,
        canAccessHidden: operator.can_access_hidden,
        companyName: operator.company_name,
        vatNumber: operator.vat_number,
        password: operator.password_hash,
        createdAt: operator.created_at,
        lastLogin: operator.last_login
      };
    } catch (err) {
      console.error('Errore autenticazione operatore:', err);
      throw err;
    }
  }

  // Ottiene tutti gli operatori per l'azienda corrente
  async getOperators(companyId) {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, is_admin, can_access_hidden, created_at, last_login 
        FROM operators 
        WHERE company_id = ? 
        ORDER BY created_at DESC
      `);
      const operators = stmt.all(companyId);
      return operators;
    } catch (err) {
      console.error('Errore recupero operatori:', err);
      throw err;
    }
  }

  // Ottiene un operatore per ID
  async getOperatorById(id) {
    try {
      const stmt = this.db.prepare('SELECT * FROM operators WHERE id = ?');
      const operator = stmt.get(id);
      return operator;
    } catch (err) {
      console.error('Errore recupero operatore:', err);
      throw err;
    }
  }

  // Crea un nuovo operatore
  async createOperator(companyId, name, password, isAdmin = false, canAccessHidden = false) {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = this.db.prepare(`
        INSERT INTO operators (company_id, name, password_hash, is_admin, can_access_hidden, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
      
      // Converti i valori booleani in numeri per SQLite
      const isAdminInt = isAdmin ? 1 : 0;
      const canAccessHiddenInt = canAccessHidden ? 1 : 0;
      
      const result = stmt.run(companyId, name, hashedPassword, isAdminInt, canAccessHiddenInt);
      return { success: true, operatorId: result.lastInsertRowid };
    } catch (err) {
      console.error('Errore creazione operatore:', err);
      return { success: false, error: err.message };
    }
  }

  // Aggiorna un operatore
  async updateOperator(operatorId, updates) {
    try {
      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.password) {
        const hashedPassword = bcrypt.hashSync(updates.password, 10);
        fields.push('password_hash = ?');
        values.push(hashedPassword);
      }
      if (updates.isAdmin !== undefined) {
        fields.push('is_admin = ?');
        values.push(updates.isAdmin ? 1 : 0);
      }
      if (updates.canAccessHidden !== undefined) {
        fields.push('can_access_hidden = ?');
        values.push(updates.canAccessHidden ? 1 : 0);
      }

      if (fields.length === 0) {
        return { success: false, error: 'Nessun campo da aggiornare' };
      }

      values.push(operatorId);
      const stmt = this.db.prepare(`UPDATE operators SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);

      return { success: true };
    } catch (err) {
      console.error('Errore aggiornamento operatore:', err);
      return { success: false, error: err.message };
    }
  }

  // Elimina un operatore
  async deleteOperator(operatorId) {
    try {
      const stmt = this.db.prepare('DELETE FROM operators WHERE id = ?');
      stmt.run(operatorId);
      return { success: true };
    } catch (err) {
      console.error('Errore eliminazione operatore:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== METODI PER CASSE =====

  // Ottiene tutte le casse per l'azienda
  async getCashRegisters(companyId, includeHidden = false) {
    try {
      let query = 'SELECT * FROM cash_registers WHERE company_id = ?';
      const params = [companyId];
      
      if (!includeHidden) {
        query += ' AND is_hidden = FALSE';
      }
      
      query += ' ORDER BY created_at DESC';
      
      const stmt = this.db.prepare(query);
      const registers = stmt.all(...params);
      return registers;
    } catch (err) {
      console.error('Errore recupero casse:', err);
      throw err;
    }
  }

  // Ottiene una cassa per ID
  async getCashRegisterById(id) {
    try {
      const stmt = this.db.prepare('SELECT * FROM cash_registers WHERE id = ?');
      const register = stmt.get(id);
      return register;
    } catch (err) {
      console.error('Errore recupero cassa:', err);
      throw err;
    }
  }

  // Crea una nuova cassa
  async createCashRegister(companyId, name, isHidden = false, description = '', createdBy = 1) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO cash_registers (company_id, name, is_hidden, description, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
      
      // Converti il valore booleano in numero per SQLite
      const isHiddenInt = isHidden ? 1 : 0;
      
      const result = stmt.run(companyId, name, isHiddenInt, description, createdBy);
      return { success: true, registerId: result.lastInsertRowid };
    } catch (err) {
      console.error('Errore creazione cassa:', err);
      return { success: false, error: err.message };
    }
  }

  // Aggiorna una cassa
  async updateCashRegister(id, updates) {
    try {
      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.isHidden !== undefined) {
        fields.push('is_hidden = ?');
        values.push(updates.isHidden ? 1 : 0);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }

      if (fields.length === 0) {
        return { success: false, error: 'Nessun campo da aggiornare' };
      }

      values.push(id);
      const stmt = this.db.prepare(`UPDATE cash_registers SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);

      return { success: true };
    } catch (err) {
      console.error('Errore aggiornamento cassa:', err);
      return { success: false, error: err.message };
    }
  }

  // Elimina una cassa
  async deleteCashRegister(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM cash_registers WHERE id = ?');
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('Errore eliminazione cassa:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== METODI PER PAGAMENTI =====

  // Ottiene i pagamenti per cassa
  async getPayments(cashRegisterId, startDate = null, endDate = null) {
    try {
      let query = `
        SELECT p.*, o.name as operator_name, cr.name as cash_register_name
        FROM payments p
        LEFT JOIN operators o ON p.operator_id = o.id
        LEFT JOIN cash_registers cr ON p.cash_register_id = cr.id
        WHERE p.cash_register_id = ?
      `;
      const params = [cashRegisterId];

      if (startDate) {
        query += ' AND p.payment_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND p.payment_date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY p.payment_date DESC, p.created_at DESC';

      const stmt = this.db.prepare(query);
      const payments = stmt.all(...params);
      return payments;
    } catch (err) {
      console.error('Errore recupero pagamenti:', err);
      throw err;
    }
  }

  // Ottiene i pagamenti per cassa (versione semplificata)
  async getPaymentsByCashRegister(cashRegisterId) {
    try {
      const stmt = this.db.prepare(`
        SELECT p.*, o.name as operator_name
        FROM payments p
        LEFT JOIN operators o ON p.operator_id = o.id
        WHERE p.cash_register_id = ?
        ORDER BY p.payment_date DESC, p.created_at DESC
      `);
      const payments = stmt.all(cashRegisterId);
      return payments;
    } catch (err) {
      console.error('Errore recupero pagamenti per cassa:', err);
      throw err;
    }
  }

  // Crea un nuovo pagamento
  async createPayment(cashRegisterId, customerName, paymentDate, amount, reason, operatorId) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO payments (cash_register_id, customer_name, payment_date, amount, reason, operator_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(cashRegisterId, customerName, paymentDate, amount, reason, operatorId);
      return { success: true, paymentId: result.lastInsertRowid };
    } catch (err) {
      console.error('Errore creazione pagamento:', err);
      return { success: false, error: err.message };
    }
  }

  // Aggiorna un pagamento
  async updatePayment(paymentId, updates) {
    try {
      const fields = [];
      const values = [];

      if (updates.customerName) {
        fields.push('customer_name = ?');
        values.push(updates.customerName);
      }
      if (updates.paymentDate) {
        fields.push('payment_date = ?');
        values.push(updates.paymentDate);
      }
      if (updates.amount !== undefined) {
        fields.push('amount = ?');
        values.push(updates.amount);
      }
      if (updates.reason) {
        fields.push('reason = ?');
        values.push(updates.reason);
      }

      if (fields.length === 0) {
        return { success: false, error: 'Nessun campo da aggiornare' };
      }

      fields.push('updated_at = datetime(\'now\')');
      values.push(paymentId);
      const stmt = this.db.prepare(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);

      return { success: true };
    } catch (err) {
      console.error('Errore aggiornamento pagamento:', err);
      return { success: false, error: err.message };
    }
  }

  // Elimina un pagamento
  async deletePayment(paymentId) {
    try {
      const stmt = this.db.prepare('DELETE FROM payments WHERE id = ?');
      stmt.run(paymentId);
      return { success: true };
    } catch (err) {
      console.error('Errore eliminazione pagamento:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== METODI PER STATISTICHE =====

  // Ottiene il totale giornaliero per una cassa
  async getDailyTotal(cashRegisterId, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const stmt = this.db.prepare(`
        SELECT SUM(amount) as total
        FROM payments
        WHERE cash_register_id = ? AND payment_date = ?
      `);
      const result = stmt.get(cashRegisterId, targetDate);
      return result.total || 0;
    } catch (err) {
      console.error('Errore calcolo totale giornaliero:', err);
      throw err;
    }
  }

  // Ottiene il totale settimanale per una cassa
  async getWeeklyTotal(cashRegisterId, weekStart = null) {
    try {
      const startDate = weekStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const stmt = this.db.prepare(`
        SELECT SUM(amount) as total
        FROM payments
        WHERE cash_register_id = ? AND payment_date BETWEEN ? AND ?
      `);
      const result = stmt.get(cashRegisterId, startDate, endDate);
      return result.total || 0;
    } catch (err) {
      console.error('Errore calcolo totale settimanale:', err);
      throw err;
    }
  }

  // Ottiene il totale mensile per una cassa
  async getMonthlyTotal(cashRegisterId, year = null, month = null) {
    try {
      const now = new Date();
      const targetYear = year || now.getFullYear();
      const targetMonth = month || now.getMonth() + 1;
      
      const stmt = this.db.prepare(`
        SELECT SUM(amount) as total
        FROM payments
        WHERE cash_register_id = ? 
        AND strftime('%Y', payment_date) = ? 
        AND strftime('%m', payment_date) = ?
      `);
      const result = stmt.get(cashRegisterId, targetYear.toString(), targetMonth.toString().padStart(2, '0'));
      return result.total || 0;
    } catch (err) {
      console.error('Errore calcolo totale mensile:', err);
      throw err;
    }
  }

  // ===== METODI PER STATISTICHE TOTALI (TUTTE LE CASSE) =====

  // Ottiene il totale giornaliero per tutte le casse dell'azienda
  async getTotalDailyTotal(companyId, date = null, includeHidden = false) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      let query = `
        SELECT SUM(p.amount) as total
        FROM payments p
        INNER JOIN cash_registers cr ON p.cash_register_id = cr.id
        WHERE cr.company_id = ? AND p.payment_date = ?
      `;
      
      if (!includeHidden) {
        query += ' AND cr.is_hidden = FALSE';
      }
      
      const stmt = this.db.prepare(query);
      const result = stmt.get(companyId, targetDate);
      return result.total || 0;
    } catch (err) {
      console.error('Errore calcolo totale giornaliero tutte le casse:', err);
      throw err;
    }
  }

  // Ottiene il totale settimanale per tutte le casse dell'azienda
  async getTotalWeeklyTotal(companyId, weekStart = null, includeHidden = false) {
    try {
      const startDate = weekStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      let query = `
        SELECT SUM(p.amount) as total
        FROM payments p
        INNER JOIN cash_registers cr ON p.cash_register_id = cr.id
        WHERE cr.company_id = ? AND p.payment_date BETWEEN ? AND ?
      `;
      
      if (!includeHidden) {
        query += ' AND cr.is_hidden = FALSE';
      }
      
      const stmt = this.db.prepare(query);
      const result = stmt.get(companyId, startDate, endDate);
      return result.total || 0;
    } catch (err) {
      console.error('Errore calcolo totale settimanale tutte le casse:', err);
      throw err;
    }
  }

  // Ottiene il totale mensile per tutte le casse dell'azienda
  async getTotalMonthlyTotal(companyId, year = null, month = null, includeHidden = false) {
    try {
      const now = new Date();
      const targetYear = year || now.getFullYear();
      const targetMonth = month || now.getMonth() + 1;
      
      let query = `
        SELECT SUM(p.amount) as total
        FROM payments p
        INNER JOIN cash_registers cr ON p.cash_register_id = cr.id
        WHERE cr.company_id = ? 
        AND strftime('%Y', p.payment_date) = ? 
        AND strftime('%m', p.payment_date) = ?
      `;
      
      if (!includeHidden) {
        query += ' AND cr.is_hidden = FALSE';
      }
      
      const stmt = this.db.prepare(query);
      const result = stmt.get(companyId, targetYear.toString(), targetMonth.toString().padStart(2, '0'));
      return result.total || 0;
    } catch (err) {
      console.error('Errore calcolo totale mensile tutte le casse:', err);
      throw err;
    }
  }

  // ===== METODI PER IMPOSTAZIONI =====

  // Ottiene tutte le impostazioni
  async getSettings() {
    try {
      const stmt = this.db.prepare('SELECT key, value FROM settings');
      const settings = stmt.all();
      return settings;
    } catch (err) {
      console.error('Errore recupero impostazioni:', err);
      throw err;
    }
  }

  // Ottiene una singola impostazione
  async getSetting(key) {
    try {
      const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
      const result = stmt.get(key);
      return result ? result.value : null;
    } catch (err) {
      console.error('Errore recupero impostazione:', err);
      throw err;
    }
  }

  // Aggiorna un'impostazione
  async updateSetting(key, value) {
    try {
      let finalValue = value;
      // Se stiamo aggiornando la password delle casse nascoste, eseguiamo l'hashing
      if (key === 'hidden_cash_password') {
        finalValue = bcrypt.hashSync(value, 10);
      }

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `);
      
      stmt.run(key, finalValue);
      return { success: true };
    } catch (err) {
      console.error('Errore aggiornamento impostazione:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== METODI PER PROFILI AZIENDALI =====

  // Verifica se il setup è stato completato
  async isSetupCompleted() {
    try {
      const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
      const result = stmt.get('setup_completed');
      return result?.value === 'true';
    } catch (err) {
      console.error('Errore verifica setup:', err);
      return false;
    }
  }

  // Crea un profilo aziendale
  async createCompanyProfile(companyName, vatNumber, email, hiddenCashPassword) {
    try {
      // Genera un codice di sicurezza univoco
      const securityCode = this.generateSecurityCode();
      
      const stmt = this.db.prepare(`
        INSERT INTO company_profiles (company_name, vat_number, email, security_code, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(companyName, vatNumber, email, securityCode);
      
      // Salva la password delle casse nascoste (verrà hashata dal metodo updateSetting)
      await this.updateSetting('hidden_cash_password', hiddenCashPassword);
      
      // Marca il setup come completato
      await this.updateSetting('setup_completed', 'true');
      
      return { success: true, companyId: result.lastInsertRowid, securityCode };
    } catch (err) {
      console.error('Errore creazione profilo aziendale:', err);
      return { success: false, error: err.message };
    }
  }

  // Ottiene il profilo aziendale
  async getCompanyProfile() {
    try {
      const stmt = this.db.prepare('SELECT * FROM company_profiles LIMIT 1');
      const profile = stmt.get();
      return profile;
    } catch (err) {
      console.error('Errore recupero profilo aziendale:', err);
      return null;
    }
  }

  // Verifica P.IVA e codice di sicurezza
  async verifyCompanyCredentials(vatNumber, securityCode) {
    try {
      const stmt = this.db.prepare('SELECT * FROM company_profiles WHERE vat_number = ? AND security_code = ?');
      const profile = stmt.get(vatNumber, securityCode);
      return profile;
    } catch (err) {
      console.error('Errore verifica credenziali aziendali:', err);
      return null;
    }
  }

  // Verifica email e codice di sicurezza
  async verifyCompanyCredentialsByEmail(email, securityCode) {
    try {
      const stmt = this.db.prepare('SELECT * FROM company_profiles WHERE email = ? AND security_code = ?');
      const profile = stmt.get(email, securityCode);
      return profile;
    } catch (err) {
      console.error('Errore verifica credenziali aziendali per email:', err);
      return null;
    }
  }

  // Ottieni operatore admin per azienda
  async getAdminOperatorByCompany(companyId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM operators WHERE company_id = ? AND is_admin = 1 LIMIT 1');
      const operator = stmt.get(companyId);
      return operator;
    } catch (err) {
      console.error('Errore recupero operatore admin:', err);
      return null;
    }
  }

  // Genera un codice di sicurezza
  generateSecurityCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Crea token reset password casse nascoste
  async createHiddenPasswordResetToken(companyId, operatorId) {
    try {
      const token = this.generateSecurityCode() + this.generateSecurityCode(); // 16 caratteri
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ora

      const stmt = this.db.prepare(`
        INSERT INTO password_reset_tokens (company_id, operator_id, token, token_type, expires_at, created_at)
        VALUES (?, ?, ?, 'hidden_password', ?, datetime('now'))
      `);
      
      stmt.run(companyId, operatorId, token, expiresAt.toISOString());
      
      return { success: true, token, expiresAt: expiresAt.toISOString() };
    } catch (err) {
      console.error('Errore creazione token reset casse nascoste:', err);
      return { success: false, error: err.message };
    }
  }

  // Verifica token reset password casse nascoste
  async verifyHiddenPasswordResetToken(token) {
    try {
      const stmt = this.db.prepare(`
        SELECT prt.*, o.name as operator_name, cp.company_name
        FROM password_reset_tokens prt
        JOIN operators o ON prt.operator_id = o.id
        JOIN company_profiles cp ON prt.company_id = cp.id
        WHERE prt.token = ? AND prt.token_type = 'hidden_password' AND prt.expires_at > datetime('now')
      `);
      
      const tokenData = stmt.get(token);
      return tokenData;
    } catch (err) {
      console.error('Errore verifica token reset casse nascoste:', err);
      return null;
    }
  }

  // Elimina token reset password casse nascoste
  async deleteHiddenPasswordResetToken(token) {
    try {
      const stmt = this.db.prepare('DELETE FROM password_reset_tokens WHERE token = ? AND token_type = ?');
      stmt.run(token, 'hidden_password');
      return { success: true };
    } catch (err) {
      console.error('Errore eliminazione token reset casse nascoste:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== METODI PER PASSWORD RESET =====

  // Crea un token di reset password
  async createPasswordResetToken(companyId, operatorId) {
    try {
      // Pulisce i token esistenti per questo operatore
      const deleteStmt = this.db.prepare('DELETE FROM password_reset_tokens WHERE operator_id = ?');
      deleteStmt.run(operatorId);

      // Genera un token sicuro
      const token = require('crypto').randomBytes(32).toString('hex');
      
      // Token valido per 1 ora
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const stmt = this.db.prepare(`
        INSERT INTO password_reset_tokens (company_id, operator_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(companyId, operatorId, token, expiresAt);
      return { success: true, token, expiresAt };
    } catch (err) {
      console.error('Errore creazione token reset password:', err);
      return { success: false, error: err.message };
    }
  }

  // Verifica un token di reset password
  async verifyPasswordResetToken(token) {
    try {
      const stmt = this.db.prepare(`
        SELECT prt.*, o.name as operator_name, o.is_admin
        FROM password_reset_tokens prt
        JOIN operators o ON prt.operator_id = o.id
        WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > datetime('now')
      `);
      
      const result = stmt.get(token);
      return result;
    } catch (err) {
      console.error('Errore verifica token reset password:', err);
      return null;
    }
  }

  // Usa un token di reset password e aggiorna la password
  async usePasswordResetToken(token, newPassword) {
    try {
      const tokenData = await this.verifyPasswordResetToken(token);
      if (!tokenData) {
        return { success: false, error: 'Token non valido o scaduto' };
      }

      // Hash della nuova password
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      // Aggiorna la password dell'operatore
      const updateStmt = this.db.prepare('UPDATE operators SET password_hash = ? WHERE id = ?');
      updateStmt.run(hashedPassword, tokenData.operator_id);

      // Marca il token come usato
      const markUsedStmt = this.db.prepare('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?');
      markUsedStmt.run(tokenData.id);

      return { success: true };
    } catch (err) {
      console.error('Errore uso token reset password:', err);
      return { success: false, error: err.message };
    }
  }

  // Pulisce i token scaduti
  async cleanupExpiredTokens() {
    try {
      const stmt = this.db.prepare('DELETE FROM password_reset_tokens WHERE expires_at < datetime("now")');
      const result = stmt.run();
      return { success: true, deletedCount: result.changes };
    } catch (err) {
      console.error('Errore pulizia token scaduti:', err);
      return { success: false, error: err.message };
    }
  }

  // Ottiene un operatore per nome e azienda (per il reset password)
  async getOperatorByNameAndCompany(name, companyId) {
    try {
      const stmt = this.db.prepare(`
        SELECT o.id, o.name, o.is_admin, o.can_access_hidden, o.created_at, cp.company_name
        FROM operators o
        JOIN company_profiles cp ON o.company_id = cp.id
        WHERE o.name = ? AND o.company_id = ?
      `);
      const operator = stmt.get(name, companyId);
      return operator;
    } catch (err) {
      console.error('Errore recupero operatore per nome e azienda:', err);
      return null;
    }
  }

  // Chiude la connessione al database
  close() {
    if (this.db) {
      this.db.close();
      console.log('Database chiuso');
    }
  }
}

module.exports = DatabaseManager;