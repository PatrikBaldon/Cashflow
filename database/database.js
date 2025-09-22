const sqlite3 = require('sqlite3').verbose();
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
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Errore apertura database:', err);
          reject(err);
        } else {
          console.log('Database connesso con successo');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  // Crea le tabelle se non esistono
  async createTables() {
    return new Promise((resolve, reject) => {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('Errore creazione tabelle:', err);
          reject(err);
        } else {
          console.log('Tabelle create/verificate con successo');
          resolve();
        }
      });
    });
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

  // Cripta dati sensibili
  encrypt(text) {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  // Decripta dati sensibili
  decrypt(encryptedText) {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // OPERATORI
  async createOperator(name, password, isAdmin = false) {
    const passwordHash = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO operators (name, password_hash, is_admin) VALUES (?, ?, ?)`;
      this.db.run(sql, [name, passwordHash, isAdmin], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, isAdmin });
      });
    });
  }

  async getOperatorById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, is_admin, created_at, last_login FROM operators WHERE id = ?`;
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateOperator(id, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        if (key === 'password') {
          // Hash della password se fornita
          bcrypt.hash(updates[key], 10).then(hash => {
            fields.push('password_hash = ?');
            values.push(hash);
          });
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });

    if (fields.length === 0) return { success: false, message: 'Nessun campo da aggiornare' };

    values.push(id);
    const sql = `UPDATE operators SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  async deleteOperator(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM operators WHERE id = ?`;
      this.db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  async authenticateOperator(name, password) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM operators WHERE name = ?`;
      this.db.get(sql, [name], async (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          const isValid = await bcrypt.compare(password, row.password_hash);
          if (isValid) {
            // Aggiorna ultimo login
            this.db.run(`UPDATE operators SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [row.id]);
            resolve({ id: row.id, name: row.name, isAdmin: row.is_admin });
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  async getOperators() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, name, is_admin, created_at, last_login FROM operators ORDER BY name`;
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // CASSE
  async createCashRegister(name, isHidden = false, hiddenPassword = null, description = '', createdBy) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO cash_registers (name, is_hidden, hidden_password, description, created_by) VALUES (?, ?, ?, ?, ?)`;
      this.db.run(sql, [name, isHidden, hiddenPassword, description, createdBy], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, isHidden, description });
      });
    });
  }

  async getCashRegisters(includeHidden = false, hiddenPassword = null) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM cash_registers WHERE 1=1`;
      const params = [];

      if (!includeHidden) {
        // Mostra solo casse pubbliche
        sql += ` AND is_hidden = FALSE`;
      }
      // Se includeHidden = true, mostra TUTTE le casse (pubbliche + nascoste)
      // Non serve verificare la password qui, la verifica è fatta nel backend

      sql += ` ORDER BY name`;

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Errore query casse:', err);
          reject(err);
        } else {
          console.log(`Query casse - includeHidden: ${includeHidden}, SQL: ${sql}, Risultati: ${rows.length}`);
          console.log('Casse trovate:', rows.map(r => ({ id: r.id, name: r.name, is_hidden: r.is_hidden })));
          resolve(rows);
        }
      });
    });
  }

  async getCashRegisterById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM cash_registers WHERE id = ?`;
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateCashRegister(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.is_hidden !== undefined) {
        fields.push('is_hidden = ?');
        values.push(updates.is_hidden);
      }
      if (updates.hidden_password !== undefined) {
        fields.push('hidden_password = ?');
        values.push(updates.hidden_password);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }

      if (fields.length === 0) {
        resolve({ success: true, message: 'Nessun campo da aggiornare' });
        return;
      }

      values.push(id);
      const sql = `UPDATE cash_registers SET ${fields.join(', ')} WHERE id = ?`;

      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  async deleteCashRegister(id) {
    return new Promise((resolve, reject) => {
      // Prima elimina tutti i pagamenti associati alla cassa
      const deletePaymentsSql = `DELETE FROM payments WHERE cash_register_id = ?`;
      this.db.run(deletePaymentsSql, [id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Poi elimina la cassa
        const deleteCashSql = `DELETE FROM cash_registers WHERE id = ?`;
        this.db.run(deleteCashSql, [id], function(err) {
          if (err) reject(err);
          else resolve({ success: true, changes: this.changes });
        });
      });
    });
  }

  // PAGAMENTI
  async createPayment(cashRegisterId, customerName, paymentDate, amount, reason, operatorId) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO payments (cash_register_id, customer_name, payment_date, amount, reason, operator_id) VALUES (?, ?, ?, ?, ?, ?)`;
      this.db.run(sql, [cashRegisterId, customerName, paymentDate, amount, reason, operatorId], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  async getPayments(cashRegisterId, startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT p.*, o.name as operator_name, cr.name as cash_register_name 
        FROM payments p 
        JOIN operators o ON p.operator_id = o.id 
        JOIN cash_registers cr ON p.cash_register_id = cr.id 
        WHERE p.cash_register_id = ?
      `;
      const params = [cashRegisterId];

      if (startDate) {
        sql += ` AND p.payment_date >= ?`;
        params.push(startDate);
      }
      if (endDate) {
        sql += ` AND p.payment_date <= ?`;
        params.push(endDate);
      }

      sql += ` ORDER BY p.payment_date DESC, p.created_at DESC`;

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getPaymentsByCashRegister(cashRegisterId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, o.name as operator_name, cr.name as cash_register_name 
        FROM payments p 
        JOIN operators o ON p.operator_id = o.id 
        JOIN cash_registers cr ON p.cash_register_id = cr.id 
        WHERE p.cash_register_id = ?
        ORDER BY p.payment_date DESC, p.id DESC
      `;
      
      this.db.all(sql, [cashRegisterId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async updatePayment(paymentId, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return { success: false, message: 'Nessun campo da aggiornare' };

    values.push(paymentId);
    const sql = `UPDATE payments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  async deletePayment(paymentId) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM payments WHERE id = ?`;
      this.db.run(sql, [paymentId], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  // STATISTICHE
  async getDailyTotal(cashRegisterId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return new Promise((resolve, reject) => {
      const sql = `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE cash_register_id = ? AND payment_date = ?`;
      this.db.get(sql, [cashRegisterId, targetDate], (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
  }

  async getWeeklyTotal(cashRegisterId, weekStart = null) {
    const start = weekStart || this.getWeekStart();
    const end = this.addDays(start, 6);
    return new Promise((resolve, reject) => {
      const sql = `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE cash_register_id = ? AND payment_date BETWEEN ? AND ?`;
      this.db.get(sql, [cashRegisterId, start, end], (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
  }

  async getMonthlyTotal(cashRegisterId, year = null, month = null) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || (now.getMonth() + 1);
    
    return new Promise((resolve, reject) => {
      const sql = `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE cash_register_id = ? AND strftime('%Y', payment_date) = ? AND strftime('%m', payment_date) = ?`;
      this.db.get(sql, [cashRegisterId, targetYear.toString(), targetMonth.toString().padStart(2, '0')], (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
  }

  // IMPOSTAZIONI
  async getSettings() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT key, value FROM settings`;
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async updateSetting(key, value) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`;
      this.db.run(sql, [key, value], function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT value FROM settings WHERE key = ?`;
      this.db.get(sql, [key], (err, row) => {
        if (err) reject(err);
        else resolve(row?.value);
      });
    });
  }

  // UTILITY
  getWeekStart(date = null) {
    const d = date ? new Date(date) : new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  // Chiude la connessione
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = DatabaseManager;

