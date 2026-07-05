export type StatType = 'strength' | 'intelligence' | 'agility' | 'vitality' | 'willpower' | 'social';

export type AgentType = 'MANAGER' | 'SAGE' | 'TITAN' | 'CHRONOS' | 'VOICE' | 'SHADOW';

export type ProtocolType = 'mental' | 'physical' | 'agility' | 'willpower' | 'reading' | 'habit';

export type QuestType = 'daily' | 'weekly' | 'challenge' | 'main_scenario' | 'side';
export type QuestCategory = 'fitness' | 'mental' | 'emotional' | 'habit' | 'social';

export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface UserStats {
  strength: number;
  intelligence: number;
  agility: number;
  vitality: number;
  willpower: number;
  social: number;
}

export interface UserProfile {
  name?: string;
  primaryGoal?: string;
  secondaryGoals?: string[];
  fitnessExperience?: 'beginner' | 'intermediate' | 'advanced';
  learningStyle?: string;
  emotionalState?: string;
  barriers?: string[];
  scheduleNotes?: string;
  preferences?: string[];
  wellnessFocus?: string[];
  accountabilityNeeds?: string;
}

export interface ProtocolQuest {
  title: string;
  description: string;
  difficulty: number;
  rewardCredits: number;
  rewardExp: number;
  stat?: StatType;
}

export interface Protocol {
  id: string;
  title: string;
  desc: string;
  type: ProtocolType;
  stat: StatType;
  gain: number;
  cost?: number;
  owned?: boolean;
  isStoreItem?: boolean;
  author?: string;
  pages?: number;
  pagesRead?: number;
  bookStatus?: 'reading' | 'completed' | 'planned';
  notes?: string;
  difficulty?: number;
  estDuration?: string;
  aiGenerated?: boolean;
  criteria?: string;
  quest?: ProtocolQuest;
  domain?: 'body' | 'mind';
  tier?: number;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  type: 'build' | 'destroy';
  category: 'mental' | 'physical' | 'willpower' | 'social';
  streak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  microQuests: MicroQuest[];
  createdAt: string;
  isAddiction: boolean;
  triggerPatterns?: string[];
  replacementRituals?: string[];
  relapses?: number;
  relapseDates?: string[];
  weeklyTarget: number;
}

export interface MicroQuest {
  id: string;
  habitId: string;
  title: string;
  description: string;
  completed: boolean;
  difficulty: number;
  ncReward: number;
  expReward: number;
  createdAt: string;
}

export interface ProgressionState {
  level: number;
  exp: number;
  expToNextLevel: number;
  rank: HunterRank;
  totalExpEarned: number;
  statPoints: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  dailyCompletions: number;
  totalDailyTarget: number;
  weeklyStreak: number;
  longestWeeklyStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'mental' | 'emotional' | 'consistency' | 'milestone' | 'books' | 'habits' | 'shadow';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardExp: number;
  rewardCredits: number;
  icon?: string;
}

export interface PenaltyRecord {
  id: string;
  type: 'missed' | 'failed' | 'relapse' | 'consecutive_miss';
  reason: string;
  amount: number;
  date: string;
  statAffected?: StatType;
  debuffDuration?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  category: QuestCategory;
  difficulty: number;
  rewardExp: number;
  rewardCredits: number;
  rewardStatPoints?: number;
  statAffected: StatType | 'multiple';
  timeLimit?: number;
  expiresAt?: string;
  completed: boolean;
  failed: boolean;
  completedAt?: string;
  narrative?: string;
  bossName?: string;
  /** v1.4.0 — provenance when this quest was auto-spawned from a protocol/book/habit. */
  sourceType?: 'protocol' | 'book' | 'habit' | 'addiction';
  sourceId?: string;
  sourceTitle?: string;
  /** Human-readable chip label, e.g. "Generated from: Muscle Builder". */
  lineageLabel?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: number;
  points: number;
  rewardCredits: number;
  rewardExp: number;
  completed: boolean;
  date: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  type: 'protocol' | 'powerup' | 'cosmetic' | 'subscription' | 'book';
  cost: number;
  protocolData?: Partial<Protocol>;
  powerUpEffect?: string;
  powerUpMultiplier?: number;
  duration?: number;
  exclusive?: boolean;
  owned?: boolean;
  stock?: number;
}

export interface ActivePowerUp {
  id: string;
  storeItemId: string;
  name: string;
  effect: string;
  multiplier: number;
  activatedAt: string;
  expiresAt: string;
}

export interface Debuff {
  id: string;
  name: string;
  description: string;
  statPenalties: Partial<UserStats>;
  duration: number;
  active: boolean;
  appliedAt: string;
  expiresAt: string;
}

export interface AppNotification {
  id: string;
  type: 'achievement' | 'level_up' | 'ascension_ready' | 'penalty';
  title: string;
  description: string;
  icon?: string;
  reward?: { credits?: number; exp?: number };
  /** If true, also fire as an OS-level notification in Electron. */
  desktop?: boolean;
  timestamp: string;
}

