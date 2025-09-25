# Guida alla Configurazione - Registro Contanti Future Dance School

## Panoramica del Sistema

Il **Registro Contanti** è un'applicazione desktop sviluppata con Electron che gestisce i pagamenti in contanti per la Future Dance School. Il sistema è progettato per essere multi-aziendale con gestione centralizzata degli utenti e delle casse.

### Architettura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Main Process  │    │   Database      │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   Services      │
                        │   (Auth/Cash/   │
                        │    Excel/User)  │
                        └─────────────────┘
```

## Componenti Principali

### 1. Database (SQLite)
- **File**: `database/registro_contanti.db`
- **Schema**: `database/schema.sql`
- **Gestione**: `database/database.js`

**Tabelle principali:**
- `company_profiles`: Profili aziendali
- `operators`: Operatori per azienda
- `cash_registers`: Casse per azienda
- `payments`: Pagamenti registrati
- `settings`: Configurazioni globali
- `password_reset_tokens`: Token per reset password

### 2. Autenticazione e Autorizzazione
- **File**: `auth/auth.js`
- **Gestione utenti multi-aziendali**
- **Sistema di permessi per casse nascoste**
- **Reset password con P.IVA e codice di sicurezza**

### 3. Servizi Backend
- **CashService**: Gestione casse e pagamenti
- **UserService**: Gestione utenti e impostazioni
- **ExcelService**: Export dati in Excel
- **SetupService**: Configurazione iniziale

### 4. Frontend (React + TypeScript)
- **Framework**: React 18 + TypeScript
- **UI**: Tailwind CSS + Lucide React
- **State Management**: Zustand
- **Routing**: React Router DOM

## Configurazione Iniziale

### Prerequisiti

1. **Node.js** (versione 18 o superiore)
2. **npm** o **yarn**
3. **Git** (per clonare il repository)

### Installazione

```bash
# Clona il repository
git clone <repository-url>
cd "REGISTRO CONTANTI"

# Installa le dipendenze principali
npm install

# Installa le dipendenze del frontend
cd frontend
npm install
cd ..
```

### Configurazione dell'Ambiente

1. **Variabili d'ambiente** (opzionale):
   ```bash
   # Crea file .env nella root del progetto
   NODE_ENV=production
   ```

2. **Configurazione del database**:
   - Il database SQLite viene creato automaticamente al primo avvio
   - Il file si trova in `database/registro_contanti.db`
   - Le tabelle vengono create automaticamente dal file `schema.sql`

## Setup Iniziale dell'Applicazione

### 1. Avvio dell'Applicazione

```bash
# Modalità sviluppo
npm run dev

# Modalità produzione
npm run build
npm start
```

### 2. Configurazione Aziendale

Al primo avvio, l'applicazione mostrerà la schermata di setup:

1. **Dati Aziendali**:
   - Nome azienda
   - P.IVA (validazione automatica per P.IVA italiana)
   - Email aziendale

2. **Password Casse Nascoste**:
   - Password per accedere alle casse riservate/nascoste
   - Conferma password (deve coincidere)
   - **IMPORTANTE**: Salvare questa password in luogo sicuro
   - Può essere modificata successivamente dall'amministratore

3. **Codice di Sicurezza**:
   - Viene generato automaticamente un codice di 8 caratteri
   - **IMPORTANTE**: Salvare questo codice in luogo sicuro
   - Serve per il reset password degli operatori

4. **Utente Amministratore**:
   - Username: `admin`
   - Password: `admin123`
   - **IMPORTANTE**: Cambiare la password dopo il primo accesso

### 3. Configurazione Post-Setup

Dopo il setup iniziale:

1. **Accedi con l'utente admin**
2. **Cambia la password admin** (Impostazioni → Gestione Utenti)
3. **Crea gli operatori necessari**
4. **Configura le casse** (pubbliche e/o nascoste)

## Gestione Utenti e Permessi

### Tipi di Utenti

1. **Amministratore**:
   - Accesso completo a tutte le funzioni
   - Gestione utenti e impostazioni
   - Accesso alle casse nascoste

2. **Operatore Standard**:
   - Gestione pagamenti nelle casse pubbliche
   - Visualizzazione statistiche

3. **Operatore con Accesso Nascosto**:
   - Tutte le funzioni dell'operatore standard
   - Accesso alle casse nascoste (con password aggiuntiva)

### Creazione Utenti

```javascript
// Esempio di creazione utente tramite API
const newUser = {
  name: "nome_operatore",
  password: "password_sicura",
  isAdmin: false,
  canAccessHidden: false
}
```

## Gestione Casse

### Casse Pubbliche
- Visibili a tutti gli operatori
- Gestione pagamenti standard
- Statistiche pubbliche

### Casse Nascoste
- Visibili solo agli operatori autorizzati
- Richiedono password aggiuntiva per l'accesso
- Password predefinita: `admin123`
- Ideali per pagamenti sensibili o riservati

### Creazione Casse

```javascript
// Esempio di creazione cassa
const newCashRegister = {
  name: "Cassa Principale",
  isHidden: false,
  description: "Cassa per pagamenti regolari"
}
```

## Configurazione Avanzata

### 1. Sicurezza

#### Password Casse Nascoste
- **Memorizzazione**: Tabella `settings` con chiave `hidden_cash_password`
- **Impostazione**: Durante il setup iniziale dell'azienda
- **Modifica**: Solo amministratori possono modificarla
- **Fallback**: `admin123` se non impostata

```javascript
// auth/auth.js - ora legge dal database
const settings = await this.db.getSettings();
const hiddenPasswordSetting = settings.find(s => s.key === 'hidden_cash_password');
const hiddenPassword = hiddenPasswordSetting ? hiddenPasswordSetting.value : 'admin123';
```

#### Crittografia Database
- **Chiave**: Generata automaticamente in `database/.encryption_key`
- **Algoritmo**: AES-256
- **File**: `database/database.js` (metodi encrypt/decrypt)

### 2. Backup e Manutenzione

#### Backup Automatico
- **Abilitato**: Per default
- **Intervallo**: 24 ore
- **Cartella**: `data/backups/`
- **Configurazione**: Tabella `settings`

#### Backup Manuale
```bash
# Copia il file database
cp database/registro_contanti.db data/backups/backup_$(date +%Y%m%d_%H%M%S).db
```

### 3. Export Dati

#### Export Excel
- **Singola cassa**: Tutti i pagamenti di una cassa specifica
- **Tutte le casse**: Pagamenti di tutte le casse (incluse nascoste se sbloccate)
- **Formato**: XLSX con fogli separati per cassa
- **Cartella di destinazione**: Downloads dell'utente

## Configurazione di Sviluppo

### Struttura Progetto

```
REGISTRO CONTANTI/
├── main.js                 # Processo principale Electron
├── preload.js             # Bridge tra main e renderer
├── package.json           # Dipendenze e script
├── auth/                  # Sistema autenticazione
├── database/              # Database e schema
├── services/              # Servizi backend
├── frontend/              # Applicazione React
│   ├── src/
│   │   ├── components/    # Componenti React
│   │   ├── stores/        # State management (Zustand)
│   │   └── utils/         # Utility functions
│   └── package.json       # Dipendenze frontend
└── dist/                  # Build di produzione
```

### Script Disponibili

```bash
# Sviluppo
npm run dev                 # Avvia frontend + Electron in dev
npm run dev:frontend        # Solo frontend (Vite dev server)

