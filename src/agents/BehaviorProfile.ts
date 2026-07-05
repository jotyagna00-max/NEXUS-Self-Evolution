/**
 * v1.4.0 — Behavior Profiler.
 *
 * Pure-data shape + pure helpers. The GameContext holds the live profile
 * in state and persists it to localStorage. Every agent reads this when
 * generating copy; the AdaptiveTuner mutates it once per tuning cycle.
 *
 * Why pure functions: easy to unit-test, no React/DOM dependencies.
 */

import type { StatType, UserStats } from '../types';
import type { NexusEvent } from './EventBus';

/** Heatmap = 24 hours × 7 days. Each cell is the count of completions at that slot. */
export type Heatmap = number[][]; // [dayOfWeek][hour]

/** Reminder window the operator configured in Profile. */
export interface ReminderWindow {
  id: 'morning' | 'midday' | 'evening';
  label: string;
  startHour: number; // 0–23
  endHour: number;   // 0–23 (exclusive)
  enabled: boolean;
}

export const DEFAULT_REMINDER_WINDOWS: ReminderWindow[] = [
  { id: 'morning', label: 'Morning Briefing', startHour: 7, endHour: 8, enabled: true },
  { id: 'midday',  label: 'Mid-Day Check-In', startHour: 12, endHour: 13, enabled: false },
  { id: 'evening', label: 'Evening Debrief',  startHour: 19, endHour: 20, enabled: true },
];

export interface TunerAdjustments {
  difficultyDelta: number; // applied to future quest generation
  cadenceDelta: number;    // extra reminders per day
  focusStat?: StatType;    // recommended rebalance target
  suggestedWindow?: ReminderWindow['id'];
  reason: string;
}

export interface TunerReport {
  ranAt: string;
  adjustments: TunerAdjustments | null;
  human: string; // multi-line string for the MissionDebrief sub-panel
  completionRate7d: number; // 0..1
  avgDifficulty7d: number;
  totalEvents7d: number;
}

export interface BehaviorProfile {
  timeOfDayHeatmap: Heatmap;          // [7][24]
  preferredFocusStat?: StatType;      // most-improved or most-active
  weekdayStrength: number;            // 0..1
  weekendStrength: number;            // 0..1
  completionStreakProfile: {
    avgStreak: number;
    longestStreak: number;
    recoveryCount: number;
  };
  reminderResponseRate: Record<ReminderWindow['id'], number>; // completions within 60 min / total fires
  difficultyTolerance: number;        // avg difficulty of completed quests
  tonePreference?: 'stoic' | 'tactical' | 'literary';
  tunerAdjustments: TunerAdjustments | null;
  lastTunerRunAt: string | null;
  lastUpdated: string;
}

export function emptyBehaviorProfile(): BehaviorProfile {
  return {
    timeOfDayHeatmap: Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0)),
    weekdayStrength: 0,
    weekendStrength: 0,
    completionStreakProfile: { avgStreak: 0, longestStreak: 0, recoveryCount: 0 },
    reminderResponseRate: { morning: 0, midday: 0, evening: 0 },
    difficultyTolerance: 50,
    tunerAdjustments: null,
    lastTunerRunAt: null,
    lastUpdated: new Date().toISOString(),
  };
}

/** Heuristic focus stat: the lowest stat gets prioritized for "rebalance". */
export function inferWeakestFocusStat(stats: UserStats): StatType {
  const entries = Object.entries(stats) as Array<[StatType, number]>;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

/** Update the heatmap with a completion timestamp. Mutates and returns profile. */
export function recordCompletion(profile: BehaviorProfile, iso: string): BehaviorProfile {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return profile;
  const day = d.getDay();
  const hour = d.getHours();
  const next: BehaviorProfile = {
    ...profile,
    timeOfDayHeatmap: profile.timeOfDayHeatmap.map((row, i) =>
      i === day ? row.map((v, h) => (h === hour ? v + 1 : v)) : row,
    ),
    lastUpdated: new Date().toISOString(),
  };
  return next;
}

/** Recompute weekday vs weekend strength from the heatmap. */
export function recomputeWeekdayStrength(profile: BehaviorProfile): BehaviorProfile {
  let weekday = 0;
  let weekend = 0;
  profile.timeOfDayHeatmap.forEach((row, dayIdx) => {
    const sum = row.reduce((a, b) => a + b, 0);
    if (dayIdx === 0 || dayIdx === 6) weekend += sum;
    else weekday += sum;
  });
  const total = weekday + weekend || 1;
  return {
    ...profile,
    weekdayStrength: weekday / total,
    weekendStrength: weekend / total,
  };
}

/** Heuristic event-based profile update. Called from a bus subscriber on every event. */
export function recordEvent(profile: BehaviorProfile, event: NexusEvent): BehaviorProfile {
  let next = profile;
  if (event.type === 'task.completed' || event.type === 'quest.completed') {
    next = recordCompletion(next, new Date().toISOString());
    next = recomputeWeekdayStrength(next);
    next = {
      ...next,
      difficultyTolerance: next.difficultyTolerance * 0.85 + event.difficulty * 0.15,
    };
  }
  if (event.type === 'streak.broken') {
    next = {
      ...next,
      completionStreakProfile: {
        ...next.completionStreakProfile,
        recoveryCount: next.completionStreakProfile.recoveryCount + 1,
      },
    };
  }
  if (event.type === 'exp.gained') {
    if (event.stat && (!next.preferredFocusStat || Math.random() < 0.5)) {
      next = { ...next, preferredFocusStat: event.stat };
    }
  }
  return next;
}

/** Persist profile to localStorage. */
export function persistProfile(profile: BehaviorProfile): void {
  try {
    localStorage.setItem('nexus_behavior_profile', JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function loadProfile(): BehaviorProfile {
  try {
    const raw = localStorage.getItem('nexus_behavior_profile');
    if (!raw) return emptyBehaviorProfile();
    const parsed = JSON.parse(raw);
    // Merge any new fields the persisted version is missing.
    return { ...emptyBehaviorProfile(), ...parsed };
  } catch {
    return emptyBehaviorProfile();
  }
}