export interface ShadowState {
  strength: number;
  intelligence: number;
  agility: number;
  vitality: number;
  willpower: number;
  social: number;
  lastUpdated: string;
  isDominant: boolean;
  challengeIssued: boolean;
  challengeCompleted: boolean;
}

export interface RaidBoss {
  id: string;
  name: string;
  weekStart: string;
  weekEnd: string;
  maxHp: number;
  currentHp: number;
  defeated: boolean;
  rewardCredits: number;
  rewardExp: number;
  bossDescription: string;
  defeatedAt?: string;
  participants: number;
}

export interface AscensionData {
  ascensionCount: number;
  multiplier: number;
  ascendedAt: string[];
}

export interface NarrativeChapter {
  id: number;
  title: string;
  content: string;
  requiredLevel: number;
  requiredAchievements: string[];
  unlocked: boolean;
  read: boolean;
  rewardExp: number;
  rewardCredits: number;
}

export interface CustomSkill {
  name: string;
  value: number;
}

export interface CustomSkillSet {
  id: string;
  name: string;
  skills: CustomSkill[];
  createdAt: string;
}

export interface RiftSchedule {
  id: string;
  name: string;
  description: string;
  unlockHourStart: number;
  unlockHourEnd: number;
  protocolId: string;
  active: boolean;
  daysOfWeek: number[];
}

export type EnhancedQuest = Quest;

export interface DailyBaselineTask {
  id: string;
  title: string;
  description: string;
  targetReps?: number;
  targetMinutes?: number;
  statAffected: StatType;
  completed: boolean;
}

export type BaselineMode = 'fixed' | 'custom';

export interface DailyBaseline {
  mode: BaselineMode;
  fixedTasks: DailyBaselineTask[];
  customTasks: DailyBaselineTask[];
  lastCompletedDate: string | null;
  completionHistory: { date: string; completedCount: number; totalCount: number }[];
}

export const DEFAULT_FIXED_BASELINE: DailyBaselineTask[] = [
  { id: 'pushups', title: 'Push-ups', description: '100 push-ups (or max if beginner)', targetReps: 100, statAffected: 'strength', completed: false },
  { id: 'situps', title: 'Sit-ups', description: '100 sit-ups (or max if beginner)', targetReps: 100, statAffected: 'willpower', completed: false },
  { id: 'squats', title: 'Squats', description: '100 squats (or max if beginner)', targetReps: 100, statAffected: 'strength', completed: false },
  { id: 'run', title: '10km Run', description: 'Run 10 kilometers (or 30 min cardio)', targetMinutes: 60, statAffected: 'vitality', completed: false },
  { id: 'reading', title: 'Read 10 Pages', description: 'Read at least 10 pages of a book', targetReps: 10, statAffected: 'intelligence', completed: false },
  { id: 'meditation', title: 'Meditate 10 min', description: '10 minutes of focused meditation', targetMinutes: 10, statAffected: 'willpower', completed: false },
];

export const RANK_THRESHOLDS: Record<HunterRank, number> = {
  'E': 0,
  'D': 5,
  'C': 15,
  'B': 30,
  'A': 50,
  'S': 75,
  'SS': 100,
  'SSS': 150
};

export const getRankFromLevel = (level: number): HunterRank => {
  if (level >= 150) return 'SSS';
  if (level >= 100) return 'SS';
  if (level >= 75) return 'S';
  if (level >= 50) return 'A';
  if (level >= 30) return 'B';
  if (level >= 15) return 'C';
  if (level >= 5) return 'D';
  return 'E';
};

export const calculateExpToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export interface ConsistencyData {
  score: number;
  totalDays: number;
  completedDays: number;
  currentRun: number;
  longestRun: number;
  recoveryCount: number;
  /**
   * Sliding 7-day window. Each entry is one calendar day. Oldest first →
   * today last. The window is rotated every time `updateConsistency` is
   * called so the array always reflects the past 7 days, never the
   * current calendar week.
   *
   * Legacy boolean[] entries (the prior day-of-week bucketed shape)
   * are dropped on migration — see `coerceWindow` in utils/consistency.
   */
  last7Days: { date: string; completed: boolean }[];
  graceDaysRemaining: number;
}

export interface ExpHistoryEntry {
  date: string; // YYYY-MM-DD
  exp: number;
  credits: number;
}

export type ThemeColor = 'emerald' | 'sapphire' | 'crimson';

