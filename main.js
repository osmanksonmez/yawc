const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Disable hardware acceleration to fix GPU issues
app.disableHardwareAcceleration();

let mainWindow;
let tray = null;

// Configuration file path
const configPath = path.join(os.homedir(), '.world-clock-gadget-config.json');

// Default configuration
const defaultConfig = {
    timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
    viewMode: 'digital', // 'digital' or 'analog'
    windowPosition: { x: 100, y: 100 },
    windowSize: { width: 450, height: 650 },
    alwaysOnTop: false
  };

// Load configuration
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return { ...defaultConfig, ...JSON.parse(configData) };
    }
  } catch (error) {
    console.log('Error loading config:', error);
  }
  return defaultConfig;
}

// Save configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.log('Error saving config:', error);
  }
}

function createTray() {
  // Use the favicon.ico file for the tray icon
  const iconPath = path.join(__dirname, 'favicon.ico');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Clock Gadget',
      click: () => {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(false);
        mainWindow.setAlwaysOnTop(true);
      }
    },
    {
      label: 'Hide Clock Gadget',
      click: () => {
        mainWindow.hide();
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('World Clock Gadget');
  tray.setContextMenu(contextMenu);
  
  // Double-click to show/hide
  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

function createWindow() {
  // Load saved configuration
  const config = loadConfig();
  
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Use saved position or default to bottom-right
  const windowX = config.windowPosition.x || screenWidth - 470;
  const windowY = config.windowPosition.y || screenHeight - 670;
  const windowWidth = config.windowSize.width || 450;
  const windowHeight = config.windowSize.height || 650;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: windowX,
    y: windowY,
    frame: false, // Remove window frame for gadget look
    transparent: false, // Disable transparency to make window visible
    alwaysOnTop: config.alwaysOnTop,
    skipTaskbar: true,
    resizable: true, // Allow resizing and dragging
    minimizable: true, // Allow minimizing to tray
    maximizable: false,
    closable: true,
    focusable: true, // Allow focus for interaction
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false // Don't show immediately
  });

  // Set window to stay behind all other windows
  mainWindow.setAlwaysOnTop(false);
  if (process.platform === 'win32') {
    mainWindow.setSkipTaskbar(true);
  }

  // Save window position when moved
  mainWindow.on('moved', () => {
    const position = mainWindow.getPosition();
    const config = loadConfig();
    config.windowPosition = { x: position[0], y: position[1] };
    saveConfig(config);
  });

  // Save window size when resized (if resizable is enabled in future)
  mainWindow.on('resized', () => {
    const size = mainWindow.getSize();
    const config = loadConfig();
    config.windowSize = { width: size[0], height: size[1] };
    saveConfig(config);
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Set always on top with desktop level (behind normal windows but above desktop)
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    
    // Set opacity for subtle gadget appearance
    mainWindow.setOpacity(1.0);
    
    // Don't focus the window to avoid interrupting user workflow
    mainWindow.blur();
    
    // Optional: Set window to be slightly transparent
    // mainWindow.setOpacity(0.95); // Commented out for debugging
  });

  // Handle minimize to tray
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Handle close to tray (optional - can be changed to quit)
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Development tools (uncomment for debugging)
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.webContents.openDevTools();
  // }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

app.on('window-all-closed', () => {
  // Don't quit when all windows are closed - keep running in tray
  // Only quit when explicitly requested
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for window controls
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('toggle-always-on-top', () => {
  if (mainWindow) {
    const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isAlwaysOnTop, 'floating');
    
    // Save the new always-on-top setting
    const config = loadConfig();
    config.alwaysOnTop = !isAlwaysOnTop;
    saveConfig(config);
    
    return !isAlwaysOnTop;
  }
  return false;
});

// IPC handlers for configuration
ipcMain.handle('load-config', () => {
  return loadConfig();
});

ipcMain.handle('save-config', (event, newConfig) => {
  const config = loadConfig();
  const updatedConfig = { ...config, ...newConfig };
  saveConfig(updatedConfig);
  return updatedConfig;
});

ipcMain.handle('save-timezones', (event, timezones) => {
  const config = loadConfig();
  config.timezones = timezones;
  saveConfig(config);
  return config;
});

ipcMain.handle('save-view-mode', (event, viewMode) => {
  const config = loadConfig();
  config.viewMode = viewMode;
  saveConfig(config);
  return config;
});

// Handle app protocol for Windows (optional)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('world-clock-gadget', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('world-clock-gadget');
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // For development, ignore certificate errors
  if (process.env.NODE_ENV === 'development') {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Auto-updater (for future use)
// const { autoUpdater } = require('electron-updater');
// app.on('ready', () => {
//   autoUpdater.checkForUpdatesAndNotify();
// });