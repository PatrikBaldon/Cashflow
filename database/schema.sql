-- Registro Contanti Database Schema
-- Supporta casse pubbliche e nascoste

-- Tabella operatori
CREATE TABLE IF NOT EXISTS operators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Tabella casse
CREATE TABLE IF NOT EXISTS cash_registers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    hidden_password TEXT, -- Password per accedere alle casse nascoste
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES operators(id)
);

-- Tabella pagamenti
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cash_register_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    operator_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id)
);

-- Tabella configurazioni
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_payments_cash_register ON payments(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_operator ON payments(operator_id);
CREATE INDEX IF NOT EXISTS idx_cash_registers_hidden ON cash_registers(is_hidden);

-- Inserimento dati iniziali
INSERT OR IGNORE INTO settings (key, value) VALUES 
('app_version', '2.0.0'),
('default_hidden_password', 'admin123'), -- Password di default per casse nascoste
('backup_enabled', 'true'),
('backup_interval_hours', '24');

-- Inserimento operatore admin di default
INSERT OR IGNORE INTO operators (name, password_hash, is_admin) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE); -- password: admin123

-- Inserimento cassa principale pubblica
INSERT OR IGNORE INTO cash_registers (name, is_hidden, description) VALUES 
('Cassa Principale', FALSE, 'Cassa principale per i pagamenti regolari');

