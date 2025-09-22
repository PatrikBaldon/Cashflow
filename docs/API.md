# 🔌 API Reference

## 📋 Panoramica

L'API del Registro Contanti è basata su IPC (Inter-Process Communication) tra il frontend React e il backend Electron. Tutte le comunicazioni avvengono tramite il preload script per garantire la sicurezza.

## 🔐 Autenticazione

### `auth.login(credentials)`
Autentica un utente nel sistema.

**Parametri:**
- `credentials.username` (string): Nome utente
- `credentials.password` (string): Password

**Risposta:**
```typescript
{
  success: boolean;
  user?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
    createdAt: string;
  };
  error?: string;
}
```

### `auth.logout()`
Disconnette l'utente corrente.

**Risposta:**
```typescript
{
  success: boolean;
}
```

### `auth.getCurrentUser()`
Ottiene le informazioni dell'utente corrente.

**Risposta:**
```typescript
{
  user?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
    createdAt: string;
  };
}
```

## 💰 Gestione Pagamenti

### `payments.getAll(filters?)`
Ottiene tutti i pagamenti con filtri opzionali.

**Parametri:**
- `filters` (object, opzionale):
  - `startDate` (string): Data inizio (ISO format)
  - `endDate` (string): Data fine (ISO format)
  - `type` (string): Tipo pagamento ('income' | 'expense')
  - `userId` (string): ID utente

**Risposta:**
```typescript
{
  payments: Array<{
    id: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    category: string;
    date: string;
    userId: string;
    createdAt: string;
  }>;
  total: number;
}
```

### `payments.create(payment)`
Crea un nuovo pagamento.

**Parametri:**
- `payment` (object):
  - `amount` (number): Importo
  - `description` (string): Descrizione
  - `type` (string): Tipo ('income' | 'expense')
  - `category` (string): Categoria
  - `date` (string): Data (ISO format)

**Risposta:**
```typescript
{
  success: boolean;
  payment?: {
    id: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    category: string;
    date: string;
    userId: string;
    createdAt: string;
  };
  error?: string;
}
```

### `payments.update(id, updates)`
Aggiorna un pagamento esistente.

**Parametri:**
- `id` (string): ID del pagamento
- `updates` (object): Campi da aggiornare

**Risposta:**
```typescript
{
  success: boolean;
  payment?: Payment;
  error?: string;
}
```

### `payments.delete(id)`
Elimina un pagamento.

**Parametri:**
- `id` (string): ID del pagamento

**Risposta:**
```typescript
{
  success: boolean;
  error?: string;
}
```

## 👥 Gestione Utenti

### `users.getAll()`
Ottiene tutti gli utenti (solo admin).

**Risposta:**
```typescript
{
  users: Array<{
    id: string;
    username: string;
    role: 'admin' | 'user';
    createdAt: string;
    lastLogin?: string;
  }>;
}
```

### `users.create(userData)`
Crea un nuovo utente (solo admin).

**Parametri:**
- `userData` (object):
  - `username` (string): Nome utente
  - `password` (string): Password
  - `role` (string): Ruolo ('admin' | 'user')

**Risposta:**
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

### `users.update(id, updates)`
Aggiorna un utente (solo admin).

**Parametri:**
- `id` (string): ID utente
- `updates` (object): Campi da aggiornare

**Risposta:**
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

### `users.delete(id)`
Elimina un utente (solo admin).

**Parametri:**
- `id` (string): ID utente

**Risposta:**
```typescript
{
  success: boolean;
  error?: string;
}
```

## 📊 Statistiche

### `stats.getOverview(period?)`
Ottiene statistiche generali.

**Parametri:**
- `period` (string, opzionale): Periodo ('day' | 'week' | 'month' | 'year')

**Risposta:**
```typescript
{
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  paymentCount: number;
  period: string;
}
```

### `stats.getByCategory(period?)`
Ottiene statistiche per categoria.

**Parametri:**
- `period` (string, opzionale): Periodo

**Risposta:**
```typescript
{
  categories: Array<{
    name: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}
```

### `stats.getTrends(period)`
Ottiene trend temporali.

**Parametri:**
- `period` (string): Periodo

**Risposta:**
```typescript
{
  trends: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}
```

## 📤 Export

### `export.toExcel(filters?)`
Esporta dati in formato Excel.

**Parametri:**
- `filters` (object, opzionale): Filtri per l'export

**Risposta:**
```typescript
{
  success: boolean;
  filePath?: string;
  error?: string;
}
```

### `export.getAvailableFormats()`
Ottiene i formati di export disponibili.

**Risposta:**
```typescript
{
  formats: Array<{
    name: string;
    extension: string;
    description: string;
  }>;
}
```

## 🔧 Impostazioni

### `settings.get()`
Ottiene le impostazioni correnti.

**Risposta:**
```typescript
{
  currency: string;
  dateFormat: string;
  backupEnabled: boolean;
  backupFrequency: string;
  theme: string;
}
```

### `settings.update(settings)`
Aggiorna le impostazioni.

**Parametri:**
- `settings` (object): Nuove impostazioni

**Risposta:**
```typescript
{
  success: boolean;
  settings?: Settings;
  error?: string;
}
```

## 🗄️ Database

### `database.backup()`
Crea un backup del database.

**Risposta:**
```typescript
{
  success: boolean;
  backupPath?: string;
  error?: string;
}
```

### `database.restore(backupPath)`
Ripristina da un backup.

**Parametri:**
- `backupPath` (string): Percorso del backup

**Risposta:**
```typescript
{
  success: boolean;
  error?: string;
}
```

## 🚨 Gestione Errori

Tutti i metodi API possono restituire errori nel formato:

```typescript
{
  success: false;
  error: string;
  code?: string;
}
```

### Codici Errore Comuni

- `AUTH_REQUIRED`: Autenticazione richiesta
- `INVALID_CREDENTIALS`: Credenziali non valide
- `PERMISSION_DENIED`: Permessi insufficienti
- `VALIDATION_ERROR`: Errore di validazione
- `DATABASE_ERROR`: Errore del database
- `FILE_ERROR`: Errore di file system

## 📝 Esempi di Utilizzo

### Frontend React
```typescript
import { useAuthStore } from '../stores/authStore';
import { useCashStore } from '../stores/cashStore';

// Login
const handleLogin = async (credentials) => {
  const result = await window.electronAPI.auth.login(credentials);
  if (result.success) {
    useAuthStore.getState().setUser(result.user);
  }
};

// Creare pagamento
const handleCreatePayment = async (paymentData) => {
  const result = await window.electronAPI.payments.create(paymentData);
  if (result.success) {
    useCashStore.getState().addPayment(result.payment);
  }
};
```

### Gestione Errori
```typescript
try {
  const result = await window.electronAPI.payments.getAll();
  if (!result.success) {
    console.error('Errore:', result.error);
    // Gestisci l'errore
  }
} catch (error) {
  console.error('Errore di rete:', error);
}
```

---

**Nota**: Questa API è specifica per l'applicazione Electron e non è accessibile da browser esterni per motivi di sicurezza.
