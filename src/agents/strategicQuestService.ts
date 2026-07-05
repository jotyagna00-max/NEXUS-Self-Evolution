/**
 * v1.4.0 — Strategic Quest Auto-Generation Service.
 *
 * When the operator activates a protocol, starts a book, or creates/destroys a
 * habit, this service calls the relevant agent to spawn themed daily quests.
 *
 * Every spawned quest is stamped with `sourceType` / `sourceId` /
 * `sourceTitle` / `lineageLabel` so the QuestBoard can render a
 * "Generated from: <title>" chip.
 *
 * The service is pure-async (no React state) — the caller (GameContext) is
 * responsible for merging returned quests into the active quest list.
 */

import { AgentOrchestrator, OrchestratorContext } from './AgentOrchestrator';
import type { EnhancedQuest, Protocol, Habit } from '../types';

// ---------------------------------------------------------------------------
// Configuration (persisted in nexus_auto_quest_config)
// ---------------------------------------------------------------------------

export interface AutoQuestConfig {
  protocolEnabled: boolean;
  bookEnabled: boolean;
  habitEnabled: boolean;
  /** How many daily quests to spawn per protocol (1-7). Default 3. */
  questsPerProtocol: number;
  /** How many daily quests to spawn per book (1-5). Default 2. */
  questsPerBook: number;
  /** How many micro-quests to spawn per habit (1-5). Default 3. */
  questsPerHabit: number;
}

const CONFIG_KEY = 'nexus_auto_quest_config';

const DEFAULT_CONFIG: AutoQuestConfig = {
  protocolEnabled: true,
  bookEnabled: true,
  habitEnabled: true,
  questsPerProtocol: 3,
  questsPerBook: 2,
  questsPerHabit: 3,
};

export function loadAutoQuestConfig(): AutoQuestConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return { ...DEFAULT_CONFIG, ...parsed };
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

