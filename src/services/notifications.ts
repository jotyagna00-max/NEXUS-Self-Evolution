/**
 * R-12 — bi-weekly debrief notification helper.
 *
 * Wraps `window.electronAPI.showNotification` if available, otherwise falls
 * back to the in-app pushNotification stream. Calling code never needs to
 * know which path succeeded.
 */
import { AppNotification } from '../types';

interface ShowOpts {
  title: string;
  body: string;
  /** AppNotification object to fire as a fallback toast. */
  fallback: AppNotification;
}

interface ElectronAPI {
  showNotification?: (payload: { title: string; body: string }) => Promise<{ supported: boolean; shown?: boolean; error?: string }>;
  onNotificationClicked?: (callback: (data: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export async function showDebriefNotification({ title, body, fallback }: ShowOpts): Promise<{ delivered: boolean; via: 'os' | 'in-app' }> {
  const api = window.electronAPI;
  if (api?.showNotification) {
    try {
      const res = await api.showNotification({ title, body });
      if (res && (res.supported === false)) {
        return fireFallback(fallback);
      }
      if (res && res.shown) {
        return { delivered: true, via: 'os' };
      }
      return fireFallback(fallback);
    } catch (e: any) {
      return fireFallback(fallback);
    }
  }
  return fireFallback(fallback);
}

function fireFallback(notif: AppNotification): { delivered: boolean; via: 'os' | 'in-app' } {
  // Console-level fallback so devs see it in dev tools
  console.info('[NEXUS Debrief]', notif.title, '-', notif.description);
  // Caller pushes via pushNotification separately (after this helper returns)
  return { delivered: false, via: 'in-app' };
}

export function subscribeToNotificationClicks(cb: (data: any) => void): () => void {
  if (!window.electronAPI?.onNotificationClicked) return () => {};
  window.electronAPI.onNotificationClicked(cb);
  return () => { /* no-op unsubscribe; lifetime tied to app */ };
}

/** Returns true if more than `days` have passed since `since` (ISO timestamp). */
export function shouldFireDebrief(since: string | null, days: number, now: Date = new Date()): boolean {
  if (!since) return true;
  const last = new Date(since);
  if (isNaN(last.getTime())) return true;
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= days;
}
