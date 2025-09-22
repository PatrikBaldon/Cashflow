const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'registro_contanti.db');
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  // Inizializza il database
  async initialize() {
    try {
      this.db = new Database(this.dbPath);
      console.log('Database connesso con successo');
      await this.createTables();
    } catch (err) {
      console.error('Errore apertura database:', err);
      throw err;
    }
  }

  // Crea le tabelle se non esistono
  async createTables() {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schema);
      console.log('Tabelle create/verificate con successo');
    } catch (err) {
      console.error('Errore creazione tabelle:', err);
      throw err;
    }
  }

  // Gestisce la chiave di crittografia
  getOrCreateEncryptionKey() {
    const keyPath = path.join(__dirname, '.encryption_key');
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8');
    } else {
      const key = CryptoJS.lib.WordArray.random(256/8).toString();
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
  async createUser(username, password, role = 'user') {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
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
        const hashedPassword = await bcrypt.hash(updates.password, 10);
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

  // Ottiene i pagamenti con filtri
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

  // Aggiorna un pagamento
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

  // Ottiene statistiche
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
      const stmt = this.db.prepare('SELECT * FROM operators WHERE name = ?');
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
        name: operator.name,
        isAdmin: operator.is_admin,
        createdAt: operator.created_at,
        lastLogin: operator.last_login
      };
    } catch (err) {
      console.error('Errore autenticazione operatore:', err);
      throw err;
    }
  }

  // Ottiene tutti gli operatori
  async getOperators() {
    try {
      const stmt = this.db.prepare('SELECT id, name, is_admin, created_at, last_login FROM operators ORDER BY created_at DESC');
      const operators = stmt.all();
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
  async createOperator(name, password, isAdmin = false) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = this.db.prepare(`
        INSERT INTO operators (name, password_hash, is_admin, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(name, hashedPassword, isAdmin);
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
        const hashedPassword = await bcrypt.hash(updates.password, 10);
        fields.push('password_hash = ?');
        values.push(hashedPassword);
      }
      if (updates.isAdmin !== undefined) {
        fields.push('is_admin = ?');
        values.push(updates.isAdmin);
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

  // Ottiene tutte le casse
  async getCashRegisters(includeHidden = false) {
    try {
      let query = 'SELECT * FROM cash_registers';
      const params = [];
      
      if (!includeHidden) {
        query += ' WHERE is_hidden = FALSE';
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
  async createCashRegister(name, isHidden = false, hiddenPassword = null, description = '', createdBy = 1) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO cash_registers (name, is_hidden, hidden_password, description, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(name, isHidden, hiddenPassword, description, createdBy);
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
        values.push(updates.isHidden);
      }
      if (updates.hiddenPassword !== undefined) {
        fields.push('hidden_password = ?');
        values.push(updates.hiddenPassword);
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

  // Aggiorna un'impostazione
  async updateSetting(key, value) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `);
      stmt.run(key, value);
      return { success: true };
    } catch (err) {
      console.error('Errore aggiornamento impostazione:', err);
      return { success: false, error: err.message };
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