export function saveAutoQuestConfig(cfg: AutoQuestConfig): void {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Shared orchestrator singleton (lazy)
// This is a service-level singleton separate from the React component's
// orchestrator instance. The service is pure-async (no React state) and
// needs its own instance to avoid coupling with the UI lifecycle.
// ---------------------------------------------------------------------------

let _orch: AgentOrchestrator | null = null;
function getOrch(): AgentOrchestrator {
  if (!_orch) _orch = new AgentOrchestrator();
  return _orch;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Called when a protocol is activated.
 * Spawns `questsPerProtocol` daily quests focused on the protocol's stat.
 */
export async function onProtocolActivated(
  protocol: Protocol,
  context: OrchestratorContext,
  config: AutoQuestConfig = loadAutoQuestConfig(),
): Promise<EnhancedQuest[]> {
  if (!config.protocolEnabled) return [];

  const orch = getOrch();
  const quests: EnhancedQuest[] = [];
  const count = Math.max(1, Math.min(7, config.questsPerProtocol));

  for (let i = 0; i < count; i++) {
    try {
      const q = await orch.generateQuest('daily', context, true, {
        id: protocol.id,
        type: 'protocol',
        title: protocol.title,
        hint: `Focus stat: ${protocol.stat}. Protocol type: ${protocol.type}. Gain per sync: +${protocol.gain}. ${protocol.criteria || ''}`,
      });
      // Stamp lineage
      q.sourceType = 'protocol';
      q.sourceId = protocol.id;
      q.sourceTitle = protocol.title;
      q.lineageLabel = `Protocol: ${protocol.title}`;
      quests.push(q);
    } catch (err) {
      console.warn('[strategicQuestService] onProtocolActivated quest failed:', err);
    }
  }
  return quests;
}

/**
 * Called when a book is activated (reading-type protocol).
 * Spawns `questsPerBook` daily quests focused on reading comprehension.
 */
export async function onBookActivated(
  book: Protocol,
  context: OrchestratorContext,
  config: AutoQuestConfig = loadAutoQuestConfig(),
): Promise<EnhancedQuest[]> {
  if (!config.bookEnabled) return [];

  const orch = getOrch();
  const quests: EnhancedQuest[] = [];
  const count = Math.max(1, Math.min(5, config.questsPerBook));

  for (let i = 0; i < count; i++) {
    try {
      const q = await orch.generateQuest('daily', context, true, {
        id: book.id,
        type: 'book',
        title: book.title,
        hint: `Book by ${book.author || 'unknown author'}. Pages: ${book.pages || '?'}. Focus on active reading, note-taking, chapter summarization, and applying concepts.`,
      });
      q.sourceType = 'book';
      q.sourceId = book.id;
      q.sourceTitle = book.title;
      q.lineageLabel = `Book: ${book.title}`;
      quests.push(q);
    } catch (err) {
      console.warn('[strategicQuestService] onBookActivated quest failed:', err);
    }
  }
  return quests;
}

/**
 * Called when a habit is created.
 * Spawns `questsPerHabit` micro-quests scoped to the habit.
 */
export async function onHabitCreated(
  habit: Habit,
  context: OrchestratorContext,
  config: AutoQuestConfig = loadAutoQuestConfig(),
): Promise<EnhancedQuest[]> {
  if (!config.habitEnabled) return [];

  const orch = getOrch();
  const quests: EnhancedQuest[] = [];
  const count = Math.max(1, Math.min(5, config.questsPerHabit));

  for (let i = 0; i < count; i++) {
    try {
      const q = await orch.generateQuest('daily', context, true, {
        id: habit.id,
        type: 'habit',
        title: habit.title,
        hint: `Habit type: ${habit.isAddiction ? 'destroy (break addiction)' : 'build'}. Category: ${habit.category}. ${habit.description || ''}. ${habit.isAddiction ? 'Focus on trigger awareness and replacement rituals.' : 'Focus on consistency, cue-routine-reward loops, and streak building.'}`,
      });
      q.sourceType = 'habit';
      q.sourceId = habit.id;
      q.sourceTitle = habit.title;
      q.lineageLabel = `Habit: ${habit.title}`;
      quests.push(q);
    } catch (err) {
      console.warn('[strategicQuestService] onHabitCreated quest failed:', err);
    }
  }
  return quests;
}

/**
 * Called when a habit (addiction) is destroyed/removed.
 * Generates replacement ritual quests via HabitMasterAgent, then converts
 * each into a daily quest via QuestGenerator.
 */
export async function onHabitDestroyed(
  habit: Habit,
  context: OrchestratorContext,
  config: AutoQuestConfig = loadAutoQuestConfig(),
): Promise<EnhancedQuest[]> {
  if (!config.habitEnabled) return [];

  const orch = getOrch();
  const quests: EnhancedQuest[] = [];

  try {
    // Step 1: Get replacement rituals from HabitMaster (via public accessor)
    const rituals = await orch.getHabitMaster().generateAddictionReplacementRituals(
      habit.title,
      habit.triggerPatterns || ['boredom', 'stress', 'social pressure'],
    );

    // Step 2: Convert each replacement ritual into a daily quest
    const limit = Math.min(rituals.length, 3);
    for (let i = 0; i < limit; i++) {
      try {
        const q = await orch.generateQuest('daily', context, true, {
          id: habit.id,
          type: 'addiction',
          title: `Replace: ${habit.title}`,
          hint: `Trigger: "${rituals[i].trigger}". Suggested replacement: "${rituals[i].replacement}". Build a healthier routine instead of ${habit.title}.`,
        });
        q.sourceType = 'addiction';
        q.sourceId = habit.id;
        q.sourceTitle = habit.title;
        q.lineageLabel = `Breaking: ${habit.title}`;
        quests.push(q);
      } catch (err) {
        console.warn('[strategicQuestService] onHabitDestroyed quest failed:', err);
      }
    }
  } catch (err) {
    console.warn('[strategicQuestService] onHabitDestroyed replacement rituals failed:', err);
  }

  return quests;
}
