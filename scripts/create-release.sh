#!/bin/bash

# Script per creare una release
# Uso: ./scripts/create-release.sh [versione]
# Esempio: ./scripts/create-release.sh v2.0.1

set -e

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

# Verifica parametri
if [ $# -eq 0 ]; then
    print_error "Versione richiesta. Uso: $0 [versione]"
    print_status "Esempio: $0 v2.0.1"
    exit 1
fi

VERSION=$1

# Verifica formato versione
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Formato versione non valido. Usa: vX.Y.Z"
    print_status "Esempio: v2.0.1"
    exit 1
fi

print_status "Creazione release $VERSION..."

# Verifica che Git sia installato
if ! command -v git &> /dev/null; then
    print_error "Git non è installato."
    exit 1
fi

# Verifica che siamo in un repository Git
if [ ! -d ".git" ]; then
    print_error "Non sei in un repository Git."
    exit 1
fi

# Verifica che non ci siano modifiche non committate
if ! git diff-index --quiet HEAD --; then
    print_warning "Ci sono modifiche non committate."
    print_status "Vuoi continuare comunque? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Operazione annullata."
        exit 0
    fi
fi

# Verifica che il tag non esista già
if git tag -l | grep -q "^$VERSION$"; then
    print_error "Il tag $VERSION esiste già."
    exit 1
fi

# Pull delle ultime modifiche
print_status "Pull delle ultime modifiche..."
git pull origin main

# Build del progetto
print_status "Build del progetto..."
npm run build:frontend
print_success "Frontend compilato"

# Test
print_status "Esecuzione test..."
npm test
print_success "Test completati"

# Commit delle modifiche di build
if ! git diff-index --quiet HEAD --; then
    print_status "Commit delle modifiche di build..."
    git add .
    git commit -m "chore: build per release $VERSION"
fi

# Creazione tag
print_status "Creazione tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION

- Miglioramenti alle performance
- Correzioni di bug
- Nuove funzionalità
- Aggiornamenti di sicurezza"

print_success "Tag $VERSION creato"

# Push del tag
print_status "Push del tag al repository..."
git push origin "$VERSION"
print_success "Tag pushato"

# Push delle modifiche
print_status "Push delle modifiche..."
git push origin main
print_success "Modifiche pushate"

print_success "🎉 Release $VERSION creata con successo!"
print_status "GitHub Actions compilerà automaticamente l'app per tutte le piattaforme"
print_status "Monitora il progresso su: https://github.com/PatrikBaldon/Cashflow/actions"
print_status "La release sarà disponibile su: https://github.com/PatrikBaldon/Cashflow/releases"

echo ""
print_status "Prossimi passi:"
echo "1. Vai su https://github.com/PatrikBaldon/Cashflow/actions"
echo "2. Monitora il build per Windows, macOS e Linux"
echo "3. Una volta completato, vai su https://github.com/PatrikBaldon/Cashflow/releases"
echo "4. Verifica che la release $VERSION sia disponibile"
echo "5. Scarica l'app per il PC dell'ufficio"

echo ""
print_warning "Nota: Il build completo richiede 5-10 minuti"
