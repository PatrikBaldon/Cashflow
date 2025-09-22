# 📦 Guida all'Installazione

## 🖥️ Requisiti di Sistema

### Windows
- **OS**: Windows 10 o superiore (64-bit)
- **RAM**: 4 GB minimo, 8 GB raccomandato
- **Spazio**: 500 MB liberi
- **Processore**: Intel Core i3 o equivalente

### macOS
- **OS**: macOS 10.15 (Catalina) o superiore
- **RAM**: 4 GB minimo, 8 GB raccomandato
- **Spazio**: 500 MB liberi
- **Processore**: Intel o Apple Silicon (M1/M2)

### Linux
- **OS**: Ubuntu 18.04+ / Debian 10+ / Fedora 32+ / Arch Linux
- **RAM**: 4 GB minimo, 8 GB raccomandato
- **Spazio**: 500 MB liberi
- **Processore**: x64 o ARM64

## 🚀 Installazione da Release

### 1. Download
1. Vai su [GitHub Releases](https://github.com/PatrikBaldon/Cashflow/releases)
2. Scarica il file appropriato per il tuo sistema operativo:
   - **Windows**: `Registro-Contanti-Setup-*.exe`
   - **macOS**: `Registro-Contanti-*.dmg`
   - **Linux**: `Registro-Contanti-*.AppImage`

### 2. Installazione

#### Windows
1. Esegui il file `.exe` scaricato
2. Segui la procedura guidata di installazione
3. L'applicazione sarà disponibile nel menu Start

#### macOS
1. Apri il file `.dmg` scaricato
2. Trascina l'applicazione nella cartella Applicazioni
3. Esegui l'applicazione dal Launchpad o Finder

#### Linux
1. Rendi eseguibile il file: `chmod +x Registro-Contanti-*.AppImage`
2. Esegui: `./Registro-Contanti-*.AppImage`

## 🔧 Installazione da Sorgente

### Prerequisiti
- **Node.js** 18.0.0 o superiore
- **npm** 8.0.0 o superiore
- **Git** per il controllo versione

### 1. Clona il Repository
```bash
git clone https://github.com/PatrikBaldon/Cashflow.git
cd Cashflow
```

### 2. Installa le Dipendenze
```bash
# Dipendenze principali
npm install

# Dipendenze frontend
cd frontend
npm install
cd ..
```

### 3. Build e Avvio
```bash
# Modalità sviluppo
npm run dev

# Build per produzione
npm run build
npm start
```

## ⚙️ Configurazione Iniziale

### 1. Primo Avvio
1. Avvia l'applicazione
2. Crea un account amministratore
3. Configura le impostazioni base

### 2. Database
- Il database SQLite viene creato automaticamente
- Posizione: `./database/registro_contanti.db`
- Backup automatici in `./data/backups/`

### 3. Utenti
- Crea il primo utente amministratore
- Aggiungi altri utenti se necessario
- Ogni utente ha accesso ai propri dati

## 🔒 Sicurezza

### Password
- Usa password complesse (minimo 8 caratteri)
- Include numeri, lettere maiuscole e minuscole
- Evita password comuni

### Backup
- I backup vengono creati automaticamente
- Posizione: `./data/backups/`
- Frequenza: Giornaliera

### Database
- Database locale SQLite
- Crittografia delle password
- Nessun dato inviato online

## 🐛 Troubleshooting

### App Non Si Avvia
1. **Windows**: Disabilita temporaneamente l'antivirus
2. **macOS**: Apri "Preferenze Sistema" → "Sicurezza" → "Consenti app da sviluppatori identificati"
3. **Linux**: Installa le dipendenze mancanti

### Errori di Database
1. Verifica i permessi di scrittura
2. Controlla lo spazio disponibile
3. Ripristina da backup se necessario

### Problemi di Performance
1. Chiudi altre applicazioni
2. Verifica la RAM disponibile
3. Controlla lo spazio su disco

## 📞 Supporto

Per problemi di installazione:
- 📧 Email: support@futuredanceschool.com
- 🐛 Issues: [GitHub Issues](https://github.com/PatrikBaldon/Cashflow/issues)
- 📖 Docs: [Documentazione](https://github.com/PatrikBaldon/Cashflow/tree/main/docs)

## 🔄 Aggiornamenti

### Automatici
- L'app controlla automaticamente gli aggiornamenti
- Notifica quando disponibili nuove versioni

### Manuali
1. Scarica la nuova release
2. Installa sopra la versione esistente
3. I dati verranno preservati

---

**Nota**: L'applicazione funziona completamente offline e non richiede connessione internet.
