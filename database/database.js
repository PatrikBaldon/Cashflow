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
      const updateStmt = this.db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?');
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

  // Chiude la connessione al database
  close() {
    if (this.db) {
      this.db.close();
      console.log('Database chiuso');
    }
  }
}

module.exports = DatabaseManager;