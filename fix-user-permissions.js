const Database = require('better-sqlite3');
const path = require('path');

async function fixUserPermissions() {
  const dbPath = path.join(__dirname, 'database', 'registro_contanti.db');
  const db = new Database(dbPath);
  
  console.log('Aggiornando permessi utente...');
  
  try {
    // Trova l'utente Patrik Baldon
    const user = db.prepare(`
      SELECT id, name, is_admin, can_access_hidden 
      FROM operators 
      WHERE name = 'Patrik Baldon'
    `).get();
    
    if (user) {
      console.log('Utente trovato:', user);
      
      // Aggiorna i permessi per accedere alle casse nascoste
      const updateStmt = db.prepare(`
        UPDATE operators 
        SET can_access_hidden = TRUE 
        WHERE id = ?
      `);
      
      const result = updateStmt.run(user.id);
      console.log('Permessi aggiornati:', result.changes, 'righe modificate');
      
      // Verifica l'aggiornamento
      const updatedUser = db.prepare(`
        SELECT id, name, is_admin, can_access_hidden 
        FROM operators 
        WHERE id = ?
      `).get(user.id);
      
      console.log('Utente aggiornato:', updatedUser);
      
    } else {
      console.log('Utente Patrik Baldon non trovato');
      
      // Mostra tutti gli utenti
      const allUsers = db.prepare(`
        SELECT id, name, is_admin, can_access_hidden 
        FROM operators
      `).all();
      
      console.log('Utenti disponibili:', allUsers);
    }
    
  } catch (error) {
    console.error('Errore aggiornamento permessi:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Esegui la correzione
fixUserPermissions()
  .then(() => {
    console.log('Permessi aggiornati con successo!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Errore:', error);
    process.exit(1);
  });
