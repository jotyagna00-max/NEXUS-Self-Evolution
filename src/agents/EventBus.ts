/**
 * v1.4.0 — Agent Mesh Foundation: typed pub/sub EventBus.
 *
 * Every meaningful state change in the app publishes a typed event here.
 * Agents, the Behavior Profiler, the Adaptive Tuner, the Reminder Scheduler,
 * and the toast system all subscribe to whatever slice they care about.
 *
 * Persistence: the last 50 events are kept in localStorage (`nexus_event_log`)
 * so the Progress Tracker and AdaptiveTuner can read history without the
 * bus being held in memory across reloads.
 */

import type { StatType } from '../types';

/** All events the mesh can publish. */
export type NexusEvent =
  | { type: 'protocol.activated'; protocolId: string; stat: StatType; kind: string }
  | { type: 'book.activated'; bookId: string; title: string }
  | { type: 'book.progress_logged'; bookId: string; pagesRead: number; total: number }
  | { type: 'habit.created'; habitId: string; title: string; isAddiction: boolean }
  | { type: 'habit.destroyed'; habitId: string; title: string }
  | { type: 'task.completed'; taskId: string; stat: StatType; difficulty: number }
  | { type: 'quest.completed'; questId: string; stat: StatType; difficulty: number }
  | { type: 'achievement.unlocked'; achievementId: string; category: string }
  | { type: 'streak.broken'; previousStreak: number }
  | { type: 'rest_token.spent'; remaining: number }
  | { type: 'exp.gained'; amount: number; stat?: StatType }
  | { type: 'stat.increased'; stat: StatType; delta: number; newValue: number };

export type NexusEventType = NexusEvent['type'];
export type NexusEventPayload<E extends NexusEventType> = Extract<NexusEvent, { type: E }>;

type Handler<E extends NexusEventType = NexusEventType> = (
  payload: any,
) => void | Promise<void>;

const LOG_KEY = 'nexus_event_log';
const LOG_CAP = 50;

function readLog(): Array<{ at: string; event: NexusEvent }> {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-LOG_CAP);
  } catch {
    return [];
  }
}

function appendLog(event: NexusEvent) {
  try {
    const log = readLog();
    log.push({ at: new Date().toISOString(), event });
    if (log.length > LOG_CAP) log.splice(0, log.length - LOG_CAP);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    /* ignore quota errors — log is best-effort */
  }
}

/** Read the persisted event log (used by ProgressTracker + AdaptiveTuner). */
export function getEventLog(): Array<{ at: string; event: NexusEvent }> {
  return readLog();
}

/** Clear the event log (used by `resetAllData`). */
export function clearEventLog(): void {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch {
    /* noop */
  }
}

class EventBusImpl {
  // We use a loose (any → any) signature internally so callers can write
  // strongly-typed subscribers; the public `subscribe<E>(event, fn)` API
  // gives callers the right narrowed payload type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Map<NexusEventType, Set<Handler<any>>> = new Map();

  /** Subscribe to a specific event type. Returns an unsubscribe function. */
  subscribe<E extends NexusEventType>(
    event: E,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (payload: Extract<NexusEvent, { type: E }>) => void | Promise<void>,
  ): () => void {
    const set = (this.handlers.get(event) || new Set()) as Set<Handler<E>>;
    // Wrap into the loose Handler type for storage.
    set.add(handler as unknown as Handler<E>);
    this.handlers.set(event, set as unknown as Set<Handler<typeof event>>);
    return () => {
      set.delete(handler as unknown as Handler<E>);
    };
  }

  /** Subscribe to every event. Returns an unsubscribe function. */
  subscribeAll(handler: (payload: NexusEvent) => void | Promise<void>): () => void {
    const unsubs: Array<() => void> = [];
    const events: NexusEventType[] = [
      'protocol.activated', 'book.activated', 'book.progress_logged',
      'habit.created', 'habit.destroyed',
      'task.completed', 'quest.completed', 'achievement.unlocked',
      'streak.broken', 'rest_token.spent',
      'exp.gained', 'stat.increased',
    ];
    for (const e of events) {
      // Wrap the union handler into a per-event handler.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsubs.push(this.subscribe(e as any, handler as any));
    }
    return () => unsubs.forEach(fn => fn());
  }

  /** Publish a typed event. Handlers may be async but the publish is fire-and-forget. */
  publish<E extends NexusEventType>(event: E, // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    payload: any): void {
    const fullEvent = { ...payload, type: event } as NexusEvent;
    appendLog(fullEvent);
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        const result = (handler as (p: NexusEvent) => void | Promise<void>)(fullEvent);
        if (result && typeof (result as Promise<void>).then === 'function') {
          (result as Promise<void>).catch(() => {});
        }
      } catch {
        /* handler error must not break other handlers */
      }
    }
  }

  /** Synchronous flush — useful in tests. */
  size(event?: NexusEventType): number {
    if (event) return this.handlers.get(event)?.size || 0;
    let total = 0;
    for (const set of this.handlers.values()) total += set.size;
    return total;
  }
}

/** Singleton bus — every component imports this same instance. */
export const eventBus = new EventBusImpl();