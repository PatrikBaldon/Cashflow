# 📦 Installazione

## 🖥️ Requisiti di Sistema

- **Windows**: Windows 10 o superiore
- **macOS**: macOS 10.15 o superiore  
- **Linux**: Ubuntu 18.04+ / Debian 10+ / Fedora 32+

## 🚀 Installazione da Release

1. Vai su [GitHub Releases](https://github.com/PatrikBaldon/Cashflow/releases)
2. Scarica il file per il tuo sistema operativo:
   - **Windows**: `Registro-Contanti-Setup-*.exe`
   - **macOS**: `Registro-Contanti-*.dmg`
   - **Linux**: `Registro-Contanti-*.AppImage`
3. Segui la procedura di installazione

## 🔧 Installazione da Sorgente

### Prerequisiti
- **Node.js** 18.0.0 o superiore
- **npm** 8.0.0 o superiore

### Passaggi
```bash
# Clona il repository
git clone https://github.com/PatrikBaldon/Cashflow.git
cd Cashflow

# Installa le dipendenze
npm install
cd frontend && npm install && cd ..

# Avvia in modalità sviluppo
npm run dev

# Oppure compila per produzione
npm run build
npm start
```

## ⚙️ Configurazione Iniziale

Al primo avvio:
1. Configura i dati aziendali
2. Imposta la password per le casse nascoste
3. Salva il codice di sicurezza generato
4. Crea l'utente amministratore

## 📞 Supporto

Per problemi o suggerimenti, apri una issue su GitHub.
