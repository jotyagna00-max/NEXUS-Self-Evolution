/**
 * Sliding-window math for the Consistency tracker.
 *
 * The consistency score is computed from the past 7 calendar days
 * (rolling, not "this week's days-of-week"). Each day is either
 * `completed: true` or `false`.
 *
 * Why sliding and not day-of-week bucketed? Because a 17-year-old who
 * disappears for a fortnight must NOT still see "5/7" — they should
 * see "0/7" until they actually do something today.
 */

export interface DayCompletion {
  /** YYYY-MM-DD */
  date: string;
  completed: boolean;
}

export const todayISO = (): string => new Date().toISOString().split('T')[0];

/**
 * Generate the last 7 days (oldest → today), all marked incomplete.
 * Used for fresh installs.
 */
export function buildEmptyWindow(now: Date = new Date()): DayCompletion[] {
  const days: DayCompletion[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().split('T')[0], completed: false });
  }
  return days;
}

/**
 * Rotate `window` so it always ends at `todayISO()` and contains 7
 * consecutive days (oldest → today). Today's entry is preserved with
 * its existing `completed` value if it already existed; new today is
 * pushed as `completed: false`.
 */
export function rotateWindow(
  window: DayCompletion[],
  today: string = todayISO(),
): DayCompletion[] {
  const lastDate = window.length > 0 ? window[window.length - 1].date : null;
  if (lastDate === today && window.length === 7) return window;

  // Build a map of existing entries by date so we can preserve `completed`.
  const map = new Map<string, boolean>();
  for (const entry of window) map.set(entry.date, entry.completed);

  // Walk backward from today, filling 7 slots.
  const todayDate = new Date(today + 'T00:00:00');
  const result: DayCompletion[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    result.push({ date: iso, completed: map.get(iso) ?? false });
  }
  return result;
}

/**
 * Mark `today` as completed (or not) in the sliding window. Returns the
 * updated window — does not mutate input. Safe to call repeatedly on
 * the same day; the underlying entry is preserved.
 */
export function markToday(
  window: DayCompletion[],
  completed: boolean,
  today: string = todayISO(),
): DayCompletion[] {
  const rotated = rotateWindow(window, today);
  return rotated.map(entry =>
    entry.date === today ? { ...entry, completed } : entry,
  );
}

/** Count completed entries in the window (0–7). */
export function windowCompletions(window: DayCompletion[]): number {
  let n = 0;
  for (const e of window) if (e.completed) n += 1;
  return n;
}

/**
 * Compute the consistency score as a 0-100 integer from the window.
 * Score = completed / 7 * 100, rounded.
 */
export function scoreFromWindow(window: DayCompletion[]): number {
  if (window.length === 0) return 0;
  return Math.round((windowCompletions(window) / 7) * 100);
}

/**
 * Migrate a stale `boolean[]` (legacy day-of-week buckets) into the new
 * sliding structure. Old values are dropped — the new window is rebuilt
 * around the operator's actual last-known score so the cumulative total
 * doesn't immediately collapse to 0 on app upgrade.
 */
export function migrateLegacyBooleanWindow(
  legacy: boolean[],
): DayCompletion[] {
  return buildEmptyWindow();
}

/**
 * Coerce a string|JSON entry from localStorage back into a usable
 * ConsistencyData `last7Days`. Accepts:
 *  - the new shape `{date, completed}[]` (passthrough)
 *  - the legacy `[true, false, ...]` shape (rebuilt empty)
 *  - garbage (returns a fresh empty window)
 */
export function coerceWindow(raw: unknown): DayCompletion[] {
  if (!Array.isArray(raw)) return buildEmptyWindow();
  if (raw.length === 0) return buildEmptyWindow();

  const first = raw[0] as unknown;
  if (typeof first === 'boolean') {
    return migrateLegacyBooleanWindow(raw as boolean[]);
  }
  if (
    typeof first === 'object' &&
    first !== null &&
    'date' in first &&
    'completed' in first
  ) {
    return raw as DayCompletion[];
  }
  return buildEmptyWindow();
}
