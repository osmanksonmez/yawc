const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('minimize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  
  // Configuration functions
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  saveTimezones: (timezones) => ipcRenderer.invoke('save-timezones', timezones),
  saveViewMode: (viewMode) => ipcRenderer.invoke('save-view-mode', viewMode),
  
  // Platform information
  platform: process.platform,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Security: Remove any global Node.js APIs that might have been exposed
delete window.require;
delete window.exports;
delete window.module;

// Optional: Add console logging for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Preload script loaded successfully');
}