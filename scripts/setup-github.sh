#!/bin/bash

# Script per configurare il progetto per GitHub
# Uso: ./scripts/setup-github.sh

set -e

echo "🚀 Configurazione progetto per GitHub..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica che Git sia installato
if ! command -v git &> /dev/null; then
    print_error "Git non è installato. Installa Git e riprova."
    exit 1
fi

# Verifica che Node.js sia installato
if ! command -v node &> /dev/null; then
    print_error "Node.js non è installato. Installa Node.js 18+ e riprova."
    exit 1
fi

# Verifica versione Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versione 18+ richiesta. Versione attuale: $(node -v)"
    exit 1
fi

print_status "Verifica prerequisiti completata ✅"

# Inizializza Git se non esiste
if [ ! -d ".git" ]; then
    print_status "Inizializzazione repository Git..."
    git init
    print_success "Repository Git inizializzato"
fi

# Aggiungi remote origin se non esiste
if ! git remote get-url origin &> /dev/null; then
    print_status "Configurazione remote origin..."
    git remote add origin https://github.com/PatrikBaldon/Cashflow.git
    print_success "Remote origin configurato"
fi

# Installa dipendenze
print_status "Installazione dipendenze..."
npm install
print_success "Dipendenze principali installate"

# Installa dipendenze frontend
print_status "Installazione dipendenze frontend..."
cd frontend && npm install && cd ..
print_success "Dipendenze frontend installate"

# Build frontend
print_status "Build frontend..."
npm run build:frontend
print_success "Frontend compilato"

# Aggiungi tutti i file
print_status "Aggiunta file al repository..."
git add .
print_success "File aggiunti"

# Commit iniziale
print_status "Creazione commit iniziale..."
git commit -m "feat: setup iniziale progetto Registro Contanti

- Configurazione Electron + React + TypeScript
- Sistema autenticazione multi-utente
- Dashboard con statistiche avanzate
- Export Excel integrato
- Database SQLite locale
- Supporto multi-piattaforma
- GitHub Actions per CI/CD
- Documentazione completa"

print_success "Commit creato"

# Push al repository
print_status "Push al repository GitHub..."
git push -u origin main
print_success "Push completato"

print_success "🎉 Progetto configurato con successo!"
print_status "Repository: https://github.com/PatrikBaldon/Cashflow"
print_status "Actions: https://github.com/PatrikBaldon/Cashflow/actions"
print_status "Issues: https://github.com/PatrikBaldon/Cashflow/issues"

echo ""
print_status "Prossimi passi:"
echo "1. Vai su https://github.com/PatrikBaldon/Cashflow"
echo "2. Verifica che tutti i file siano stati caricati"
echo "3. Crea una release: git tag v2.0.0 && git push origin v2.0.0"
echo "4. GitHub Actions compilerà automaticamente l'app"
echo "5. Scarica l'app dalla sezione Releases"

echo ""
print_warning "Nota: Assicurati di avere i permessi per pushare su PatrikBaldon/Cashflow"
