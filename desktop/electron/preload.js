const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electron', {
  // Obtener versión de la app
  getAppVersion: () => {
    ipcRenderer.send('app-version');
    return new Promise((resolve) => {
      ipcRenderer.once('app-version', (event, version) => {
        resolve(version);
      });
    });
  },
  
  // Indicador de que es Electron
  isElectron: true,
  
  // Plataforma del sistema
  platform: process.platform
});

// Exponer variables de entorno si es necesario
contextBridge.exposeInMainWorld('env', {
  NODE_ENV: process.env.NODE_ENV || 'production'
});
