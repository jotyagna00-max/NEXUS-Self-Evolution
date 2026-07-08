/**
 * Secure storage wrapper.
 * In production (Electron), uses Electron's safeStorage for API keys.
 * In development, falls back to localStorage.
 * API is async to support future Electron safeStorage integration.
 */

interface StorageBackend {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function isElectron(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
}

let _secureBackend: StorageBackend | null = null;
let _initPromise: Promise<void> | null = null;

async function initSecureStorage(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (isElectron()) {
      // TODO: Implement Electron safeStorage when @electron/renderer is available
      // For now, fall back to localStorage with a clear migration path
      _secureBackend = localStorageBackend;
    } else {
      _secureBackend = localStorageBackend;
    }
  })();

  return _initPromise;
}

const localStorageBackend: StorageBackend = {
  getItem(key: string): Promise<string | null> {
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

/**
 * Initialize secure storage. Call once at app startup.
 */
export async function initStorage(): Promise<void> {
  await initSecureStorage();
}

/**
 * Get a sensitive value (API keys, tokens, etc.)
 */
export async function getSecure(key: string): Promise<string | null> {
  await initSecureStorage();
  return _secureBackend!.getItem(key);
}

/**
 * Set a sensitive value
 */
export async function setSecure(key: string, value: string): Promise<void> {
  await initSecureStorage();
  return _secureBackend!.setItem(key, value);
}

/**
 * Remove a sensitive value
 */
export async function removeSecure(key: string): Promise<void> {
  await initSecureStorage();
  return _secureBackend!.removeItem(key);
}

/**
 * Keys for secure storage
 */
export const SECURE_KEYS = {
  LM_STUDIO_TOKEN: 'LM_STUDIO_TOKEN',
} as const;

/**
 * Synchronous fallback for non-async contexts (e.g., React state initializers).
 * Uses localStorage directly. Prefer async versions above when possible.
 */
export function getSecureSync(key: string): string | null {
  return localStorage.getItem(key);
}

export function setSecureSync(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeSecureSync(key: string): void {
  localStorage.removeItem(key);
}