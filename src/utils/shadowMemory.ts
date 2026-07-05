/**
 * ShadowMemory — long-term memory substrate for the SHADOW agent.
 *
 * Why a separate utility instead of stuffing into chatHistory?
 *   - Shadow memory persists across tabs and sessions (chatHistory is
 *     last-10 transient)
 *   - Different shape (tagged answers + chronological exchanges)
 *   - Reads from many places (AgentBase prompts, Penalty Zone narrative,
 *     Shadow greeting)
 *   - Independent cache key (nexus_shadow_memory_v1) so we can wipe or
 *     migrate in isolation
 */

import type { ShadowMemory as ShadowMemoryT, ShadowExchange } from '../types';

// Legacy alias: other modules (GameContext, ShadowChat) import `ShadowMemory`
// but the canonical local name is `ShadowMemoryT` to avoid colliding with
// the imported type. Exporting both keeps every existing import site working.
export type ShadowMemory = ShadowMemoryT;

const STORAGE_KEY = 'nexus_shadow_memory_v1';

export const emptyShadowMemory = (): ShadowMemoryT => ({
  answers: {},
  taunted: [],
  exchanges: [],
  patterns: [],
  updatedAt: null,
});

/** Read with fallback to a fresh memory. SSR-safe. */
export function loadShadowMemory(): ShadowMemoryT {
  if (typeof window === 'undefined') return emptyShadowMemory();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyShadowMemory();
    const parsed = JSON.parse(raw) as Partial<ShadowMemoryT>;
    return {
      answers: parsed.answers ?? {},
      taunted: parsed.taunted ?? [],
      exchanges: Array.isArray(parsed.exchanges) ? parsed.exchanges : [],
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      updatedAt: parsed.updatedAt ?? null,
      interrogationStatus: parsed.interrogationStatus,
      interrogationCurrentIndex: parsed.interrogationCurrentIndex ?? 0,
      interrogationStartedAt: parsed.interrogationStartedAt ?? null,
      interrogationCompletedAt: parsed.interrogationCompletedAt ?? null,
    };
  } catch {
    return emptyShadowMemory();
  }
}

/** Persist to localStorage. Silently swallows quota / privacy errors. */
export function saveShadowMemory(memory: ShadowMemoryT): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* ignore */
  }
}

/** Append a single exchange without re-reading the whole structure. */
export function appendShadowExchange(
  memory: ShadowMemoryT,
  exchange: ShadowExchange,
): ShadowMemoryT {
  // Cap exchanges at a sane volume so we don't bloat localStorage.
  const MAX = 80;
  const next = [...memory.exchanges, exchange];
  return {
    ...memory,
    exchanges: next.length > MAX ? next.slice(next.length - MAX) : next,
    updatedAt: new Date().toISOString(),
  };
}

/** Record a single answer from the interrogation, indexed by tag. */
export function recordShadowAnswer(
  memory: ShadowMemoryT,
  tag: string,
  answer: string | string[] | undefined,
): ShadowMemoryT {
  if (answer === undefined || answer === null) return memory;
  const stored = Array.isArray(answer) ? answer.filter(Boolean).join(', ') : answer.trim();
  if (!stored) return memory;
  return {
    ...memory,
    answers: { ...memory.answers, [tag]: stored },
    updatedAt: new Date().toISOString(),
  };
}

/** Mark a Shadow greeting/taunt as "shown", so we don't loop on the same one. */
export function markTaunted(memory: ShadowMemoryT, taunt: string): ShadowMemoryT {
  if (memory.taunted.includes(taunt)) return memory;
  return {
    ...memory,
    taunted: [...memory.taunted, taunt].slice(-40),
    updatedAt: new Date().toISOString(),
  };
}

