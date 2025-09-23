const fs = require('fs');
const path = require('path');

// Leggi il file database.js
const dbPath = path.join(__dirname, 'database', 'database.js');
let content = fs.readFileSync(dbPath, 'utf8');

// Converti tutti i metodi che usano better-sqlite3 a sqlite3
const conversions = [
  // Converti stmt.get() a db.get()
  {
    pattern: /const stmt = this\.db\.prepare\('([^']+)'\);\s*const (\w+) = stmt\.get\(([^)]+)\);/g,
    replacement: (match, query, varName, params) => {
      return `this.db.get('${query}', [${params}], (err, ${varName}) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
          return;
        }
        resolve(${varName});
      });`;
    }
  },
  
  // Converti stmt.all() a db.all()
  {
    pattern: /const stmt = this\.db\.prepare\('([^']+)'\);\s*const (\w+) = stmt\.all\(\);\s*return \w+;/g,
    replacement: (match, query, varName) => {
      return `this.db.all('${query}', (err, ${varName}) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(${varName});
        }
      });`;
    }
  },
  
  // Converti stmt.run() a db.run()
  {
    pattern: /const stmt = this\.db\.prepare\('([^']+)'\);\s*stmt\.run\(([^)]+)\);/g,
    replacement: (match, query, params) => {
      return `this.db.run('${query}', [${params}], (err) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve();
        }
      });`;
    }
  }
];

// Applica le conversioni
conversions.forEach(conversion => {
  content = content.replace(conversion.pattern, conversion.replacement);
});

// Salva il file convertito
fs.writeFileSync(dbPath, content);
console.log('Database converted successfully!');
