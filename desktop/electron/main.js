const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Configurar Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' http://localhost:5000 http://localhost:5174 ws://localhost:5174;"
        ]
      }
    });
  });

  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true // Siempre disponibles, solo se abren auto en dev
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false, // No mostrar hasta que esté listo
    frame: true,
    titleBarStyle: 'default'
  });

  // Maximizar la ventana al inicio
  mainWindow.maximize();

  // Mostrar cuando esté listo para evitar flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Detectar modo desarrollo (si el servidor de Vite está corriendo)
  const isDev = !app.isPackaged;

  // En desarrollo, cargar desde el servidor de Vite
  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    // Abrir DevTools en desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar el index.html del build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Crear menú personalizado
  createMenu();

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', role: 'undo' },
        { label: 'Rehacer', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', role: 'cut' },
        { label: 'Copiar', role: 'copy' },
        { label: 'Pegar', role: 'paste' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Pantalla Completa', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Acercar', role: 'zoomin' },
        { label: 'Alejar', role: 'zoomout' },
        { label: 'Restaurar Zoom', role: 'resetzoom' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de',
          click: () => {
            // Aquí puedes abrir un modal con información de la app
          }
        }
      ]
    }
  ];

  // En desarrollo, agregar menú de desarrollador
  if (!app.isPackaged) {
    template.push({
      label: 'Desarrollador',
      submenu: [
        { label: 'Herramientas de Desarrollador', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Forzar Recarga', role: 'forceReload' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Inicializar la app cuando esté lista
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS, recrear la ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar eventos IPC si es necesario
ipcMain.on('app-version', (event) => {
  event.reply('app-version', app.getVersion());
});

// Prevenir múltiples instancias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
