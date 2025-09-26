# 💰 Registro Contanti

<div align="center">
  <img src="https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</div>

<div align="center">
  <h3>Applicazione desktop per la gestione del registro contanti</h3>
  <p>Soluzione semplice per la gestione dei pagamenti e del flusso di cassa</p>
</div>

---

## 🚀 Caratteristiche Principali

- **💳 Gestione Pagamenti**: Registrazione completa di entrate e uscite
- **👥 Gestione Utenti**: Sistema di autenticazione multi-utente
- **📊 Statistiche**: Dashboard con grafici e analisi dettagliate
- **📤 Export Excel**: Esportazione dati in formato Excel
- **🔒 Sicurezza**: Database locale SQLite con crittografia
- **🖥️ Multi-piattaforma**: Windows, macOS e Linux
- **⚡ Offline**: Funziona senza connessione internet

## 🛠️ Tecnologie Utilizzate

### Frontend
- **React 18** - Libreria UI
- **TypeScript** - Tipizzazione statica
- **Tailwind CSS** - Framework CSS
- **Zustand** - Gestione stato
- **Recharts** - Grafici e visualizzazioni
- **React Hook Form** - Gestione form
- **Lucide React** - Icone

### Backend
- **Electron** - Framework desktop
- **Node.js** - Runtime JavaScript
- **SQLite3** - Database locale
- **Bcryptjs** - Crittografia password
- **XLSX** - Export Excel

## 📋 Prerequisiti

- **Node.js** 18.0.0 o superiore
- **npm** 8.0.0 o superiore

## ⚡ Installazione Rapida

### 1. Clona il Repository
```bash
git clone https://github.com/PatrikBaldon/Cashflow.git
cd Cashflow
```

### 2. Installa le Dipendenze
```bash
# Installa dipendenze principali
npm install

# Installa dipendenze frontend
cd frontend
npm install
cd ..
```

### 3. Avvia l'Applicazione
```bash
# Modalità sviluppo
npm run dev

# Modalità produzione
npm run build
npm start
```

## 🏗️ Script Disponibili

| Script | Descrizione |
|--------|-------------|
| `npm run dev` | Avvia in modalità sviluppo |
| `npm run build` | Compila per produzione |
| `npm run build:win` | Compila per Windows |
| `npm run build:mac` | Compila per macOS |
| `npm run build:linux` | Compila per Linux |
| `npm run dist` | Build completo e pulizia |
| `npm test` | Esegue i test |
| `npm run lint` | Controlla il codice |

## 📁 Struttura del Progetto

```
Cashflow/
├── 📁 frontend/              # Applicazione React
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componenti React
│   │   ├── 📁 stores/        # Gestione stato (Zustand)
│   │   └── 📁 utils/         # Utility e helper
│   └── 📄 package.json       # Dipendenze frontend
├── 📁 services/              # Servizi backend
│   ├── cashService.js        # Gestione pagamenti
│   ├── userService.js        # Gestione utenti
│   └── excelService.js       # Export Excel
├── 📁 database/              # Database e schema
├── 📁 auth/                  # Sistema autenticazione
└── 📄 main.js               # Entry point Electron
```

## 🔧 Configurazione

### Database
Il database SQLite viene creato automaticamente al primo avvio. Lo schema è definito in `database/schema.sql`.

### Setup Iniziale
Al primo avvio, l'applicazione mostrerà la schermata di setup per configurare:
- Dati aziendali
- Password casse nascoste
- Codice di sicurezza
- Utente amministratore

## 🚀 Distribuzione

### Build Manuale
```bash
# Build per tutte le piattaforme
npm run build:all

# Build per Windows
npm run build:win
```

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT.

## 👥 Autore

- **Patrik Baldon** - Sviluppatore

## 📞 Supporto

Per miglioramenti o suggerimenti, apri una issue su GitHub.

---

<div align="center">
  <p>Fatto con ❤️</p>
</div>