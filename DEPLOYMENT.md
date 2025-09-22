# Guida alla Distribuzione - Registro Contanti

## 🚀 Distribuzione Automatica con GitHub

Questo progetto è configurato per la distribuzione automatica tramite GitHub Actions. Ogni volta che crei un tag di versione, l'applicazione viene automaticamente compilata per Windows, macOS e Linux e pubblicata come GitHub Release.

## 📋 Prerequisiti

1. **Repository GitHub**: Il progetto deve essere su GitHub
2. **Git configurato**: Con accesso al repository
3. **Node.js 18+**: Installato localmente per sviluppo

## 🔄 Processo di Distribuzione

### 1. Preparazione del Codice

```bash
# Assicurati che tutto sia committato
git add .
git commit -m "Preparazione per release v2.0.1"
git push origin main
```

### 2. Creazione di una Release

#### Opzione A: Tramite Tag Git (Raccomandato)
```bash
# Crea e pusha un tag
git tag v2.0.1
git push origin v2.0.1
```

#### Opzione B: Tramite GitHub Actions (Manuale)
1. Vai su GitHub → Actions
2. Seleziona "Build and Release"
3. Clicca "Run workflow"
4. Inserisci la versione (es. v2.0.1)
5. Clicca "Run workflow"

### 3. Download della Release

Una volta completato il build (5-10 minuti), troverai la release in:
- **GitHub** → **Releases** → **Latest Release**
- Download automatico per Windows (.exe), macOS (.dmg), Linux (.AppImage)

## 🖥️ Installazione sul PC dell'Ufficio

### Windows
1. Scarica il file `.exe` dalla release
2. Esegui l'installer
3. Segui la procedura guidata
4. L'app sarà disponibile nel menu Start

### macOS
1. Scarica il file `.dmg` dalla release
2. Apri il file `.dmg`
3. Trascina l'app nella cartella Applicazioni
4. Esegui l'app dal Launchpad

### Linux
1. Scarica il file `.AppImage` dalla release
2. Rendi eseguibile: `chmod +x Registro\ Contanti-*.AppImage`
3. Esegui: `./Registro\ Contanti-*.AppImage`

## 🔧 Configurazione Avanzata

### Code Signing (Opzionale)

Per firmare digitalmente l'applicazione:

1. **Windows**: Ottieni un certificato di code signing
2. **macOS**: Configura Apple Developer Account
3. Aggiungi i certificati come GitHub Secrets:
   - `CSC_LINK` (certificato)
   - `CSC_KEY_PASSWORD` (password)

### Personalizzazione Build

Modifica `.github/workflows/build.yml` per:
- Cambiare le piattaforme supportate
- Aggiungere test automatici
- Modificare il processo di release

## 📁 Struttura File di Distribuzione

```
dist/
├── win-unpacked/          # App Windows non impacchettata
├── mac/                   # App macOS
├── linux-unpacked/        # App Linux non impacchettata
├── *.exe                  # Installer Windows
├── *.dmg                  # Installer macOS
└── *.AppImage             # App Linux portabile
```

## 🐛 Troubleshooting

### Build Fallito
1. Controlla i log in GitHub Actions
2. Verifica che tutti i test passino
3. Controlla le dipendenze

### App Non Si Avvia
1. Verifica che il database sia presente
2. Controlla i permessi di scrittura
3. Esegui in modalità debug

### Problemi di Installazione
1. **Windows**: Disabilita temporaneamente l'antivirus
2. **macOS**: Apri "Preferenze Sistema" → "Sicurezza" → "Consenti app da sviluppatori identificati"
3. **Linux**: Installa le dipendenze mancanti

## 📞 Supporto

Per problemi o domande:
1. Controlla i log di GitHub Actions
2. Verifica la documentazione
3. Contatta il team di sviluppo

## 🔄 Aggiornamenti

Per aggiornare l'applicazione:
1. Scarica la nuova release
2. Installa sopra la versione esistente
3. I dati esistenti verranno preservati

---

**Nota**: L'applicazione include un database SQLite integrato. I dati vengono salvati localmente e non richiedono connessione internet.
