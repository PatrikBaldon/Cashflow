const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// Import services
const DatabaseManager = require('./database/database');
const AuthManager = require('./auth/auth');
const CashService = require('./services/cashService');
const UserService = require('./services/userService');
const ExcelService = require('./services/excelService');
const SetupService = require('./services/setupService');

let mainWindow;
let dbManager; // <-- Aggiungo l'istanza del DB qui
let authManager;
let cashService;
let userService;
let excelService;
let setupService;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // Load the app
  if (isDev) {
    console.log('Loading development server at http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'frontend/dist/index.html');
    console.log('Loading static file from:', indexPath);
    console.log('File exists:', require('fs').existsSync(indexPath));
    mainWindow.loadFile(indexPath);
  }

  // Set Content Security Policy for security
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' data: blob: http: https: ws: wss:; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: blob: http: https:; " +
          "font-src 'self' data: https://fonts.gstatic.com; " +
          "connect-src 'self' http: https: ws: wss:;"
        ]
      }
    });
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(async () => {
  // Initialize services
  dbManager = new DatabaseManager();
  await dbManager.initialize(); // Inizializzo il DB solo qui

  setupService = new SetupService(dbManager);
  authManager = new AuthManager(dbManager);
  cashService = new CashService(dbManager, authManager);
  userService = new UserService(dbManager, authManager);
  excelService = new ExcelService(dbManager, authManager);
  
  // Rimuovo le inizializzazioni ridondanti dei servizi
  // await setupService.initialize();
  // await authManager.initialize();
  // await cashService.initialize();
  // await userService.initialize();
  
  // Assicurati che cashService abbia il riferimento all'authManager
  // Questa riga è ridondante perché lo passiamo già nel costruttore
  // cashService.setAuthManager(authManager); 
  
  // Setup IPC handlers
  setupIpcHandlers();
  
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on app quit
app.on('before-quit', () => {
  // Chiudo la connessione al DB solo qui
  if (dbManager) dbManager.close(); 
  // Rimuovo le chiusure ridondanti
  // if (setupService) setupService.close();
  // if (authManager) authManager.close();
  // if (cashService) cashService.close();
  // if (userService) userService.close();
});

// Setup IPC handlers
function setupIpcHandlers() {
  // File save dialog for Excel exports
  ipcMain.handle('show-save-dialog', async (event, options) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: options.title || 'Salva file Excel',
        defaultPath: options.defaultPath || path.join(require('os').homedir(), 'Downloads'),
        filters: [
          { name: 'File Excel', extensions: ['xlsx'] },
          { name: 'Tutti i file', extensions: ['*'] }
        ],
        properties: ['createDirectory']
      });
      
      return {
        success: !result.canceled,
        filePath: result.filePath,
        canceled: result.canceled
      };
    } catch (error) {
      console.error('Errore nel dialog di salvataggio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Payment',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-payment');
          }
        },
        {
          label: 'Print Report',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('menu-print-report');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            // Show about dialog
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
