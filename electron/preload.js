const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadStoreToLocalStorage: async () => {
    const data = await ipcRenderer.invoke('store:get-all');
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value);
      }
    }
  },

  saveToStore: (key, value) => {
    ipcRenderer.send('store:set', key, value);
  },

  removeFromStore: (key) => {
    ipcRenderer.send('store:delete', key);
  },

  clearStore: () => {
    ipcRenderer.send('store:clear');
  },

  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  getPlatform: () => ipcRenderer.invoke('app:get-platform'),

  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update:available', (event, data) => callback(data));
  },

  startDownload: (url) => ipcRenderer.invoke('update:start-download', url),

  cancelDownload: () => ipcRenderer.invoke('update:cancel-download'),

  onDownloadProgress: (callback) => {
    ipcRenderer.on('download:progress', (event, pct) => callback(pct));
  },

  onDownloadComplete: (callback) => {
    ipcRenderer.on('download:complete', (event, path) => callback(path));
  },

  installUpdate: (installerPath) => ipcRenderer.invoke('update:install', installerPath),

  checkForUpdates: () => ipcRenderer.invoke('update:check'),
});
