const { ipcMain } = require('electron')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs').promises

class ExcelService {
  constructor() {
    this.setupIpcHandlers()
  }

  setupIpcHandlers() {
    // Export pagamenti per cassa
    ipcMain.handle('excel-export-payments', async (event, { cashRegisterId, includeHidden = false }) => {
      try {
        const Database = require('../database/database')
        const db = new Database()
        await db.initialize()
        
        // Carica i pagamenti per la cassa specifica
        const payments = await db.getPaymentsByCashRegister(cashRegisterId)
        
        // Carica le informazioni della cassa
        const cashRegister = await db.getCashRegisterById(cashRegisterId)
        
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
        
        // Salva il file nella cartella downloads
        const downloadsPath = path.join(require('os').homedir(), 'Downloads')
        const filePath = path.join(downloadsPath, fileName)
        
        await fs.mkdir(downloadsPath, { recursive: true })
        XLSX.writeFile(workbook, filePath)

        return { 
          success: true, 
          message: `File Excel salvato in: ${filePath}`,
          filePath: filePath,
          fileName: fileName
        }
      } catch (error) {
        console.error('Errore export Excel:', error)
        return { success: false, message: 'Errore durante la creazione del file Excel' }
      }
    })

    // Export tutte le casse (incluse nascoste se sbloccate)
    ipcMain.handle('excel-export-all-cash', async (event, { includeHidden = false }) => {
      try {
        const Database = require('../database/database')
        const db = new Database()
        await db.initialize()
        
        // Carica tutte le casse
        const cashRegisters = await db.getCashRegisters(includeHidden)
        
        if (!cashRegisters || cashRegisters.length === 0) {
          return { success: false, message: 'Nessuna cassa trovata' }
        }

        // Crea un workbook con un foglio per ogni cassa
        const workbook = XLSX.utils.book_new()

        for (const cashRegister of cashRegisters) {
          // Carica i pagamenti per questa cassa
          const payments = await db.getPaymentsByCashRegister(cashRegister.id)
          
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
        
        // Salva il file nella cartella downloads
        const downloadsPath = path.join(require('os').homedir(), 'Downloads')
        const filePath = path.join(downloadsPath, fileName)
        
        await fs.mkdir(downloadsPath, { recursive: true })
        XLSX.writeFile(workbook, filePath)

        return { 
          success: true, 
          message: `File Excel salvato in: ${filePath}`,
          filePath: filePath,
          fileName: fileName
        }
      } catch (error) {
        console.error('Errore export Excel tutte le casse:', error)
        return { success: false, message: 'Errore durante la creazione del file Excel' }
      }
    })
  }
}

module.exports = ExcelService
