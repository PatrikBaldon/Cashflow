# 💰 Registro Contanti - Future Dance School

<div align="center">
  <img src="https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</div>

<div align="center">
  <h3>Applicazione desktop per la gestione del registro contanti</h3>
  <p>Soluzione completa per la gestione dei pagamenti e del flusso di cassa della Future Dance School</p>
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

## 📸 Screenshots

<div align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="400">
  <img src="docs/screenshots/payments.png" alt="Gestione Pagamenti" width="400">
</div>

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
- **Winston** - Logging
- **Bcryptjs** - Crittografia password
- **XLSX** - Export Excel

## 📋 Prerequisiti

- **Node.js** 18.0.0 o superiore
- **npm** 8.0.0 o superiore
- **Git** per il controllo versione

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
├── 📁 src/                    # Codice sorgente principale
│   ├── 📁 components/         # Componenti React
│   ├── 📁 stores/            # Gestione stato (Zustand)
│   ├── 📁 utils/             # Utility e helper
│   └── 📁 test/              # Test unitari
├── 📁 services/              # Servizi backend
│   ├── cashService.js        # Gestione pagamenti
│   ├── userService.js        # Gestione utenti
│   └── excelService.js       # Export Excel
├── 📁 database/              # Database e schema
├── 📁 auth/                  # Sistema autenticazione
├── 📁 .github/               # GitHub Actions
├── 📁 docs/                  # Documentazione
└── 📄 main.js               # Entry point Electron
```

## 🔧 Configurazione

### Variabili d'Ambiente
Copia `env.example` in `.env` e configura:

```env
NODE_ENV=production
DB_PATH=./database/registro_contanti.db
LOG_LEVEL=info
```

### Database
Il database SQLite viene creato automaticamente al primo avvio. Lo schema è definito in `database/schema.sql`.

## 🚀 Distribuzione

### GitHub Actions (Automatico)
```bash
# Crea una release
git tag v2.0.0
git push origin v2.0.0
```

### Build Manuale
```bash
# Build per tutte le piattaforme
npm run build:all

# Build per Windows
npm run build:win
```

## 📖 Documentazione

- [Guida Installazione](docs/INSTALLATION.md)
- [Guida Distribuzione](DEPLOYMENT.md)
- [API Reference](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Changelog

### v2.0.0
- ✨ Nuova interfaccia React con TypeScript
- 🔒 Sistema autenticazione migliorato
- 📊 Dashboard con statistiche avanzate
- 📤 Export Excel ottimizzato
- 🖥️ Supporto multi-piattaforma

### v1.0.0
- 🎉 Prima release
- 💳 Gestione pagamenti base
- 👥 Sistema utenti
- 📊 Statistiche semplici

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👥 Team

- **Patrik Baldon** - Sviluppatore principale
- **Future Dance School** - Cliente

## 📞 Supporto

Per supporto o domande:
- 📧 Email: support@futuredanceschool.com
- 🐛 Issues: [GitHub Issues](https://github.com/PatrikBaldon/Cashflow/issues)
- 📖 Docs: [Documentazione](docs/)

---

<div align="center">
  <p>Fatto con ❤️ per Future Dance School</p>
  <p>© 2024 Future Dance School. Tutti i diritti riservati.</p>
</div>