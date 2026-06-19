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
  type: 'protocol' | 'powerup' | 'cosmetic' | 'subscription';
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
  type: 'achievement' | 'level_up' | 'ascension_ready';
  title: string;
  description: string;
  icon?: string;
  reward?: { credits?: number; exp?: number };
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
  {
    id: 'memory_palace', name: 'Memory Palace Protocol', description: 'Advanced mnemonic techniques to enhance information retention and recall.',
    type: 'protocol', cost: 300, exclusive: false,
    protocolData: { title: 'Memory Palace', desc: 'Advanced mnemonic techniques to enhance information retention and recall.', type: 'mental', stat: 'intelligence', gain: 3, difficulty: 3, estDuration: '20 min/day', aiGenerated: false }
  },
  {
    id: 'speed_reading', name: 'Speed Reading Protocol', description: 'Train your eyes and brain to process text at 3x your current speed.',
    type: 'protocol', cost: 250, exclusive: false,
    protocolData: { title: 'Speed Reading', desc: 'Train your eyes and brain to process text at 3x your current speed.', type: 'mental', stat: 'intelligence', gain: 2, difficulty: 2, estDuration: '15 min/day', aiGenerated: false }
  },
  {
    id: 'deep_focus', name: 'Deep Focus Protocol', description: 'Extend your concentration windows using progressive overload techniques.',
    type: 'protocol', cost: 400, exclusive: false,
    protocolData: { title: 'Deep Focus', desc: 'Extend your concentration windows using progressive overload techniques.', type: 'mental', stat: 'willpower', gain: 3, difficulty: 4, estDuration: '30 min/day', aiGenerated: false }
  },
  {
    id: 'spartan_hiit', name: 'Spartan HIIT Protocol', description: 'High-intensity interval training designed for maximum efficiency.',
    type: 'protocol', cost: 300, exclusive: false,
    protocolData: { title: 'Spartan HIIT', desc: 'High-intensity interval training designed for maximum efficiency.', type: 'physical', stat: 'strength', gain: 3, difficulty: 3, estDuration: '20 min/day', aiGenerated: false }
  },
  {
    id: 'calisthenics', name: 'Calisthenics Foundation', description: 'Master your bodyweight with progressive calisthenics routines.',
    type: 'protocol', cost: 250, exclusive: false,
    protocolData: { title: 'Calisthenics Foundation', desc: 'Master your bodyweight with progressive calisthenics routines.', type: 'physical', stat: 'strength', gain: 2, difficulty: 2, estDuration: '25 min/day', aiGenerated: false }
  },
  {
    id: 'marathon_base', name: 'Marathon Base Protocol', description: 'Build your aerobic endurance from the ground up.',
    type: 'protocol', cost: 350, exclusive: false,
    protocolData: { title: 'Marathon Base', desc: 'Build your aerobic endurance from the ground up.', type: 'physical', stat: 'vitality', gain: 3, difficulty: 3, estDuration: '30-45 min/day', aiGenerated: false }
  },
  {
    id: 'cold_exposure', name: 'Cold Exposure Protocol', description: 'Wim Hof inspired cold therapy to build willpower and resilience.',
    type: 'protocol', cost: 350, exclusive: false,
    protocolData: { title: 'Cold Exposure', desc: 'Wim Hof inspired cold therapy to build willpower and resilience.', type: 'willpower', stat: 'willpower', gain: 4, difficulty: 5, estDuration: '10 min/day', aiGenerated: false }
  },
  {
    id: 'digital_detox', name: 'Digital Detox Protocol', description: 'Systematic reduction of screen time and digital dependency.',
    type: 'protocol', cost: 200, exclusive: false,
    protocolData: { title: 'Digital Detox', desc: 'Systematic reduction of screen time and digital dependency.', type: 'willpower', stat: 'willpower', gain: 2, difficulty: 2, estDuration: 'ongoing', aiGenerated: false }
  },
  {
    id: 'agility_drill', name: 'Shadow Agility Protocol', description: 'Reaction time and agility drills inspired by combat training.',
    type: 'protocol', cost: 300, exclusive: false,
    protocolData: { title: 'Shadow Agility', desc: 'Reaction time and agility drills inspired by combat training.', type: 'agility', stat: 'agility', gain: 3, difficulty: 3, estDuration: '20 min/day', aiGenerated: false }
  },
  {
    id: 'social_aura', name: 'Social Aura Protocol', description: 'Charisma and communication skill-building exercises.',
    type: 'protocol', cost: 350, exclusive: false,
    protocolData: { title: 'Social Aura', desc: 'Charisma and communication skill-building exercises.', type: 'mental', stat: 'social', gain: 3, difficulty: 3, estDuration: '15 min/day', aiGenerated: false }
  },
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
  {
    id: 'pro_monthly', name: 'NEXUS Pro — Monthly', description: 'Unlimited AI chat, all protocols unlocked, exclusive items, 500 NC monthly stipend.',
    type: 'subscription', cost: 999, exclusive: false,
    duration: 30
  },
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
