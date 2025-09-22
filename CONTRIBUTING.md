# 🤝 Contribuire al Progetto

Grazie per il tuo interesse a contribuire al Registro Contanti! Questo documento ti guiderà attraverso il processo di contribuzione.

## 📋 Come Contribuire

### 1. Fork del Repository
1. Vai su [GitHub](https://github.com/PatrikBaldon/Cashflow)
2. Clicca su "Fork" in alto a destra
3. Clona il tuo fork localmente

### 2. Setup dell'Ambiente
```bash
# Clona il tuo fork
git clone https://github.com/TUO-USERNAME/Cashflow.git
cd Cashflow

# Installa dipendenze
npm install
cd frontend && npm install && cd ..

# Avvia in modalità sviluppo
npm run dev
```

### 3. Creare un Branch
```bash
# Crea un nuovo branch per la tua feature
git checkout -b feature/nome-feature

# O per un bug fix
git checkout -b fix/descrizione-bug
```

### 4. Sviluppare
- Scrivi codice pulito e ben commentato
- Segui le convenzioni di naming del progetto
- Aggiungi test per le nuove funzionalità
- Aggiorna la documentazione se necessario

### 5. Test
```bash
# Esegui i test
npm test

# Controlla il linting
npm run lint

# Test di build
npm run build
```

### 6. Commit e Push
```bash
# Aggiungi le modifiche
git add .

# Commit con messaggio descrittivo
git commit -m "feat: aggiungi nuova funzionalità X"

# Push al tuo fork
git push origin feature/nome-feature
```

### 7. Pull Request
1. Vai su GitHub
2. Clicca su "New Pull Request"
3. Compila il template PR
4. Assegna reviewers se necessario

## 📝 Convenzioni di Codice

### Naming
- **File**: `camelCase` per JS/TS, `kebab-case` per CSS
- **Variabili**: `camelCase`
- **Costanti**: `UPPER_SNAKE_CASE`
- **Componenti**: `PascalCase`

### Commit Messages
Usa il formato [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): descrizione

feat: aggiungi nuova funzionalità
fix: risolvi bug
docs: aggiorna documentazione
style: formattazione codice
refactor: refactoring senza cambiamenti funzionali
test: aggiungi test
chore: task di manutenzione
```

### Esempi
```
feat(auth): aggiungi autenticazione OAuth
fix(payments): risolvi errore calcolo totale
docs(api): aggiorna documentazione endpoint
style(ui): migliora layout dashboard
refactor(services): ottimizza gestione database
test(payments): aggiungi test unitari
chore(deps): aggiorna dipendenze
```

## 🧪 Testing

### Test Unitari
```bash
# Frontend
cd frontend && npm test

# Backend
npm run test:backend
```

### Test di Integrazione
```bash
# Test completo
npm run test:integration
```

### Test E2E
```bash
# Test end-to-end
npm run test:e2e
```

## 📚 Documentazione

### README
- Mantieni aggiornato il README principale
- Aggiungi nuove funzionalità alla sezione features
- Aggiorna gli screenshot se necessario

### API Docs
- Documenta nuovi endpoint in `docs/API.md`
- Includi esempi di utilizzo
- Specifica parametri e risposte

### Code Comments
```javascript
/**
 * Calcola il totale dei pagamenti per un periodo
 * @param {string} startDate - Data inizio (ISO format)
 * @param {string} endDate - Data fine (ISO format)
 * @param {string} type - Tipo pagamento ('income' | 'expense')
 * @returns {Promise<number>} Totale calcolato
 */
async function calculateTotal(startDate, endDate, type) {
  // Implementazione...
}
```

## 🐛 Reporting Bug

### Prima di Segnalare
1. Verifica che il bug non sia già stato segnalato
2. Controlla la documentazione
3. Prova le soluzioni in `docs/TROUBLESHOOTING.md`

### Template Bug Report
```markdown
**Descrizione**
Descrizione chiara del bug.

**Riproduzione**
Passi per riprodurre:
1. Vai a '...'
2. Clicca su '....'
3. Vedi errore

**Comportamento Atteso**
Cosa dovrebbe succedere.

**Screenshot**
Se applicabile, aggiungi screenshot.

**Sistema**
- OS: [e.g. Windows 10]
- Versione App: [e.g. 2.0.0]
- Browser: [e.g. Chrome 91]

**Log**
Aggiungi log rilevanti.
```

## 💡 Feature Requests

### Prima di Proporre
1. Verifica che la feature non esista già
2. Controlla i roadmap esistenti
3. Valuta l'impatto e la complessità

### Template Feature Request
```markdown
**Problema**
Quale problema risolve questa feature?

**Soluzione**
Descrizione della soluzione proposta.

**Alternative**
Altre soluzioni considerate.

**Priorità**
- [ ] Bassa
- [ ] Media
- [ ] Alta
- [ ] Critica
```

## 🔍 Code Review

### Come Revieware
1. **Funzionalità**: Il codice fa quello che dovrebbe?
2. **Sicurezza**: Ci sono vulnerabilità?
3. **Performance**: Il codice è efficiente?
4. **Leggibilità**: È facile da capire?
5. **Test**: Ci sono test appropriati?

### Checklist Review
- [ ] Codice funziona correttamente
- [ ] Test passano
- [ ] Documentazione aggiornata
- [ ] Convenzioni rispettate
- [ ] Nessun codice duplicato
- [ ] Gestione errori appropriata
- [ ] Sicurezza verificata

## 🏷️ Release Process

### Versioning
Usiamo [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambiamenti incompatibili
- **MINOR**: Nuove funzionalità compatibili
- **PATCH**: Bug fix compatibili

### Changelog
Aggiorna `CHANGELOG.md` per ogni release:
```markdown
## [2.1.0] - 2024-01-15

### Added
- Nuova funzionalità X
- Supporto per Y

### Changed
- Miglioramento Z

### Fixed
- Bug fix A
- Risoluzione problema B
```

## 📞 Supporto

### Domande
- **GitHub Discussions**: Per domande generali
- **Issues**: Per bug e feature requests
- **Email**: support@futuredanceschool.com

### Comunicazione
- Sii rispettoso e professionale
- Usa l'inglese per comunicazioni pubbliche
- Fornisci contesto sufficiente
- Sii paziente con le risposte

## 📄 Licenza

Contribuendo al progetto, accetti che il tuo codice sarà distribuito sotto la licenza MIT.

---

**Grazie per il tuo contributo!** 🎉

Ogni contributo, grande o piccolo, è apprezzato e aiuta a migliorare il progetto per tutti gli utenti.