# Build
npm run build               # Build completo
npm run build:frontend      # Solo frontend
npm run build:win           # Build per Windows
npm run build:mac           # Build per macOS
npm run build:linux         # Build per Linux

# Test
npm run test                # Test frontend
npm run lint                # Linting

# Pulizia
npm run clean               # Pulisce cartelle dist
```

### Configurazione Vite (Frontend)

**File**: `frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### Configurazione Electron Builder

**File**: `package.json` (sezione build)

```json
{
  "build": {
    "appId": "com.futuredanceschool.cashflow",
    "productName": "Registro Contanti",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "auth/**/*",
      "database/**/*",
      "services/**/*",
      "frontend/dist/**/*",
      "assets/**/*",
      "node_modules/**/*"
    ]
  }
}
```

## Risoluzione Problemi

### Problemi Comuni

1. **Database non si crea**:
   - Verificare permessi di scrittura nella cartella `database/`
   - Controllare che SQLite sia installato

2. **Frontend non si carica**:
   - Eseguire `npm run build:frontend`
   - Verificare che il file `frontend/dist/index.html` esista

3. **Errori di autenticazione**:
   - Verificare che il setup sia completato
   - Controllare le credenziali in `database/registro_contanti.db`

4. **Export Excel non funziona**:
   - Verificare che la cartella Downloads sia accessibile
   - Controllare i permessi di scrittura

### Log e Debug

1. **Log Console**:
   - In modalità sviluppo: Console del browser
   - In produzione: Log di sistema

2. **Database Debug**:
   ```bash
   # Aprire il database con SQLite browser
   sqlite3 database/registro_contanti.db
   .tables
   .schema
   ```

3. **Reset Completo**:
   ```bash
   # ATTENZIONE: Cancella tutti i dati
   rm database/registro_contanti.db
   rm database/.encryption_key
   # Riavviare l'applicazione per nuovo setup
   ```

## Sicurezza e Best Practices

### 1. Password
- Cambiare password predefinite
- Usare password complesse per admin
- Implementare policy di scadenza password

### 2. Backup
- Backup regolari del database
- Test di ripristino periodici
- Archiviazione backup in location sicure

### 3. Accesso
- Limitare accesso fisico al computer
- Usare account utente limitati per l'esecuzione
- Implementare timeout di sessione

### 4. Aggiornamenti
- Mantenere aggiornate le dipendenze
- Testare aggiornamenti in ambiente di sviluppo
- Backup prima di ogni aggiornamento

## Supporto e Manutenzione

### File di Configurazione Importanti

1. **Database**: `database/registro_contanti.db`
2. **Chiave crittografia**: `database/.encryption_key`
3. **Impostazioni**: Tabella `settings` nel database
4. **Log**: Console del sistema operativo

### Contatti Supporto

- **Sviluppatore**: Future Dance School
- **Versione**: 2.0.0
- **Licenza**: MIT

---

*Questa guida è stata generata automaticamente analizzando il codice sorgente del sistema Registro Contanti v2.0.0*
