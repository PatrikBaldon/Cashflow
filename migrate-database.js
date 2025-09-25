const Database = require('better-sqlite3');
const path = require('path');

async function migrateDatabase() {
  const dbPath = path.join(__dirname, 'database', 'registro_contanti.db');
  const db = new Database(dbPath);
  
  console.log('Iniziando migrazione database...');
  
  try {
    // Verifica se la tabella company_profiles esiste
    const companyProfilesExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='company_profiles'
    `).get();
    
    if (!companyProfilesExists) {
      console.log('Creando tabella company_profiles...');
      db.exec(`
        CREATE TABLE company_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_name TEXT NOT NULL,
          vat_number TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          security_code TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    // Verifica se la colonna company_id esiste nella tabella operators
    const operatorsColumns = db.prepare(`
      PRAGMA table_info(operators)
    `).all();
    
    const hasCompanyId = operatorsColumns.some(col => col.name === 'company_id');
    const hasCanAccessHidden = operatorsColumns.some(col => col.name === 'can_access_hidden');
    
    if (!hasCompanyId) {
      console.log('Aggiungendo colonna company_id alla tabella operators...');
      db.exec(`ALTER TABLE operators ADD COLUMN company_id INTEGER`);
    }
    
    if (!hasCanAccessHidden) {
      console.log('Aggiungendo colonna can_access_hidden alla tabella operators...');
      db.exec(`ALTER TABLE operators ADD COLUMN can_access_hidden BOOLEAN DEFAULT FALSE`);
    }
    
    // Verifica se la colonna company_id esiste nella tabella cash_registers
    const cashRegistersColumns = db.prepare(`
      PRAGMA table_info(cash_registers)
    `).all();
    
    const cashHasCompanyId = cashRegistersColumns.some(col => col.name === 'company_id');
    
    if (!cashHasCompanyId) {
      console.log('Aggiungendo colonna company_id alla tabella cash_registers...');
      db.exec(`ALTER TABLE cash_registers ADD COLUMN company_id INTEGER`);
    }
    
    // Verifica se la tabella password_reset_tokens esiste
    const passwordResetTokensExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='password_reset_tokens'
    `).get();
    
    if (!passwordResetTokensExists) {
      console.log('Creando tabella password_reset_tokens...');
      db.exec(`
        CREATE TABLE password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_id INTEGER NOT NULL,
          operator_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES company_profiles(id) ON DELETE CASCADE,
          FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE
        );
      `);
    }
    
    // Se ci sono operatori esistenti senza company_id, crea un profilo aziendale di default
    const existingOperators = db.prepare(`
      SELECT COUNT(*) as count FROM operators WHERE company_id IS NULL
    `).get();
    
    if (existingOperators.count > 0) {
      console.log('Trovati operatori esistenti senza company_id. Creando profilo aziendale di default...');
      
      // Crea un profilo aziendale di default
      const insertCompany = db.prepare(`
        INSERT INTO company_profiles (company_name, vat_number, email, security_code, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      const securityCode = generateSecurityCode();
      const result = insertCompany.run(
        'Azienda di Default',
        '12345678901',
        'admin@example.com',
        securityCode
      );
      
      const companyId = result.lastInsertRowid;
      console.log(`Profilo aziendale creato con ID: ${companyId}`);
      console.log(`Codice di sicurezza: ${securityCode}`);
      
      // Aggiorna tutti gli operatori esistenti con il company_id
      const updateOperators = db.prepare(`
        UPDATE operators SET company_id = ? WHERE company_id IS NULL
      `);
      updateOperators.run(companyId);
      
      // Aggiorna tutte le casse esistenti con il company_id
      const updateCashRegisters = db.prepare(`
        UPDATE cash_registers SET company_id = ? WHERE company_id IS NULL
      `);
      updateCashRegisters.run(companyId);
      
      // Imposta il primo operatore come admin con accesso alle casse nascoste
      const firstOperator = db.prepare(`
        SELECT id FROM operators WHERE company_id = ? ORDER BY created_at ASC LIMIT 1
      `).get(companyId);
      
      if (firstOperator) {
        const updateFirstOperator = db.prepare(`
          UPDATE operators SET is_admin = TRUE, can_access_hidden = TRUE WHERE id = ?
        `);
        updateFirstOperator.run(firstOperator.id);
        console.log('Primo operatore impostato come amministratore');
      }
    }
    
    // Aggiorna l'impostazione setup_completed
    const updateSetting = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    updateSetting.run('setup_completed', 'true');
    
    console.log('Migrazione completata con successo!');
    
  } catch (error) {
    console.error('Errore durante la migrazione:', error);
    throw error;
  } finally {
    db.close();
  }
}

function generateSecurityCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Esegui la migrazione se il file viene eseguito direttamente
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('Migrazione completata!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Errore migrazione:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };
