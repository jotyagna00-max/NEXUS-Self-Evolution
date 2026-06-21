import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow = null;

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, '0.0.0.0');
  });
}

const storePath = path.join(app.getPath('userData'), 'nexus-store.json');
let storeData = {};
if (fs.existsSync(storePath)) {
  try { storeData = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch {}
}

function saveStore() {
  try { fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2)); } catch {}
}

async function startServer() {
  const express = (await import('express')).default;
  const serverApp = express();
  const PORT = 3000;

  serverApp.use(express.json());

  serverApp.post('/api/community/sync', async (req, res) => {
    const { content, authorName, type, timestamp } = req.body;
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) return res.json({ status: 'skipped', reason: 'webhook_not_configured' });
    try {
      const response = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Nexus Core Community',
          avatar_url: 'https://picsum.photos/seed/nexus/200/200',
          embeds: [{
            title: `New ${type.toUpperCase()} Transmission`,
            description: content,
            color: type === 'achievement' ? 0xFBBF24 : type === 'progress' ? 0x3B82F6 : 0x10B981,
            fields: [
              { name: 'Operator', value: authorName, inline: true },
              { name: 'Sync Time', value: new Date(timestamp).toLocaleString(), inline: true },
            ],
            footer: { text: 'Nexus Core Neural Link' },
          }],
        }),
      });
      if (!response.ok) throw new Error(`Discord API responded with ${response.status}`);
      res.json({ status: 'synced', platform: 'discord' });
    } catch (error) {
      console.error('Community Sync Error:', error);
      res.status(500).json({ error: 'Failed to sync transmission.' });
    }
  });

  serverApp.post('/api/feedback/send', async (req, res) => {
    const { category, label, message } = req.body;
    try {
      const response = await fetch('https://formspree.io/f/xykqgopw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `[NEXUS Feedback] ${label}`,
          email: 'user@nexus.app',
          Category: label,
          Message: message,
        }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    serverApp.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '..', 'dist');
    serverApp.use(express.static(distPath));
    serverApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return new Promise((resolve) => {
    serverApp.listen(PORT, '0.0.0.0', () => {
      console.log(`Nexus Core running on http://localhost:${PORT}`);
      resolve();
    });
  });
}

async function createWindow() {
  const portInUse = await isPortInUse(3000);
  if (!portInUse) {
    await startServer();
  } else {
    console.log('Server already running on port 3000 — connecting to existing instance');
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'NEXUS - Self Evolution System',
    backgroundColor: '#0a0a0f',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('store:get-all', () => storeData);
ipcMain.on('store:set', (event, key, value) => {
  storeData[key] = value;
  saveStore();
});
ipcMain.on('store:delete', (event, key) => {
  delete storeData[key];
  saveStore();
});
ipcMain.on('store:clear', () => {
  storeData = {};
  saveStore();
});

ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-platform', () => process.platform);

const UPDATE_FALLBACK_URL = 'https://raw.githubusercontent.com/jotyagna00-max/NEXUS-Self-Evolution/main/electron/version.json';
const UPDATE_URL = isDev
  ? `file://${path.join(__dirname, 'version.json')}`
  : 'https://nexus-iota-beige.vercel.app/update/version.json';

async function checkForUpdates() {
  const result = { available: false, version: app.getVersion(), url: '' };
  if (isDev) {
    try {
      const local = JSON.parse(fs.readFileSync(path.join(__dirname, 'version.json'), 'utf-8'));
      if (compareVersions(local.latestVersion, result.version) > 0) {
        result.available = true;
        result.version = local.latestVersion;
        result.url = local.downloadUrl || local.url || '';
        mainWindow.webContents.send('update:available', { version: result.version, url: result.url });
      }
    } catch {}
    return result;
  }

  const urls = [UPDATE_URL, UPDATE_FALLBACK_URL];
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const remote = await res.json();
      if (compareVersions(remote.latestVersion, result.version) > 0) {
        result.available = true;
        result.version = remote.latestVersion;
        result.url = remote.downloadUrl || remote.url || '';
        mainWindow.webContents.send('update:available', { version: result.version, url: result.url });
      }
      return result;
    } catch (e) {
      console.error(`Update check failed (${url}):`, e.message);
    }
  }
  return result;
}

ipcMain.handle('update:check', async () => {
  return await checkForUpdates();
});

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

let downloadAbortController = null;

ipcMain.handle('update:start-download', async (event, url) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save NEXUS Update',
    defaultPath: 'NEXUS-Setup.exe',
    filters: [{ name: 'Installer', extensions: ['exe'] }],
  });
  if (result.canceled) return { canceled: true };

  const installerPath = result.filePath;
  downloadAbortController = new AbortController();

  const response = await fetch(url, { signal: downloadAbortController.signal });
  const total = parseInt(response.headers.get('content-length') || '0', 10);
  let downloaded = 0;

  const reader = response.body.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    downloaded += value.length;
    if (total > 0) {
      mainWindow.webContents.send('download:progress', Math.round((downloaded / total) * 100));
    }
  }

  const buffer = Buffer.concat(chunks);
  fs.writeFileSync(installerPath, buffer);
  mainWindow.webContents.send('download:complete', installerPath);
  return { success: true, path: installerPath };
});

ipcMain.handle('update:cancel-download', () => {
  if (downloadAbortController) {
    downloadAbortController.abort();
    downloadAbortController = null;
  }
});

ipcMain.handle('update:install', async (event, installerPath) => {
  const { exec } = await import('child_process');
  exec(`"${installerPath}"`, (err) => {
    if (err) console.error('Failed to launch installer:', err);
  });
  app.quit();
});
