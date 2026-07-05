/**
 * NLP Quick-Log — turn a free-form sentence into stat deltas.
 *
 * Examples the parser handles:
 *   "did 50 pushups"           → strength +2
 *   "ran for 30 minutes"       → strength +2, vitality +1
 *   "studied 1 chapter"        → intelligence +2
 *   "read 10 pages"            → intelligence +1
 *   "meditated 10 min"         → willpower +1, vitality +1
 *   "walked 4000 steps"        → vitality +1
 *   "completed my workout"     → strength +1
 *
 * Why bother with hand-rolled NLP instead of asking the LLM?
 *   1. Latency — quick-log needs to feel instant (<10ms).
 *   2. Privacy — the user's actions never leave the device.
 *   3. Cost — these phrases are predictable; regex + heuristics win.
 *
 * LLM escalation only happens on phrases the parser can't classify —
 * and even then, we degrade gracefully rather than guess.
 */

import type { StatType } from '../types';

export interface QuickLogResult {
  /** Human-readable summary, e.g. "Logged: 50 pushups → +2 STR" */
  summary: string;
  /** Map of stat → points to credit. */
  deltas: Partial<Record<StatType, number>>;
  /** True if the parser was confident the input matched an activity. */
  recognized: boolean;
  /** Optional echo of the strongest detected activity. */
  primaryActivity?: string;
}

interface ActivityRule {
  /** Regex(s) matched against lowercased input. */
  patterns: RegExp[];
  /** Default stat deltas (time/intensity multipliers applied later). */
  baseDeltas: Partial<Record<StatType, number>>;
  /** Logical activity name. */
  activity: string;
}

/**
 * Order matters: most specific rules first. The first activity to
 * match wins; we don't double-credit for "did 50 pushups and ran
 * 30 minutes" (operator can split into two logs).
 */
const RULES: ActivityRule[] = [
  {
    activity: 'reading_pages',
    patterns: [/\b(read|reading)\s*(\d+)\s*(pages?|chapters?)\b/i],
    baseDeltas: { intelligence: 1 },
  },
  {
    activity: 'reading_chapter',
    patterns: [/\b(finished|completed)\s*(a|one|the)?\s*(book|chapter)\b/i, /\bbook\s*chapter(s)?\b/i],
    baseDeltas: { intelligence: 2, willpower: 1 },
  },
  {
    activity: 'study',
    patterns: [/\b(stud(y|ied)|study session|study block|focused? study|deep work)\b/i],
    baseDeltas: { intelligence: 2, willpower: 1 },
  },
  {
    activity: 'meditation',
    patterns: [/\b(meditat(e|ed|ion)|breathing|breathwork|box breathing)\b/i],
    baseDeltas: { willpower: 1, vitality: 1 },
  },
  {
    activity: 'reading_minutes',
    patterns: [/\b(read|reading)\s*(for\s*)?(\d+)\s*(min|minutes|mins)\b/i],
    baseDeltas: { intelligence: 1 },
  },
  {
    activity: 'run',
    patterns: [/\b(run|ran|running|jog(ged|ging)?)\s*(for\s*)?(\d+)?\s*(min|minutes|mins|km|miles?)?\b/i],
    baseDeltas: { strength: 1, agility: 1, vitality: 1 },
  },
  {
    activity: 'walk',
    patterns: [/\b(walk(ed|ing|s)?|cold walk)\b/i],
    baseDeltas: { vitality: 1, agility: 1 },
  },
  {
    activity: 'steps',
    patterns: [/(\d+)\s*(steps|k steps)\b/i],
    baseDeltas: { vitality: 1 },
  },
  {
    activity: 'pushups',
    patterns: [/\b(push\s*ups?|pushups?|press\s*ups?)\s*(\d+)?/i],
    baseDeltas: { strength: 2 },
  },
  {
    activity: 'squats',
    patterns: [/\b(squat(s|ted|ting)?)\s*(\d+)?/i],
    baseDeltas: { strength: 2, vitality: 1 },
  },
  {
    activity: 'situps',
    patterns: [/\b(sit\s*ups?|situps?|crunch(es)?|crunched)\s*(\d+)?/i],
    baseDeltas: { strength: 1, agility: 1 },
  },
  {
    activity: 'plank',
    patterns: [/\bplank(ed|ing)?\b/i, /\b(\d+)\s*(sec|seconds|secs|min|minutes)\s*(plank|hold)\b/i],
    baseDeltas: { willpower: 2, strength: 1 },
  },
  {
    activity: 'lift',
    patterns: [/\b(lift(ed|ing|s)?|deadlift|squat|bench(ed)?|press(ed)?)\b/i],
    baseDeltas: { strength: 2, vitality: 1 },
  },
  {
    activity: 'cardio',
    patterns: [/\b(cardio|hiit|sprints?|jump(ed|ing)?\s*rope)\b/i],
    baseDeltas: { vitality: 2, agility: 1, strength: 1 },
  },
  {
    activity: 'yoga',
    patterns: [/\b(yoga|stretch(ed|ing)?|mobility)\b/i],
    baseDeltas: { agility: 2, vitality: 1 },
  },
  {
    activity: 'cold_exposure',
    patterns: [/\b(cold\s*shower|cold\s*plunge|ice\s*bath|ice\s*plunge)\b/i],
    baseDeltas: { willpower: 3, vitality: 1 },
  },
  {
    activity: 'sleep',
    patterns: [/\b(sleep|slept)\s*(for\s*)?(\d+)?\s*(hours?|hrs|h)\b/i],
    baseDeltas: { vitality: 2, willpower: 1 },
  },
  {
    activity: 'social',
    patterns: [/\b(had a conversation|met (a|with)\s*(friend|people)|called\s*(a|my)\s*(friend|mom|dad|parent))/i],
    baseDeltas: { social: 2, willpower: 1 },
  },
  {
    activity: 'workout',
    patterns: [/\b(workout|trained|training|gym|lifted|session)\b/i],
    baseDeltas: { strength: 1, vitality: 1 },
  },
  {
    activity: 'no_phone',
    patterns: [/\b(no phone|phone in drawer|phone away|put my phone away)\b/i],
    baseDeltas: { willpower: 2, intelligence: 1 },
  },
];

