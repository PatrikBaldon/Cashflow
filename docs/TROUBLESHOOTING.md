# 🔧 Troubleshooting

## 🚨 Problemi Comuni

### App Non Si Avvia

#### Windows
**Problema**: L'applicazione non si avvia o si chiude immediatamente.

**Soluzioni**:
1. **Antivirus**: Disabilita temporaneamente l'antivirus
2. **Permessi**: Esegui come amministratore
3. **Dipendenze**: Installa Visual C++ Redistributable
4. **Firewall**: Aggiungi eccezione nel firewall

```bash
# Verifica i log
%APPDATA%/Registro-Contanti/logs/app.log
```

#### macOS
**Problema**: "App non verificata" o non si apre.

**Soluzioni**:
1. **Sicurezza**: Sistema → Preferenze → Sicurezza → Consenti app da sviluppatori identificati
2. **Quarantena**: Rimuovi attributo quarantena
```bash
sudo xattr -r -d com.apple.quarantine /Applications/Registro\ Contanti.app
```
3. **Permessi**: Verifica permessi di esecuzione

#### Linux
**Problema**: AppImage non si esegue.

**Soluzioni**:
1. **Permessi**: `chmod +x Registro-Contanti-*.AppImage`
2. **Dipendenze**: Installa librerie mancanti
```bash
# Ubuntu/Debian
sudo apt-get install libfuse2 libgtk-3-0 libxss1 libgconf-2-4

# Fedora
sudo dnf install fuse-libs gtk3 libXScrnSaver GConf2
```

### Errori di Database

#### Database Bloccato
**Sintomi**: "Database is locked" o errori di scrittura.

**Soluzioni**:
1. **Chiudi app**: Assicurati che l'app sia completamente chiusa
2. **Processi**: Termina processi rimasti attivi
```bash
# Windows
taskkill /f /im "Registro Contanti.exe"

# macOS/Linux
pkill -f "Registro Contanti"
```
3. **Ripristina**: Usa backup automatico

#### Database Corrotto
**Sintomi**: Errori di lettura o app che si blocca.

**Soluzioni**:
1. **Backup**: Ripristina da backup più recente
2. **Riparazione**: Usa strumenti SQLite
```bash
sqlite3 registro_contanti.db ".recover" | sqlite3 repaired.db
```
3. **Reset**: Ricrea database (perdita dati)

### Problemi di Performance

#### App Lenta
**Cause comuni**:
- Database grande
- Memoria insufficiente
- Troppi processi attivi

**Soluzioni**:
1. **Pulizia**: Pulisci dati vecchi
2. **RAM**: Chiudi altre applicazioni
3. **Database**: Ottimizza database
4. **Restart**: Riavvia l'applicazione

#### Crash Frequenti
**Cause comuni**:
- Memoria insufficiente
- File corrotti
- Conflitti di sistema

**Soluzioni**:
1. **Log**: Controlla log per errori
2. **Reset**: Riavvia sistema
3. **Reinstall**: Reinstalla applicazione
4. **Supporto**: Contatta supporto tecnico

## 🔍 Diagnostica

### Log Files
**Posizione log**:
- **Windows**: `%APPDATA%/Registro-Contanti/logs/`
- **macOS**: `~/Library/Logs/Registro-Contanti/`
- **Linux**: `~/.config/Registro-Contanti/logs/`

**File importanti**:
- `app.log`: Log generali
- `error.log`: Errori specifici
- `database.log`: Operazioni database

### Verifica Sistema
```bash
# Verifica versione Node.js
node --version

# Verifica spazio disco
df -h

# Verifica memoria
free -h

# Verifica processi
ps aux | grep "Registro Contanti"
```

### Test Database
```bash
# Verifica integrità database
sqlite3 registro_contanti.db "PRAGMA integrity_check;"

# Verifica schema
sqlite3 registro_contanti.db ".schema"

# Conta record
sqlite3 registro_contanti.db "SELECT COUNT(*) FROM payments;"
```

## 🛠️ Soluzioni Avanzate

### Reset Completo
**Attenzione**: Questa operazione cancella tutti i dati!

1. **Backup**: Crea backup manuale
2. **Chiudi app**: Termina applicazione
3. **Elimina dati**:
   - Database: `database/registro_contanti.db`
   - Config: `config/`
   - Log: `logs/`
4. **Riavvia**: Riavvia applicazione

### Migrazione Dati
**Da versione precedente**:

1. **Backup**: Crea backup completo
2. **Installa**: Installa nuova versione
3. **Importa**: Usa funzione import
4. **Verifica**: Controlla integrità dati

### Configurazione Avanzata
**File config**: `config/settings.json`

```json
{
  "database": {
    "path": "./database/registro_contanti.db",
    "backupEnabled": true,
    "backupFrequency": "daily"
  },
  "logging": {
    "level": "info",
    "maxFiles": 10,
    "maxSize": "10MB"
  },
  "security": {
    "sessionTimeout": 3600,
    "maxLoginAttempts": 5
  }
}
```

## 📞 Supporto Tecnico

### Informazioni Richieste
Quando contatti il supporto, fornisci:

1. **Sistema operativo**: Versione e architettura
2. **Versione app**: Numero versione
3. **Log errori**: File di log completi
4. **Passi riproduzione**: Come riprodurre il problema
5. **Screenshot**: Se applicabile

### Canali di Supporto
- **Email**: support@futuredanceschool.com
- **GitHub**: [Issues](https://github.com/PatrikBaldon/Cashflow/issues)
- **Documentazione**: [Docs](https://github.com/PatrikBaldon/Cashflow/tree/main/docs)

### Risposta Tipica
- **Urgente**: 24-48 ore
- **Normale**: 3-5 giorni lavorativi
- **Feature request**: 1-2 settimane

## 🔄 Aggiornamenti

### Verifica Versione
1. **App**: Menu → Informazioni
2. **GitHub**: [Releases](https://github.com/PatrikBaldon/Cashflow/releases)
3. **Auto-check**: Abilitato di default

### Problemi Aggiornamento
1. **Download**: Scarica manualmente
2. **Installa**: Sopra versione esistente
3. **Verifica**: Controlla funzionamento
4. **Rollback**: Se necessario, reinstalla versione precedente

### Backup Prima Aggiornamento
**Sempre creare backup**:
1. **Automatico**: App crea backup automatico
2. **Manuale**: Esporta dati in Excel
3. **Database**: Copia file database

---

**Nota**: Se il problema persiste dopo aver provato queste soluzioni, contatta il supporto tecnico con tutte le informazioni richieste.