export const THEME_PRESETS: Record<ThemeColor, {
  id: ThemeColor;
  label: string;
  cssVar: string; // primary glow color
  hex: string;
  swatch: string; // tailwind classes for the swatch
}> = {
  emerald:  { id: 'emerald',  label: 'Emerald',  cssVar: '16,185,129', hex: '#10b981', swatch: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' },
  sapphire: { id: 'sapphire', label: 'Sapphire', cssVar: '59,130,246', hex: '#3b82f6', swatch: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]' },
  crimson:  { id: 'crimson',  label: 'Crimson',  cssVar: '239,68,68',  hex: '#ef4444', swatch: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' },
};

export interface AgentRecommendation {
  id: string;
  agent: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLabel: string;
  targetStat?: string;
  createdAt: string;
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps', name: 'First Steps', description: 'Complete your first quest',
    category: 'milestone', requirement: 1, progress: 0, unlocked: false,
    rewardExp: 50, rewardCredits: 25
  },
  {
    id: 'quest_hunter_10', name: 'Quest Hunter', description: 'Complete 10 quests',
    category: 'milestone', requirement: 10, progress: 0, unlocked: false,
    rewardExp: 150, rewardCredits: 100
  },
  {
    id: 'quest_master_50', name: 'Quest Master', description: 'Complete 50 quests',
    category: 'milestone', requirement: 50, progress: 0, unlocked: false,
    rewardExp: 500, rewardCredits: 300
  },
  {
    id: 'streak_3', name: 'Consistent', description: 'Maintain a 3-day streak',
    category: 'consistency', requirement: 3, progress: 0, unlocked: false,
    rewardExp: 50, rewardCredits: 30
  },
  {
    id: 'streak_7', name: '7-Day Warrior', description: 'Maintain a 7-day streak',
    category: 'consistency', requirement: 7, progress: 0, unlocked: false,
    rewardExp: 200, rewardCredits: 150
  },
  {
    id: 'streak_30', name: '30-Day Fortitude', description: 'Maintain a 30-day streak',
    category: 'consistency', requirement: 30, progress: 0, unlocked: false,
    rewardExp: 500, rewardCredits: 500
  },
  {
    id: 'streak_100', name: 'Century Club', description: 'Maintain a 100-day streak',
    category: 'consistency', requirement: 100, progress: 0, unlocked: false,
    rewardExp: 2000, rewardCredits: 2500
  },
  {
    id: 'rank_d', name: 'Rank D Hunter', description: 'Achieve D rank',
    category: 'milestone', requirement: 5, progress: 0, unlocked: false,
    rewardExp: 100, rewardCredits: 50
  },
  {
    id: 'rank_c', name: 'Rank C Hunter', description: 'Achieve C rank',
    category: 'milestone', requirement: 15, progress: 0, unlocked: false,
    rewardExp: 250, rewardCredits: 150
  },
  {
    id: 'rank_b', name: 'Rank B Hunter', description: 'Achieve B rank',
    category: 'milestone', requirement: 30, progress: 0, unlocked: false,
    rewardExp: 500, rewardCredits: 400
  },
  {
    id: 'rank_a', name: 'Rank A Hunter', description: 'Achieve A rank',
    category: 'milestone', requirement: 50, progress: 0, unlocked: false,
    rewardExp: 1000, rewardCredits: 800
  },
  {
    id: 'rank_s', name: 'Rank S Hunter', description: 'Achieve S rank',
    category: 'milestone', requirement: 75, progress: 0, unlocked: false,
    rewardExp: 2500, rewardCredits: 2000
  },
  {
    id: 'bookworm', name: 'Bookworm', description: 'Complete 5 books',
    category: 'books', requirement: 5, progress: 0, unlocked: false,
    rewardExp: 200, rewardCredits: 150
  },
  {
    id: 'bibliophile', name: 'Bibliophile', description: 'Complete 20 books',
    category: 'books', requirement: 20, progress: 0, unlocked: false,
    rewardExp: 500, rewardCredits: 500
  },
  {
    id: 'habit_builder', name: 'Habit Architect', description: 'Build 3 habits to 7-day streak',
    category: 'habits', requirement: 3, progress: 0, unlocked: false,
    rewardExp: 300, rewardCredits: 200
  },
  {
    id: 'addiction_slayer', name: 'Addiction Slayer', description: 'Maintain 30-day addiction-free streak',
    category: 'habits', requirement: 30, progress: 0, unlocked: false,
    rewardExp: 1000, rewardCredits: 750
  },
  {
    id: 'shadow_defeated', name: 'Shadow Vanquisher', description: 'Defeat the Shadow Self',
    category: 'shadow', requirement: 1, progress: 0, unlocked: false,
    rewardExp: 500, rewardCredits: 400
  },
  {
    id: 'raid_winner', name: 'Raid Champion', description: 'Defeat a Raid Boss',
    category: 'milestone', requirement: 1, progress: 0, unlocked: false,
    rewardExp: 300, rewardCredits: 250
  },
  {
    id: 'ascension_1', name: 'First Awakening', description: 'Ascend for the first time',
    category: 'milestone', requirement: 1, progress: 0, unlocked: false,
    rewardExp: 2000, rewardCredits: 1000
  },
  {
    id: 'level_10', name: 'Double Digits', description: 'Reach level 10',
    category: 'milestone', requirement: 10, progress: 0, unlocked: false,
    rewardExp: 200, rewardCredits: 100
  },
  {
    id: 'level_25', name: 'Elite Operator', description: 'Reach level 25',
    category: 'milestone', requirement: 25, progress: 0, unlocked: false,
    rewardExp: 500, rewardCredits: 300
  },
  {
    id: 'level_50', name: 'NEXUS Veteran', description: 'Reach level 50',
    category: 'milestone', requirement: 50, progress: 0, unlocked: false,
    rewardExp: 1500, rewardCredits: 1000
  },
  {
    id: 'stats_100', name: 'Peak Human', description: 'Reach 100 in all stats',
    category: 'milestone', requirement: 600, progress: 0, unlocked: false,
    rewardExp: 3000, rewardCredits: 2000
  },
  {
    id: 'first_protocol', name: 'Protocol Initiated', description: 'Create your first protocol',
    category: 'milestone', requirement: 1, progress: 0, unlocked: false,
    rewardExp: 30, rewardCredits: 15
  },
  {
    id: 'ai_protocol', name: 'AI Synergy', description: 'Generate a protocol with AI',
    category: 'milestone', requirement: 1, progress: 0, unlocked: false,
    rewardExp: 100, rewardCredits: 50
  },
  {
    id: 'perfect_week', name: 'Perfect Week', description: 'Complete all tasks for 7 consecutive days',
    category: 'consistency', requirement: 7, progress: 0, unlocked: false,
    rewardExp: 400, rewardCredits: 300
  }
];

export const STORE_ITEMS: StoreItem[] = [
  // ════════════════════════════════════════
  // BODY PROTOCOLS
  // ════════════════════════════════════════
  {
    id: 'pure_strength', name: 'Pure Strength Foundation', description: 'Build raw strength with simple compound lifts — 3 days a week.',
    type: 'protocol', cost: 150, exclusive: false,
    protocolData: {
      title: 'Pure Strength', desc: 'Do 3 sets of 5 reps of a compound exercise. Rest 2 min between sets.', type: 'physical', stat: 'strength', gain: 2, difficulty: 1, estDuration: '30 min/day', aiGenerated: false, domain: 'body', tier: 1,
      criteria: 'Do 3 sets of 5 push-ups or squats. Rest 2 min between sets. Next time add 1 rep per set.',
      quest: { title: 'Strength: 3×5', description: 'Do 3 sets of 5 reps — push-ups or squats, controlled form.', difficulty: 1, rewardCredits: 15, rewardExp: 20, stat: 'strength' }
    }
  },
  {
    id: 'muscle_builder', name: 'Muscle Builder Protocol', description: 'Build size with higher reps and slow lowering — 4 days a week.',
    type: 'protocol', cost: 250, exclusive: false,
    protocolData: {
      title: 'Muscle Builder', desc: 'Do 4 sets of 10 reps. Lower slowly (3s down). Focus on the squeeze.', type: 'physical', stat: 'strength', gain: 3, difficulty: 2, estDuration: '40 min/day', aiGenerated: false, domain: 'body', tier: 2,
      criteria: 'Do 4 sets of 10 reps. Lower each rep slowly (3 count). Squeeze at the top.',
      quest: { title: 'Muscle Builder: 4×10', description: 'Do 4 sets of 10 reps with slow lowering. Feel the muscle work.', difficulty: 2, rewardCredits: 20, rewardExp: 30, stat: 'strength' }
    }
  },
  {
    id: 'fighter_conditioning', name: 'Fighter Conditioning', description: 'Combat-style circuits for explosive power and endurance.',
    type: 'protocol', cost: 350, exclusive: false,
    protocolData: {
      title: 'Fighter Conditioning', desc: '10 min circuit: 40s work, 20s rest. Repeat 3 rounds.', type: 'physical', stat: 'agility', gain: 3, difficulty: 3, estDuration: '30 min/day', aiGenerated: false, domain: 'body', tier: 3,
      criteria: 'Do each exercise for 40s, rest 20s. 3 rounds total. Go hard on the work intervals.',
      quest: { title: 'Fighter Circuit: 40/20×3', description: '40s work / 20s rest. 3 rounds. Push yourself each interval.', difficulty: 3, rewardCredits: 25, rewardExp: 35, stat: 'agility' }
    }
  },
  {
    id: 'calisthenics_foundation', name: 'Calisthenics Foundation', description: 'Master bodyweight control — push, pull, squat, plank.',
    type: 'protocol', cost: 200, exclusive: false,
    protocolData: {
      title: 'Calisthenics Foundation', desc: 'Do the foundation circuit: push-ups → rows → squats → plank. 3 rounds.', type: 'physical', stat: 'strength', gain: 2, difficulty: 1, estDuration: '25 min/day', aiGenerated: false, domain: 'body', tier: 1,
      criteria: 'Circuit: push-ups (max), rows (5+), squats (15), plank (30s). Rest 2 min, repeat 2 more rounds.',
      quest: { title: 'Bodyweight Circuit', description: 'Push-ups → Rows → Squats → Plank. 3 rounds. Track your max per round.', difficulty: 1, rewardCredits: 15, rewardExp: 20, stat: 'strength' }
    }
  },
  {
    id: 'endurance_base', name: 'Endurance Base', description: 'Build aerobic capacity — steady state and interval work.',
    type: 'protocol', cost: 300, exclusive: false,
    protocolData: {
      title: 'Endurance Base', desc: '20 min steady cardio (run/row/bike) at conversational pace.', type: 'physical', stat: 'vitality', gain: 3, difficulty: 2, estDuration: '30 min/day', aiGenerated: false, domain: 'body', tier: 2,
      criteria: '20 min steady cardio. You should be able to talk but not sing. Extend by 2 min each session.',
      quest: { title: 'Steady Cardio: 20 min', description: '20 min cardio at conversational pace. No stopping. Feel your endurance grow.', difficulty: 2, rewardCredits: 20, rewardExp: 25, stat: 'vitality' }
    }
  },

  // ════════════════════════════════════════
  // MIND PROTOCOLS
  // ════════════════════════════════════════
  {
    id: 'emotional_awareness', name: 'Emotional Awareness', description: 'Name your emotions as they happen — builds self-awareness.',
    type: 'protocol', cost: 150, exclusive: false,
    protocolData: {
      title: 'Emotional Awareness', desc: 'Name 3 emotions you felt today. Write what triggered them.', type: 'mental', stat: 'willpower', gain: 2, difficulty: 1, estDuration: '10 min/day', aiGenerated: false, domain: 'mind', tier: 1,
      criteria: 'Set 3 alarms. Each time: pause, name what you feel, write the trigger. Do this 3x today.',
      quest: { title: 'Name Your Emotions', description: 'Pause 3 times today. Identify the emotion. Write the trigger.', difficulty: 1, rewardCredits: 15, rewardExp: 20, stat: 'willpower' }
    }
  },
  {
    id: 'metacognition_training', name: 'Metacognition Training', description: 'Think about your thinking — plan, predict, review.',
    type: 'protocol', cost: 200, exclusive: false,
    protocolData: {
      title: 'Metacognition', desc: 'Pick a task. Predict how long it will take. After, compare actual vs predicted.', type: 'mental', stat: 'intelligence', gain: 2, difficulty: 2, estDuration: '15 min/day', aiGenerated: false, domain: 'mind', tier: 1,
      criteria: 'Pick 1 task. Write your predicted time. Do the task. Write actual time. Note the gap. Adjust next prediction.',
      quest: { title: 'Predict vs Reality', description: 'Pick a task. Predict time. Do it. Compare. Adjust your next estimate.', difficulty: 2, rewardCredits: 20, rewardExp: 25, stat: 'intelligence' }
    }
  },
  {
    id: 'emotion_regulation', name: 'Emotion Regulation', description: 'Pause, breathe, reframe — practical techniques for control.',
    type: 'protocol', cost: 250, exclusive: false,
    protocolData: {
      title: 'Emotion Regulation', desc: 'When stressed: pause, take 4 deep breaths (4 in, 7 hold, 8 out), name the emotion.', type: 'mental', stat: 'willpower', gain: 3, difficulty: 2, estDuration: '5 min/day', aiGenerated: false, domain: 'mind', tier: 2,
      criteria: 'When you feel stress or frustration: stop. 4-7-8 breathing (4 in, 7 hold, 8 out). Label the emotion. Continue.',
      quest: { title: 'Pause & Regulate', description: 'Next time you feel stressed: stop, breathe 4-7-8, label the emotion, continue.', difficulty: 2, rewardCredits: 20, rewardExp: 25, stat: 'willpower' }
    }
  },
  {
    id: 'stoic_practice', name: 'Daily Stoic Practice', description: 'Control what you can, release what you can\'t — ancient wisdom.',
    type: 'protocol', cost: 200, exclusive: false,
    protocolData: {
      title: 'Daily Stoic', desc: 'Write 1 thing you control and 1 you don\'t. Practice releasing the second.', type: 'mental', stat: 'willpower', gain: 2, difficulty: 1, estDuration: '5 min/day', aiGenerated: false, domain: 'mind', tier: 1,
      criteria: 'Morning: write what you control vs what you don\'t. Throughout the day: catch yourself worrying about the uncontrollable. Release it.',
      quest: { title: 'Dichotomy of Control', description: 'Write 1 thing you control and 1 you don\'t. Practice releasing the second.', difficulty: 1, rewardCredits: 15, rewardExp: 20, stat: 'willpower' }
    }
  },
  {
    id: 'memory_palace', name: 'Memory Palace Protocol', description: 'Advanced mnemonic techniques to enhance information retention.',
    type: 'protocol', cost: 300, exclusive: false,
    protocolData: {
      title: 'Memory Palace', desc: 'Create a mental location and place items along a familiar route to recall later.', type: 'mental', stat: 'intelligence', gain: 3, difficulty: 3, estDuration: '20 min/day', aiGenerated: false, domain: 'mind', tier: 3,
      criteria: 'Pick a familiar route (your home). Place 5 items you want to remember along the path. Walk it mentally to recall.',
      quest: { title: 'Build a Memory Palace', description: 'Choose a route. Place 5 items along it. Mentally walk it to recall them all.', difficulty: 3, rewardCredits: 25, rewardExp: 35, stat: 'intelligence' }
    }
  },
  {
    id: 'charisma_lab', name: 'Charisma Lab', description: 'Active listening, storytelling, and social confidence drills.',
    type: 'protocol', cost: 300, exclusive: false,
    protocolData: {
      title: 'Charisma Lab', desc: 'In your next conversation: listen more than you speak, ask 2 follow-up questions.', type: 'mental', stat: 'social', gain: 3, difficulty: 2, estDuration: 'practice daily', aiGenerated: false, domain: 'mind', tier: 2,
      criteria: 'Next conversation: listen 80% of the time. Ask 2 follow-up questions. Summarize what they said before responding.',
      quest: { title: 'Active Listening Drill', description: 'In your next conversation: listen 80%, ask 2 follow-ups, summarize before responding.', difficulty: 2, rewardCredits: 20, rewardExp: 25, stat: 'social' }
    }
  },

  // ════════════════════════════════════════
  // BOOKS
  // ════════════════════════════════════════
  {
    id: 'book_starting_strength', name: 'Starting Strength', description: 'Mark Rippetoe — The essential manual for barbell training. 320 pages.',
    type: 'book', cost: 200, exclusive: false,
    protocolData: { title: 'Starting Strength', desc: 'The essential manual for barbell training technique.', type: 'reading', stat: 'strength', gain: 2, difficulty: 1, estDuration: '20 min/day', author: 'Mark Rippetoe', pages: 320, pagesRead: 0, bookStatus: 'reading', domain: 'body', tier: 1,
      criteria: 'Read 10 pages. Note one technique cue you learned. Apply it in your next workout.',
      quest: { title: 'Read: Starting Strength', description: 'Read 10 pages from Starting Strength. Note one technique cue.', difficulty: 1, rewardCredits: 15, rewardExp: 20 }
    }
  },
  {
    id: 'book_complete_calisthenics', name: 'Complete Calisthenics', description: 'Ashley Kalym — Ultimate bodyweight guide. 400 pages, 500+ photos.',
    type: 'book', cost: 200, exclusive: false,
    protocolData: { title: 'Complete Calisthenics', desc: 'Bodyweight exercise from beginner to advanced.', type: 'reading', stat: 'strength', gain: 2, difficulty: 1, estDuration: '20 min/day', author: 'Ashley Kalym', pages: 400, pagesRead: 0, bookStatus: 'reading', domain: 'body', tier: 1,
      criteria: 'Read 10 pages and practice one new exercise from the chapter.',
      quest: { title: 'Read: Complete Calisthenics', description: 'Read 10 pages. Learn and practice one new exercise.', difficulty: 1, rewardCredits: 15, rewardExp: 20 }
    }
  },
  {
    id: 'book_emotional_intelligence', name: 'Emotional Intelligence', description: 'Daniel Goleman — #1 bestseller on why EQ matters more than IQ. 384 pages.',
    type: 'book', cost: 250, exclusive: false,
    protocolData: { title: 'Emotional Intelligence', desc: 'Goleman\'s groundbreaking book on EQ.', type: 'reading', stat: 'willpower', gain: 3, difficulty: 2, estDuration: '20 min/day', author: 'Daniel Goleman', pages: 384, pagesRead: 0, bookStatus: 'reading', domain: 'mind', tier: 2,
      criteria: 'Read 10 pages. Identify one EQ concept and apply it today.',
      quest: { title: 'Read: Emotional Intelligence', description: 'Read 10 pages. Apply one EQ concept in real life today.', difficulty: 2, rewardCredits: 20, rewardExp: 25 }
    }
  },
  {
    id: 'book_daily_stoic', name: 'The Daily Stoic', description: 'Ryan Holiday — 366 daily meditations from Marcus Aurelius, Seneca, Epictetus.',
    type: 'book', cost: 200, exclusive: false,
    protocolData: { title: 'The Daily Stoic', desc: 'Daily Stoic meditations and reflections.', type: 'reading', stat: 'willpower', gain: 2, difficulty: 1, estDuration: '10 min/day', author: 'Ryan Holiday', pages: 416, pagesRead: 0, bookStatus: 'reading', domain: 'mind', tier: 1,
      criteria: 'Read today\'s entry. Write one sentence on how to apply it.',
      quest: { title: 'Read: The Daily Stoic', description: 'Read today\'s Stoic entry. Write one way to apply it.', difficulty: 1, rewardCredits: 15, rewardExp: 20 }
    }
  },
  {
    id: 'book_atomic_habits', name: 'Atomic Habits', description: 'James Clear — Habit architecture for lasting change. 320 pages.',
    type: 'book', cost: 250, exclusive: false,
    protocolData: { title: 'Atomic Habits', desc: 'Proven framework for building good habits and breaking bad ones.', type: 'reading', stat: 'intelligence', gain: 3, difficulty: 2, estDuration: '15 min/day', author: 'James Clear', pages: 320, pagesRead: 0, bookStatus: 'reading', domain: 'mind', tier: 2,
      criteria: 'Read one chapter. Design one tiny habit you can start tomorrow (2 min version).',
      quest: { title: 'Read: Atomic Habits', description: 'Read 1 chapter. Design one 2-minute habit to start tomorrow.', difficulty: 2, rewardCredits: 20, rewardExp: 25 }
    }
  },
  {
    id: 'book_thinking_fast_slow', name: 'Thinking, Fast and Slow', description: 'Daniel Kahneman — Nobel Prize winner on how your mind works. 512 pages.',
    type: 'book', cost: 350, exclusive: false,
    protocolData: { title: 'Thinking, Fast and Slow', desc: 'Kahneman\'s masterwork on cognitive biases and decision-making.', type: 'reading', stat: 'intelligence', gain: 4, difficulty: 3, estDuration: '20 min/day', author: 'Daniel Kahneman', pages: 512, pagesRead: 0, bookStatus: 'reading', domain: 'mind', tier: 3,
      criteria: 'Read 10 pages. Identify one cognitive bias you noticed in yourself today.',
      quest: { title: 'Read: Thinking Fast/Slow', description: 'Read 10 pages. Find one cognitive bias you experienced today.', difficulty: 3, rewardCredits: 25, rewardExp: 35 }
    }
  },
  {
    id: 'book_awaken_giant', name: 'Awaken the Giant Within', description: 'Tony Robbins — Master your emotions, body, and life. 544 pages.',
    type: 'book', cost: 300, exclusive: false,
    protocolData: { title: 'Awaken the Giant Within', desc: 'Robbins\' strategies for mastering emotions and achieving goals.', type: 'reading', stat: 'willpower', gain: 3, difficulty: 2, estDuration: '20 min/day', author: 'Tony Robbins', pages: 544, pagesRead: 0, bookStatus: 'reading', domain: 'mind', tier: 2,
      criteria: 'Read 10 pages. Apply one strategy from the chapter immediately.',
      quest: { title: 'Read: Awaken the Giant', description: 'Read 10 pages. Apply one strategy immediately.', difficulty: 2, rewardCredits: 20, rewardExp: 25 }
    }
  },
  {
    id: 'book_ultimate_conditioning', name: 'Ultimate Conditioning for Martial Arts', description: 'Loren Landow — UFC S&C coach\'s complete fighter conditioning system.',
    type: 'book', cost: 350, exclusive: false,
    protocolData: { title: 'Ultimate Conditioning', desc: 'Complete conditioning system for combat athletes.', type: 'reading', stat: 'agility', gain: 4, difficulty: 3, estDuration: '20 min/day', author: 'Loren Landow', pages: 360, pagesRead: 0, bookStatus: 'reading', domain: 'body', tier: 3,
      criteria: 'Read 10 pages. Add one new drill or exercise from the chapter to your routine.',
      quest: { title: 'Read: Ultimate Conditioning', description: 'Read 10 pages. Add one new drill from the book to your routine.', difficulty: 3, rewardCredits: 25, rewardExp: 35 }
    }
  },

  // ════════════════════════════════════════
  // POWER-UPS
  // ════════════════════════════════════════
  {
    id: 'powerup_2x', name: 'x2 Gain Amplifier', description: 'Double all protocol sync gains for 24 hours.',
    type: 'powerup', cost: 150, exclusive: false,
    powerUpEffect: 'Double protocol sync gains', powerUpMultiplier: 2, duration: 24
  },
  {
    id: 'powerup_auto', name: 'Auto-Sync Module', description: 'Permanently auto-sync your oldest incomplete protocol every day.',
    type: 'powerup', cost: 500, exclusive: false,
    powerUpEffect: 'Auto-sync daily', powerUpMultiplier: 1, duration: 0
  },
  /** v1.4.0: Pro subscription removed from store. isPro flag stays dormant
   * in GameContext for future real billing (Stripe/PayPal). */
];

export const NARRATIVE_CHAPTERS: NarrativeChapter[] = [
  {
    id: 1, title: 'Awakening', content: 'The system flickers to life. A voice echoes through the void: "You have been selected. The NEXUS protocol is now active. Your evolution begins."', requiredLevel: 1, requiredAchievements: [], unlocked: true, read: false, rewardExp: 0, rewardCredits: 0
  },
  {
    id: 2, title: 'The First Gate', content: 'The Architect speaks: "Every journey begins with a single step. Complete your first quest to prove you are worthy of the power that awaits."', requiredLevel: 3, requiredAchievements: ['first_steps'], unlocked: false, read: false, rewardExp: 50, rewardCredits: 25
  },
  {
    id: 3, title: 'Shadow Emerges', content: 'A dark figure appears in your peripheral vision. "You cannot outrun what lives within you. The Shadow grows with every skipped task, every broken promise to yourself. Face it, or be consumed by it."', requiredLevel: 5, requiredAchievements: ['quest_hunter_10'], unlocked: false, read: false, rewardExp: 100, rewardCredits: 50
  },
  {
    id: 4, title: 'Dungeon Break', content: 'Alarms blare. A Raid Boss has materialized. The system broadcasts: "ALL OPERATORS — A dimensional rift has opened. Your strength will be tested. Prepare for battle."', requiredLevel: 10, requiredAchievements: ['streak_7'], unlocked: false, read: false, rewardExp: 200, rewardCredits: 100
  },
  {
    id: 5, title: 'The Armory', content: 'The Store awakens. Pre-built protocols pulse with blue light. "You have earned the right to purchase power. Choose wisely — each protocol is a weapon in your arsenal."', requiredLevel: 8, requiredAchievements: [], unlocked: false, read: false, rewardExp: 150, rewardCredits: 75
  },
  {
    id: 6, title: 'Habit Forge', content: 'A new module decodes: HABIT LAB. "True power is not in grand gestures but in daily discipline. Forge your habits here. Break your chains here."', requiredLevel: 12, requiredAchievements: ['habit_builder'], unlocked: false, read: false, rewardExp: 200, rewardCredits: 100
  },
  {
    id: 7, title: 'Ruler of Shadows', content: 'You stand face to face with your Shadow. It speaks: "I am your excuses. Your procrastination. Your fear. Defeat me, and you become untouchable."', requiredLevel: 20, requiredAchievements: ['shadow_defeated'], unlocked: false, read: false, rewardExp: 500, rewardCredits: 300
  },
  {
    id: 8, title: 'Ascension Protocol', content: 'The ceiling shatters. Light floods in. "You have reached the pinnacle of human potential. But this is not the end — it is the beginning. Ascend, and transcend."', requiredLevel: 30, requiredAchievements: ['rank_b', 'stats_100'], unlocked: false, read: false, rewardExp: 1000, rewardCredits: 500
  },
  {
    id: 9, title: 'The Architect Revealed', content: 'The final chapter. The voice that has guided you steps into the light. "You have surpassed every expectation. You are no longer an operator. You are the architect of your own reality."', requiredLevel: 50, requiredAchievements: ['rank_s', 'ascension_1'], unlocked: false, read: false, rewardExp: 5000, rewardCredits: 5000
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SHADOW MEMORY — long-term memory substrate for the SHADOW agent
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Status of the interrogation gate.
 *   'pristine'      → never opened (Shadow tab will launch the gate)
 *   'in_progress'   → user started but did not finish (resumable)
 *   'complete'      → interrogation done; full chat unlocked
 *   'declined'      → user explicitly skipped the gate
 */
export type ShadowInterrogationStatus = 'pristine' | 'in_progress' | 'complete' | 'declined';

/**
 * Current question index in the 12-question interrogation.
 */
export interface ShadowInterrogationState {
  status: ShadowInterrogationStatus;
  currentIndex: number;
  startedAt: string | null;
  completedAt: string | null;
}

/**
 * One answer in the memory substrate, indexed by tag.
 * Tags are stable: 'schedule' | 'weak_spot' | 'identity_aspiration' | ...
 */
export interface ShadowMemory {
  answers: Record<string, string>;    // tag → answer text
  /** Long shadow taunts that have been shown at least once. */
  taunted: string[];                  // dedupe loop on ShadowChat greeting
  /** Free-form conversation memory beyond the interrogation answers. */
  exchanges: ShadowExchange[];
  /** Derived patterns the Shadow has inferred (operator is student, etc.). */
  patterns: string[];
  /** Interrogation gate state. */
  interrogationStatus?: ShadowInterrogationStatus;
  /** Current question index when in_progress. */
  interrogationCurrentIndex?: number;
  /** ISO timestamp the interrogation gate first opened. */
  interrogationStartedAt?: string | null;
  /** ISO timestamp the interrogation completed. */
  interrogationCompletedAt?: string | null;
  /** Last update timestamp for staleness display. */
  updatedAt: string | null;
}

/** A single chat exchange with the Shadow. Stored for memory + tone analysis. */
export interface ShadowExchange {
  id: string;
  role: 'user' | 'shadow';
  text: string;
  /** True when this turn was tagged as emotionally-loaded (long, sad, late-night, etc.). */
  emotional?: boolean;
  timestamp: string;
}