/** Add an inferred pattern (e.g., "student", "test-week-detected"). */
export function addPattern(memory: ShadowMemoryT, pattern: string): ShadowMemoryT {
  if (memory.patterns.includes(pattern)) return memory;
  return {
    ...memory,
    patterns: [...memory.patterns, pattern],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Build a compact, prompt-friendly summary of the memory. Used by
 * AgentBase / trainerService to inject context into every SHADOW call,
 * so the LLM can quote the operator's own answers back.
 *
 * Order = importance to the bot:
 *   - callsign (so the bot knows what to call them)
 *   - identity_aspiration (the Atomic Habits keystone)
 *   - keystone_loss (the Penalty Zone quote)
 *   - self_bet (the non-negotiable quest)
 *   - everything else as tag → answer pairs
 */
export function memoryToPromptContext(memory: ShadowMemoryT): string {
  const { answers } = memory;
  if (!answers || Object.keys(answers).length === 0) return '';

  const ordered: Array<[string, string]> = [];
  const priority: string[] = ['callsign', 'identity_aspiration', 'kestone_loss', 'self_bet'];
  for (const k of priority) {
    if (answers[k]) ordered.push([k, answers[k]]);
  }
  for (const k of Object.keys(answers)) {
    if (priority.includes(k)) continue;
    ordered.push([k, answers[k]]);
  }

  const lines = ordered.map(([k, v]) => `  - ${k}: ${v}`);
  return `[SHADOW MEMORY — things the operator has told the Shadow. Quote them back when relevant.]\n${lines.join('\n')}`;
}

/**
 * Get the keystone loss quote for Penalty Zone narrative.
 * Returns null if not yet answered.
 */
export function getKeystoneLoss(memory: ShadowMemoryT): string | null {
  return memory.answers.kestone_loss ?? memory.answers['kestone_loss'] ?? null;
}

/**
 * Get the operator's callsign (preferred name to address them by).
 */
export function getCallsign(memory: ShadowMemoryT): string | null {
  return memory.answers.callsign ?? null;
}

/**
 * Heuristic emotional-state detection from a single user message.
 * Long + sad → flag emotional so the Shadow knows to soften / escalate.
 */
export function detectEmotional(text: string): boolean {
  if (!text) return false;
  const lc = text.toLowerCase();
  const triggers = [
    /i (?:just )?(?:want to )?(?:give up|quit|cry|break down|fall apart)/i,
    /i (?:can(?:'t| not)?|cannot) (?:do this|keep going|take this)/i,
    /(?:i'?m|i am) (?:so )?(?:tired|done|exhausted|frustrated|overwhelmed)/i,
    /(?:nobody|no one) (?:will|would|cares?)/i,
    /(?:hate|despise) (?:myself|me|this)/i,
    /(?:want to|wanna) (?:die|disappear|run away)/i,
    /\bfail(ure)?\b.*\bagain\b/i,
  ];
  return triggers.some(p => p.test(lc));
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Old-name aliases + interrogation gate API
 *
 * The rest of the codebase already calls these functions via the imports in
 * GameContext.tsx. We export forwarders so the existing wiring works without
 * touching every call site. New callers should prefer recordShadowAnswer,
 * appendShadowExchange, etc.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Legacy alias for recordShadowAnswer. */
export const recordAnswer = recordShadowAnswer;

/** Legacy alias for recordShadowAnswer. */
export const recordShadowAnswerTagged = recordShadowAnswer;

export interface ShadowChatEntry {
  id: string;
  role: 'user' | 'shadow';
  text: string;
  emotional?: boolean;
  timestamp: string;
}

/** Legacy alias for appendShadowExchange that takes ShadowChatEntry. */
export function appendChat(memory: ShadowMemoryT, entry: ShadowChatEntry): ShadowMemoryT {
  return appendShadowExchange(memory, entry);
}

export function markInterrogationComplete(
  memory: ShadowMemoryT,
  callSign: string | null,
): ShadowMemoryT {
  return {
    ...memory,
    interrogationStatus: 'complete',
    interrogationStartedAt: memory.interrogationStartedAt ?? new Date().toISOString(),
    interrogationCompletedAt: new Date().toISOString(),
    ...(callSign
      ? { answers: { ...memory.answers, callsign: callSign.trim() } }
      : {}),
    updatedAt: new Date().toISOString(),
  };
}

export function startInterrogation(memory: ShadowMemoryT): ShadowMemoryT {
  return {
    ...memory,
    interrogationStatus: 'in_progress',
    interrogationStartedAt: memory.interrogationStartedAt ?? new Date().toISOString(),
    interrogationCurrentIndex: memory.interrogationCurrentIndex ?? 0,
  };
}

export function setInterrogationIndex(memory: ShadowMemoryT, index: number): ShadowMemoryT {
  return {
    ...memory,
    interrogationCurrentIndex: index,
    updatedAt: new Date().toISOString(),
  };
}

export function declineInterrogation(memory: ShadowMemoryT): ShadowMemoryT {
  return {
    ...memory,
    interrogationStatus: 'declined',
    updatedAt: new Date().toISOString(),
  };
}

export function clearShadowMemory(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** One-line human-readable digest for the UI badge / Shadow greeting. */
export function formatMemoryDigest(memory: ShadowMemoryT): string {
  if (!memory || !memory.answers) return 'Shadow has not yet met the Operator.';
  const a = memory.answers;
  if (a.callsign) return `Shadow knows the Operator as "${a.callsign}".`;
  const count = Object.values(a).filter(v => v && String(v).trim().length > 0).length;
  if (count === 0) return 'Shadow has not yet met the Operator.';
  return `Shadow has ${count} facts about the Operator.`;
}

export function answeredCount(memory: ShadowMemoryT): number {
  if (!memory?.answers) return 0;
  return Object.values(memory.answers).filter(v => v && String(v).trim().length > 0).length;
}

/** Re-export the underlying type so consumers get a stable name. */
export type { ShadowMemory as ShadowMemoryType };

