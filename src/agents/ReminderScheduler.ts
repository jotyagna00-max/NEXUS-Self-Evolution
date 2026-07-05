/**
 * v1.4.0 — Reminder Scheduler.
 *
 * Pure functions that decide "is it time to fire a reminder?" given the
 * operator's configured windows + last-fired timestamps.
 *
 * GameContext ticks this once a minute via setInterval. When `tick()`
 * returns due windows, the caller invokes the MotivatorAgent and pushes
 * a notification, then calls `markFired(id)`.
 */

import type { ReminderWindow } from './BehaviorProfile';

const LAST_FIRED_KEY = 'nexus_reminder_last_fired';
const WINDOWS_KEY = 'nexus_reminder_windows';

function readLastFired(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LAST_FIRED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* ignore */
  }
  return {};
}

function writeLastFired(map: Record<string, string>): void {
  try {
    localStorage.setItem(LAST_FIRED_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function loadLastFired(): Record<string, string> {
  return readLastFired();
}

export function markFired(id: string, when: Date = new Date()): void {
  const map = readLastFired();
  map[id] = when.toISOString();
  writeLastFired(map);
}

function loadWindows(): ReminderWindow[] {
  try {
    const raw = localStorage.getItem(WINDOWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveWindows(windows: ReminderWindow[]): void {
  try {
    localStorage.setItem(WINDOWS_KEY, JSON.stringify(windows));
  } catch {
    /* ignore */
  }
}

export function loadConfiguredWindows(): ReminderWindow[] {
  const stored = loadWindows();
  return stored.length ? stored : [];
}

/** Return windows that are due right now (and have not already fired today). */
export function tick(windows: ReminderWindow[], now: Date = new Date()): ReminderWindow[] {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const today = now.toISOString().split('T')[0];
  const lastFired = readLastFired();
  const due: ReminderWindow[] = [];

  for (const w of windows) {
    if (!w.enabled) continue;
    if (hour < w.startHour || hour >= w.endHour) continue;

    // Fire once per window per day, at least 60 min after the last fire to avoid spam.
    const lastIso = lastFired[w.id];
    if (lastIso && lastIso.startsWith(today)) continue;

    // The "tick" fires at :01 of each minute; only emit when minute is 0–4 to debounce.
    if (minute > 4) continue;

    due.push(w);
  }
  return due;
}

/** Clear all reminder state. Used on full data reset. */
export function reset(): void {
  try {
    localStorage.removeItem(LAST_FIRED_KEY);
    localStorage.removeItem(WINDOWS_KEY);
  } catch {
    /* ignore */
  }
}