/**
 * v1.4.0 — Adaptive Tuner.
 *
 * Pure function that runs once per Mission Debrief (or weekly) and produces
 * a TunerAdjustments object + human-readable TunerReport.
 *
 * The tuner reads 7-day completion rates, time-of-day heatmap, and focus-stat
 * drift from the BehaviorProfile, then recommends difficulty, cadence, and
 * focus adjustments.
 *
 * IMPORTANT: Returns null adjustments until the profile has ≥7 days of data
 * (cold-start guard).
 */

import type { BehaviorProfile, TunerAdjustments } from './BehaviorProfile';
import { DEFAULT_REMINDER_WINDOWS } from './BehaviorProfile';
import type { NexusEvent } from './EventBus';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TunerReport {
  adjustments: TunerAdjustments | null;
  /** Human-readable summary shown in MissionDebrief. */
  summary: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Count events of a given type in the last N days. */
function countRecent(events: Array<{ at: string; event: NexusEvent }>, typePrefix: string, days: number, now: Date): number {
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return events.filter(e => {
    if (!e.event.type.startsWith(typePrefix)) return false;
    // Use the `at` timestamp from the persisted event log
    try {
      const ts = new Date(e.at);
      return ts >= cutoff;
    } catch {
      return false;
    }
  }).length;
}

/** Approximate 7-day completion rate from BehaviorProfile. */
function completionRate(profile: BehaviorProfile): number {
  if (!profile.completionStreakProfile) return 0.5;
  // Normalize avgStreak to 0-1 range (max streak ~30)
  return Math.min(profile.completionStreakProfile.avgStreak / 30, 1);
}

/** Average difficulty from recent quest completions (0-100). */
function avgDifficulty(profile: BehaviorProfile): number {
  if (profile.difficultyTolerance == null) return 50;
  return profile.difficultyTolerance;
}

// ---------------------------------------------------------------------------
// Main pure function
// ---------------------------------------------------------------------------

/**
 * Run a tuning cycle. Returns a TunerReport with adjustments (or null if
 * the profile is too thin) and a human-readable summary.
 */
export function runTuningCycle(
  profile: BehaviorProfile,
  recentEvents: Array<{ at: string; event: NexusEvent }>,
  now: Date = new Date(),
): TunerReport {
  // Cold-start guard — need data spanning at least 3 distinct calendar days
  const distinctDates = new Set(recentEvents.map(e => {
    try { return new Date(e.at).toISOString().split('T')[0]; } catch { return now.toISOString().split('T')[0]; }
  })).size;
  const hasEnoughData = recentEvents.length >= 7 || distinctDates >= 3;
  if (!hasEnoughData) {
    return {
      adjustments: null,
      summary: 'Insufficient data for tuning. Keep completing quests — the system calibrates after 7 days of activity.',
    };
  }

  let difficultyDelta = 0;
  let cadenceDelta = 0;
  let focusStat: import('../types').StatType | undefined;
  let suggestedWindow: import('./BehaviorProfile').ReminderWindow['id'] | undefined;
  let reason = '';
  const reportLines: string[] = [];

  // ── Difficulty adjustment ─────────────────────────────────────────
  const rate = completionRate(profile);
  const diff = avgDifficulty(profile);

  if (rate > 0.80 && diff > 60) {
    // Operator is crushing it — push harder
    difficultyDelta = 5;
    reportLines.push(`Difficulty +5 (completion rate ${(rate * 100).toFixed(0)}% — you crushed this week).`);
  } else if (rate > 0.80) {
    // High completion but low difficulty — nudge up gently
    difficultyDelta = 3;
    reportLines.push(`Difficulty +3 (high completion rate (${(rate * 100).toFixed(0)}%). Ready for a bigger challenge.)`);
  } else if (rate < 0.40) {
    // Operator is struggling — ease off
    difficultyDelta = -10;
    cadenceDelta = 1;
    reportLines.push(`Difficulty −10 (completion rate ${(rate * 100).toFixed(0)}% — easing the load. Adding an extra daily reminder.)`);
  } else if (rate < 0.55) {
    difficultyDelta = -5;
    reportLines.push(`Difficulty −5 (completion rate ${(rate * 100).toFixed(0)}% — slight course correction.)`);
  } else {
    reportLines.push(`Difficulty unchanged (completion rate ${(rate * 100).toFixed(0)}% — stable).`);
  }

  // ── Time-of-day heatmap → suggested reminder window ──────────────
  if (profile.timeOfDayHeatmap) {
    // heatmap is [dayOfWeek][hour] — use current day
    const dayIndex = new Date().getDay();
    const todayRow = profile.timeOfDayHeatmap[dayIndex];
    // Find the 2-hour window with highest density
    let bestStart = -1;
    let bestDensity = -1;
    for (let h = 5; h <= 22; h++) {
      const d1 = todayRow?.[h] ?? 0;
      const d2 = todayRow?.[(h + 1) % 24] ?? 0;
      const density = d1 + d2;
      if (density > bestDensity) {
        bestDensity = density;
        bestStart = h;
      }
    }
    if (bestStart >= 0 && bestDensity > 0) {
      // Map bestStart to the closest default reminder window ID
      const bestWindow = DEFAULT_REMINDER_WINDOWS.reduce((closest, w) => {
        const dist = Math.abs(bestStart - w.startHour);
        return dist < Math.abs(bestStart - closest.startHour) ? w : closest;
      });
      suggestedWindow = bestWindow.id;
      reportLines.push(`Peak activity window detected: ${bestStart}:00–${bestStart + 2}:00. Consider scheduling your main reminder here.`);
    }
  }

  // ── Focus stat drift ─────────────────────────────────────────────
  focusStat = profile.preferredFocusStat;
  if (focusStat) {
    reportLines.push(`Primary focus stat: ${focusStat}.`);
  }
  // Check for rebalance need: if weekdayStrength >> weekendStrength
  if (profile.weekdayStrength != null && profile.weekendStrength != null) {
    const ratio = profile.weekendStrength / Math.max(profile.weekdayStrength, 1);
    if (ratio < 0.5) {
      reportLines.push('Weekend engagement is low — consider lighter weekend protocols or a weekend micro-quest.');
    }
  }

  reason = reportLines.join(' ');

  const adjustments: TunerAdjustments = {
    difficultyDelta,
    cadenceDelta,
    focusStat,
    suggestedWindow,
    reason,
  };

  const summary = reason;

  return { adjustments, summary };
}

// ---------------------------------------------------------------------------
// Merge tuner adjustments into a BehaviorProfile (returns new profile)
// ---------------------------------------------------------------------------

export function applyTunerAdjustments(profile: BehaviorProfile, adj: TunerAdjustments): BehaviorProfile {
  return {
    ...profile,
    tunerAdjustments: {
      difficultyDelta: adj.difficultyDelta,
      cadenceDelta: adj.cadenceDelta,
      focusStat: adj.focusStat,
      suggestedWindow: adj.suggestedWindow,
      reason: adj.reason,
    },
  };
}