/**
 * Apply a small multiplier based on count + duration heuristics.
 * Heuristic intent: more reps / more minutes → bigger reward, capped.
 */
function intensityMultiplier(input: string, activity: string): number {
  // Pull the first number we see; if none, treat as "1 session".
  const numMatch = input.match(/(\d+)\s*(min|minutes|mins|sec|seconds|secs|reps?|pgs?|pages|km|miles?|hours?|hrs|h|step)?\b/i);
  const n = numMatch ? parseInt(numMatch[1], 10) : 0;

  switch (activity) {
    case 'pushups':
    case 'squats':
    case 'situps':
    case 'steps':
    case 'reading_pages':
      // 1 point per ~25 units, capped
      if (n >= 100) return 2.0;
      if (n >= 50) return 1.5;
      if (n >= 25) return 1.0;
      if (n > 0) return 0.5;
      return 0.5;
    case 'sleep':
      // 7h+ is ideal
      if (n >= 7 && n <= 9) return 1.5;
      if (n >= 6) return 1.0;
      if (n > 0) return 0.5;
      return 0.5;
    case 'run':
    case 'study':
    case 'meditation':
    case 'reading_minutes':
    case 'plank':
      // minutes scale
      if (n >= 60) return 2.0;
      if (n >= 30) return 1.5;
      if (n >= 15) return 1.0;
      if (n > 0) return 0.5;
      return 0.5;
    default:
      return 1.0;
  }
}

function roundPoint(p: number): number {
  if (p < 0.25) return 0;
  return Math.round(p * 2) / 2;
}

/**
 * Public entry point. Returns the parsed deltas + a one-line summary
 * the UI can show back to the operator.
 *
 * @example
 *   const r = parseQuickLog("did 50 pushups");
 *   // → { summary: "Logged: 50 pushups → +1.5 STR", deltas: { strength: 1.5 }, recognized: true }
 */
export function parseQuickLog(input: string): QuickLogResult {
  const text = (input || '').trim();
  if (!text) {
    return { summary: 'Empty input.', deltas: {}, recognized: false };
  }

  const lower = text.toLowerCase();
  for (const rule of RULES) {
    const matched = rule.patterns.find(p => p.test(lower));
    if (!matched) continue;

    const multiplier = intensityMultiplier(lower, rule.activity);
    const deltas: Partial<Record<StatType, number>> = {};
    for (const [stat, base] of Object.entries(rule.baseDeltas) as [StatType, number][]) {
      const scaled = roundPoint((base ?? 0) * multiplier);
      if (scaled > 0) deltas[stat] = scaled;
    }

    const summaryParts: string[] = [];
    for (const [stat, value] of Object.entries(deltas) as [StatType, number][]) {
      summaryParts.push(`+${value} ${stat.toUpperCase()}`);
    }

    return {
      summary:
        summaryParts.length > 0
          ? `Logged: ${rule.activity.replace(/_/g, ' ')} → ${summaryParts.join(', ')}`
          : `Detected ${rule.activity.replace(/_/g, ' ')} but no credit earned.`,
      deltas,
      recognized: true,
      primaryActivity: rule.activity,
    };
  }

  return {
    summary: `Didn't recognize "${text.slice(0, 40)}". Try phrasing like "did 50 pushups" or "studied 30 min".`,
    deltas: {},
    recognized: false,
  };
}
