# Istruzioni Amministratore - Registro Contanti

## 🔐 Accesso Amministratore

**Credenziali di default:**
- **Username**: `admin`
- **Password**: `admin123`

✅ **Password aggiornata e funzionante!**

⚠️ **IMPORTANTE**: Cambia immediatamente la password di default per sicurezza!

## 👥 Gestione Utenti

### Creare Nuovi Utenti
1. Accedi come amministratore
2. Clicca su "Utenti" nella barra superiore
3. Clicca "Nuovo Utente"
4. Compila i campi:
   - **Nome Utente**: Nome dell'operatore
   - **Password**: Password sicura (minimo 6 caratteri)
   - **Amministratore**: Spunta solo per dare accesso completo

### Tipi di Utenti
- **Operatore**: Può gestire pagamenti e casse pubbliche + export Excel
- **Amministratore**: Accesso completo + casse riservate + gestione utenti + export completo

## 🔒 Sistema Casse Nascoste

### Caratteristiche
- **Visibilità**: Solo gli amministratori possono vedere le casse riservate
- **Accesso**: Richiede password specifica per sbloccare
- **Privacy**: Completamente invisibili agli operatori normali
- **Nessun riferimento visibile**: Non ci sono pulsanti o menu che rivelano l'esistenza delle casse riservate

### Come Funziona
1. **Crea Cassa Riservata**: Solo admin può creare casse con flag "nascosta"
2. **Sblocca Accesso**: Admin deve andare in "Impostazioni" → "Mostra controlli riservati" → inserire password
3. **Blocca Accesso**: Le casse riservate si nascondono automaticamente al logout

### Password Casse Riservate
- **Default**: `admin123`
- **Cambio**: Vai in "Impostazioni" → "Password Casse Riservate"
- **Sicurezza**: Cambia la password di default!

### ⚠️ IMPORTANTE
- **Nessun operatore normale può vedere** le casse riservate
- **Non ci sono riferimenti visibili** nel codice o nell'interfaccia
- **Solo gli amministratori** possono accedervi tramite impostazioni nascoste

## ⚙️ Impostazioni Avanzate

### Accesso Impostazioni
1. Accedi come amministratore
2. Clicca su "Impostazioni" (icona scudo)
3. Modifica le impostazioni riservate

### Impostazioni Disponibili
- **Password Casse Nascoste**: Password per accedere alle casse riservate
- **Backup Automatico**: Abilitazione backup automatico
- **Intervallo Backup**: Frequenza backup (ore)

## 🛡️ Sicurezza

### Best Practices
1. **Password Forti**: Usa password complesse per tutti gli utenti
2. **Accesso Limitato**: Crea solo utenti operatore per uso normale
3. **Backup Regolari**: Abilita backup automatico
4. **Password Casse Nascoste**: Cambia la password di default

### Gestione Accessi
- **Operatori**: Solo casse pubbliche e pagamenti
- **Admin**: Accesso completo + casse nascoste + gestione utenti
- **Logout**: Le casse nascoste si nascondono automaticamente

## 📊 Casse e Pagamenti

### Casse Pubbliche
- Visibili a tutti gli operatori
- Gestione normale dei pagamenti
- Statistiche pubbliche

### Casse Nascoste
- Visibili solo agli admin con password
- Pagamenti riservati
- Statistiche separate
- Completamente invisibili agli operatori

## 📈 Export Excel

### Funzionalità Export
- **Export Cassa Singola**: Esporta solo la cassa selezionata
- **Export Tutte le Casse**: Esporta tutte le casse (incluse riservate se sbloccate)
- **File salvato automaticamente** nella cartella Downloads
- **Formato Excel** con colonne: Data, Cliente, Importo, Motivo, Operatore, Cassa, ID

### Come Usare l'Export
1. **Seleziona una cassa** (per export singolo)
2. **Clicca "Export Excel"** nella barra dei pulsanti
3. **Scegli il tipo di export**:
   - Cassa Selezionata: Solo la cassa corrente
   - Tutte le Casse: Tutte le casse disponibili
4. **Clicca "Esporta Excel"**
5. **Il file verrà salvato** automaticamente in Downloads

### Note Export
- **Casse Riservate**: Incluse solo se l'admin ha sbloccato l'accesso
- **Formato File**: `pagamenti_[nome_cassa]_[timestamp].xlsx`
- **Cartella**: Downloads del computer
- **Dati**: Tutti i pagamenti con informazioni complete

## 🚨 Risoluzione Problemi

### Utente Non Può Accedere
1. Verifica credenziali
2. Controlla se l'utente è attivo
3. Reimposta password se necessario

### Casse Nascoste Non Visibili
1. Verifica di essere loggato come admin
2. Inserisci password casse nascoste
3. Controlla impostazioni

### Password Dimenticata
1. Accedi come admin
2. Vai in "Utenti"
3. Modifica password utente

## 📞 Supporto

Per problemi tecnici:
1. Controlla i log dell'applicazione
2. Verifica la configurazione del database
3. Contatta il supporto tecnico

---

**Nota**: Questa applicazione è progettata per uso locale. Tutti i dati sono memorizzati sul computer locale e non vengono inviati a server esterni.
