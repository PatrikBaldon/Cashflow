const { ipcMain } = require('electron')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs').promises

class ExcelService {
  constructor(dbManager, authManager = null) {
    this.db = dbManager;
    this.authManager = authManager;
    this.setupIpcHandlers()
  }

  // Rimuoviamo setAuthManager, ora viene passato nel costruttore
  // setAuthManager(authManager) {
  //   this.authManager = authManager;
  // }

  setupIpcHandlers() {
    // Export pagamenti per cassa
    ipcMain.handle('excel-export-payments', async (event, { cashRegisterId, includeHidden = false, filePath = null }) => {
      try {
        // Rimuoviamo l'istanza locale del DB
        // const Database = require('../database/database')
        // const db = new Database()
        // await db.initialize()
        
        // Carica i pagamenti per la cassa specifica
        const payments = await this.db.getPaymentsByCashRegister(cashRegisterId)
        
        // Carica le informazioni della cassa
        const cashRegister = await this.db.getCashRegisterById(cashRegisterId)
        
        if (!payments || payments.length === 0) {
          return { success: false, message: 'Nessun pagamento trovato per questa cassa' }
        }

        // Prepara i dati per Excel
        const excelData = payments.map(payment => ({
          'Data': payment.payment_date,
          'Cliente': payment.customer_name,
          'Importo': payment.amount,
          'Motivo': payment.reason,
          'Operatore': payment.operator_name || 'N/A',
          'Cassa': cashRegister.name,
          'ID Pagamento': payment.id
        }))

        // Crea il workbook
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(excelData)

        // Aggiusta la larghezza delle colonne
        const columnWidths = [
          { wch: 12 }, // Data
          { wch: 20 }, // Cliente
          { wch: 12 }, // Importo
          { wch: 25 }, // Motivo
          { wch: 15 }, // Operatore
          { wch: 20 }, // Cassa
          { wch: 10 }  // ID
        ]
        worksheet['!cols'] = columnWidths

        // Aggiungi il foglio al workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagamenti')

        // Genera il nome del file
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const fileName = `pagamenti_${cashRegister.name.replace(/\s+/g, '_')}_${timestamp}.xlsx`
        
        // Determina il percorso del file
        let finalFilePath
        if (filePath) {
          // Se è stato fornito un percorso personalizzato, usalo
          finalFilePath = filePath
        } else {
          // Altrimenti usa la cartella Downloads
          const downloadsPath = path.join(require('os').homedir(), 'Downloads')
          finalFilePath = path.join(downloadsPath, fileName)
          await fs.mkdir(downloadsPath, { recursive: true })
        }
        
        // Crea la directory se non esiste
        const dir = path.dirname(finalFilePath)
        await fs.mkdir(dir, { recursive: true })
        
        XLSX.writeFile(workbook, finalFilePath)

        return { 
          success: true, 
          message: `File Excel salvato in: ${finalFilePath}`,
          filePath: finalFilePath,
          fileName: path.basename(finalFilePath)
        }
      } catch (error) {
        console.error('Errore export Excel:', error)
        return { success: false, message: 'Errore durante la creazione del file Excel' }
      }
    })

    // Export tutte le casse (incluse nascoste se sbloccate)
    ipcMain.handle('excel-export-all-cash', async (event, { includeHidden = false, filePath = null }) => {
      try {
        // Ottieni l'utente corrente per determinare l'azienda
        const currentUser = this.authManager?.getCurrentUser();
        if (!currentUser) {
          return { success: false, message: 'Utente non autenticato' };
        }

        // Rimuoviamo l'istanza locale del DB
        // const Database = require('../database/database')
        // const db = new Database()
        // await db.initialize()
        
        // Carica tutte le casse per l'azienda corrente
        const cashRegisters = await this.db.getCashRegisters(currentUser.companyId, includeHidden)
        
        if (!cashRegisters || cashRegisters.length === 0) {
          return { success: false, message: 'Nessuna cassa trovata' }
        }

        // Crea un workbook con un foglio per ogni cassa
        const workbook = XLSX.utils.book_new()

        for (const cashRegister of cashRegisters) {
          // Carica i pagamenti per questa cassa
          const payments = await this.db.getPaymentsByCashRegister(cashRegister.id)
          
          if (payments && payments.length > 0) {
            // Prepara i dati per Excel
            const excelData = payments.map(payment => ({
              'Data': payment.payment_date,
              'Cliente': payment.customer_name,
              'Importo': payment.amount,
              'Motivo': payment.reason,
              'Operatore': payment.operator_name || 'N/A',
              'ID Pagamento': payment.id
            }))

            // Crea il foglio per questa cassa
            const worksheet = XLSX.utils.json_to_sheet(excelData)
            
            // Aggiusta la larghezza delle colonne
            const columnWidths = [
              { wch: 12 }, // Data
              { wch: 20 }, // Cliente
              { wch: 12 }, // Importo
              { wch: 25 }, // Motivo
              { wch: 15 }, // Operatore
              { wch: 10 }  // ID
            ]
            worksheet['!cols'] = columnWidths

            // Aggiungi il foglio al workbook (nome cassa limitato a 31 caratteri)
            const sheetName = cashRegister.name.substring(0, 31)
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
          }
        }

        // Genera il nome del file
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const fileName = `tutte_le_casse_${timestamp}.xlsx`
        
        // Determina il percorso del file
        let finalFilePath
        if (filePath) {
          // Se è stato fornito un percorso personalizzato, usalo
          finalFilePath = filePath
        } else {
          // Altrimenti usa la cartella Downloads
          const downloadsPath = path.join(require('os').homedir(), 'Downloads')
          finalFilePath = path.join(downloadsPath, fileName)
          await fs.mkdir(downloadsPath, { recursive: true })
        }
        
        // Crea la directory se non esiste
        const dir = path.dirname(finalFilePath)
        await fs.mkdir(dir, { recursive: true })
        
        XLSX.writeFile(workbook, finalFilePath)

        return { 
          success: true, 
          message: `File Excel salvato in: ${finalFilePath}`,
          filePath: finalFilePath,
          fileName: path.basename(finalFilePath)
        }
      } catch (error) {
        console.error('Errore export Excel tutte le casse:', error)
        return { success: false, message: 'Errore durante la creazione del file Excel' }
      }
    })
  }
}

module.exports = ExcelService
