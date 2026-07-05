/**
 * R-08 — local-first data exporters.
 *
 * Two output formats:
 *   - JSON (full / section) — round-trippable backup
 *   - CSV (flat)             — Excel / Sheets compatible
 *
 * The CSV exporter flattens each domain (protocols, quests, tasks, habits,
 * achievements, feedback) into one row per item with the columns the operator
 * cares about most. It does not attempt to preserve date types — Excel
 * happily parses ISO date strings.
 */

const DEFAULT_KEYS = [
  'protocols',
  'stats',
  'nexus_credits',
  'nexus_progression',
  'nexus_streak',
  'nexus_consistency',
  'nexus_achievements',
  'nexus_habits',
  'nexus_powerups',
  'nexus_debuffs',
  'nexus_shadow',
  'nexus_raidboss',
  'nexus_ascension',
  'nexus_narrative',
  'nexus_rifts',
  'nexus_custom_skills',
  'nexus_lastStatUpdates',
  'nexus_pro',
  'nexus_recommendations',
  'nexus_exp_history',
  'nexus_theme',
  'nexus_assessment_complete',
  'selectedCharacter',
  'userProfile',
  'appPermissions',
  'feedback',
];

export interface SectionBundle {
  key: string;
  label: string;
  data: any[];
}

export const SECTIONS: SectionBundle[] = [
  { key: 'protocols',  label: 'Protocols',  data: [] },
  { key: 'quests',     label: 'Quests',     data: [] },
  { key: 'habits',     label: 'Habits',     data: [] },
  { key: 'achievements', label: 'Achievements', data: [] },
  { key: 'feedback',   label: 'Feedback',   data: [] },
];

/** Triggers a browser download of the given content under the given filename. */
function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Dump all NEXUS data as a structured JSON backup. */
export function exportJsonFull(): void {
  const data: Record<string, string | null> = {};
  for (const key of DEFAULT_KEYS) {
    data[key] = localStorage.getItem(key);
  }
  const today = new Date().toISOString().split('T')[0];
  downloadFile(
    `nexus_backup_full_${today}.json`,
    JSON.stringify(data, null, 2),
    'application/json',
  );
}

/** Dump one named section as JSON. Reads the live localStorage value. */
export function exportJsonSection(sectionKey: string): void {
  const raw = localStorage.getItem(sectionKey);
  let parsed: any;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = raw; // treat as raw text
  }
  const today = new Date().toISOString().split('T')[0];
  const payload = {
    section: sectionKey,
    exportedAt: new Date().toISOString(),
    data: parsed,
  };
  downloadFile(
    `nexus_${sectionKey}_${today}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  );
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  // Union of keys so columns are stable
  const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const header = keys.map(csvEscape).join(',');
  const lines = rows.map(r => keys.map(k => csvEscape(r[k])).join(','));
  return [header, ...lines].join('\n');
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

/** Flat dump of operational data as CSV. Each section becomes one block. */
export function exportCsvFlat(): void {
  const blocks: string[] = [];

  // Protocols
  const protocols = readJson<any[]>('protocols', []);
  if (protocols.length) {
    blocks.push('# Protocols');
    blocks.push(toCsv(protocols.map(p => ({
      id: p.id,
      title: p.title,
      type: p.type,
      stat: p.stat,
      gain: p.gain,
      pages: p.pages,
      pagesRead: p.pagesRead,
      bookStatus: p.bookStatus,
      difficulty: p.difficulty,
      estDuration: p.estDuration,
      desc: p.desc,
      isStoreItem: p.isStoreItem,
      aiGenerated: p.aiGenerated,
    }))));
  }

  // Tasks
  const tasks = readJson<any[]>('nexus_tasks', []); // (typically persisted via GameContext inside)
  const dailyTasksJson = localStorage.getItem('nexus_tasks');
  if (dailyTasksJson) {
    try {
      const daily = JSON.parse(dailyTasksJson) as any[];
      if (daily.length) {
        blocks.push('# Daily Tasks');
        blocks.push(toCsv(daily.map(t => ({
          id: t.id, title: t.title, category: t.category, difficulty: t.difficulty,
          completed: t.completed, date: t.date, points: t.points, rewardCredits: t.rewardCredits, rewardExp: t.rewardExp,
        }))));
      }
    } catch { /* skip */ }
  }
  if (tasks.length && dailyTasksJson === null) {
    blocks.push('# Daily Tasks');
    blocks.push(toCsv(tasks.map((t: any) => ({
      id: t.id, title: t.title, category: t.category, difficulty: t.difficulty,
      completed: t.completed, date: t.date, points: t.points, rewardCredits: t.rewardCredits, rewardExp: t.rewardExp,
    }))));
  }

  // Habits
  const habits = readJson<any[]>('nexus_habits', []);
  if (habits.length) {
    blocks.push('# Habits');
    blocks.push(toCsv(habits.map(h => ({
      id: h.id, title: h.title, type: h.type, category: h.category,
      streak: h.streak, longestStreak: h.longestStreak, weeklyTarget: h.weeklyTarget,
      isAddiction: h.isAddiction, relapses: h.relapses, createdAt: h.createdAt,
    }))));
  }

  // Achievements
  const achievements = readJson<any[]>('nexus_achievements', []);
  if (achievements.length) {
    blocks.push('# Achievements');
    blocks.push(toCsv(achievements.map(a => ({
      id: a.id, name: a.name, category: a.category, progress: a.progress,
      requirement: a.requirement, unlocked: a.unlocked, rewardExp: a.rewardExp, rewardCredits: a.rewardCredits,
    }))));
  }

  // Feedback log
  const feedback = readJson<any[]>('feedback', []);
  if (feedback.length) {
    blocks.push('# Feedback');
    blocks.push(toCsv(feedback.map((f: any) => ({
      id: f.id, category: f.category, status: f.status, timestamp: f.timestamp, message: f.message,
    }))));
  }

  if (blocks.length === 0) {
    blocks.push('# No operational data found in localStorage. Run a few protocols first.');
  }

  const today = new Date().toISOString().split('T')[0];
  downloadFile(`nexus_export_${today}.csv`, blocks.join('\n\n'), 'text/csv');
}

/** Validate the shape of an imported JSON backup. Returns null on success, error on failure. */
export function validateImport(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return 'Backups must be an object, not a list.';
    }
    if (typeof parsed !== 'object' || parsed === null) {
      return 'Backup must be a JSON object.';
    }
    const keys = Object.keys(parsed);
    if (keys.length === 0) return 'Backup is empty.';
    // Reject if all values are non-string (wrong shape)
    const allNonString = keys.every(k => typeof parsed[k] !== 'string');
    if (allNonString) {
      return 'Backup values must be strings. Did you import a section export instead of a full backup?';
    }
    return null;
  } catch (e: any) {
    return `Invalid JSON: ${e?.message || 'parse error'}`;
  }
}

export const IMPORTABLE_SECTIONS = [
  { key: 'protocols', label: 'Protocols' },
  { key: 'nexus_achievements', label: 'Achievements' },
  { key: 'nexus_habits', label: 'Habits' },
  { key: 'stats', label: 'Stats' },
  { key: 'nexus_progression', label: 'Progression' },
  { key: 'feedback', label: 'Feedback log' },
];
