import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserStats, UserProfile, Protocol, Quest, Task, StatType, ProtocolType,
  StreakData, Achievement, PenaltyRecord, Habit, MicroQuest,
  ActivePowerUp, Debuff, ShadowState, RaidBoss, AscensionData,
  NarrativeChapter, RiftSchedule, StoreItem, ProgressionState,
  CustomSkillSet, CustomSkill, AppNotification,
  ConsistencyData, AgentRecommendation, ThemeColor, ExpHistoryEntry,
  calculateExpToNextLevel, getRankFromLevel, DEFAULT_ACHIEVEMENTS,
  STORE_ITEMS, NARRATIVE_CHAPTERS,
  DailyBaseline, DailyBaselineTask, BaselineMode, DEFAULT_FIXED_BASELINE
} from './types';
import type { Language } from './i18n/strings';
import { generateAgentResponse, streamAgentResponse, AgentType } from './services/agentService';
import { generateTrainerResponse, streamTrainerResponse } from './services/trainerService';
import { AgentOrchestrator } from './agents/AgentOrchestrator';
import { eventBus, getEventLog, clearEventLog, NexusEvent } from './agents/EventBus';
import {
  BehaviorProfile, emptyBehaviorProfile, loadProfile, persistProfile,
  recordEvent as recordBehaviorEvent, ReminderWindow, DEFAULT_REMINDER_WINDOWS,
} from './agents/BehaviorProfile';
import { saveWindows as saveReminderWindows, loadLastFired } from './agents/ReminderScheduler';
import {
  onProtocolActivated as strategicOnProtocolActivated,
  onBookActivated as strategicOnBookActivated,
  onHabitCreated as strategicOnHabitCreated,
  onHabitDestroyed as strategicOnHabitDestroyed,
  loadAutoQuestConfig,
  AutoQuestConfig,
} from './agents/strategicQuestService';
import {
  buildEmptyWindow,
  coerceWindow,
  markToday,
  scoreFromWindow,
  windowCompletions,
  type DayCompletion,
} from './utils/consistency';
import {
  loadShadowMemory,
  recordAnswer as recordShadowAnswerUtil,
  markInterrogationComplete as markShadowInterrogationCompleteUtil,
  startInterrogation as startShadowInterrogationUtil,
  setInterrogationIndex as setShadowInterrogationIndexUtil,
  declineInterrogation as declineShadowInterrogationUtil,
  appendChat as appendShadowChatUtil,
  clearShadowMemory,
  formatMemoryDigest,
  answeredCount as answeredShadowCount,
  type ShadowMemory,
  type ShadowChatEntry,
} from './utils/shadowMemory';
import type { ShadowTag } from './services/shadowQuestions';

const NC_PER_TASK = 10;
const NC_PER_QUEST_BASE = 50;
const NC_PER_READ_SESSION = 25;
const NC_PER_STREAK_3 = 50;
const NC_PER_STREAK_7 = 200;
const NC_PER_STREAK_30 = 1000;
const NC_PERFECT_WEEK = 300;
const NC_MISS_PENALTY_BASE = 10;

const EXP_PER_TASK = 15;
const EXP_PER_QUEST = 50;
const EXP_PER_READ_SESSION = 30;

interface GameContextType {
  stats: UserStats;
  userProfile: UserProfile;
  quests: Quest[];
  tasks: Task[];
  appPermissions: Record<string, boolean>;
  hasCompletedAssessment: boolean;
  selectedCharacter: string | null;
  currentProtocolId: string | null;
  protocols: Protocol[];
  credits: number;
  progression: ProgressionState;
  streakData: StreakData;
  achievements: Achievement[];
  penaltyRecords: PenaltyRecord[];
  habits: Habit[];
  activePowerUps: ActivePowerUp[];
  debuffs: Debuff[];
  shadowState: ShadowState;
  raidBoss: RaidBoss | null;
  ascensionData: AscensionData;
  narrativeChapters: NarrativeChapter[];
  riftSchedules: RiftSchedule[];
  customSkillSets: CustomSkillSet[];
  isPro: boolean;
  lastStatUpdates: Record<string, string>;

  completeAssessment: (initialStats: UserStats) => Promise<void>;
  setCharacter: (name: string) => Promise<void>;
  setProtocol: (id: string) => Promise<void>;
  addProtocol: (protocol: Partial<Protocol>) => Promise<void>;
  removeProtocol: (id: string) => void;
  updateProtocol: (id: string, updates: Partial<Protocol>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addQuest: (quest: Partial<Quest>) => Promise<void>;
  completeQuest: (id: string) => void;
  failQuest: (id: string) => void;
  completeTask: (id: string) => void;
  failTask: (id: string) => void;
  toggleAppPermission: (appName: string) => void;
  updateStat: (stat: StatType, value: number) => void;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  addExp: (amount: number) => void;
  checkLevelUp: () => void;
  updateStreak: () => void;
  spendRestToken: () => void;
  checkStreak: () => void;
  applyPenalty: (type: PenaltyRecord['type'], reason: string, amount: number) => void;
  checkAchievements: () => void;
  addHabit: (habit: Partial<Habit>) => void;
  completeMicroQuest: (habitId: string, questId: string) => void;
  recordRelapse: (habitId: string) => void;
  removeHabit: (id: string) => void;
  activatePowerUp: (item: StoreItem) => void;
  checkPowerUps: () => void;
  addDebuff: (debuff: Debuff) => void;
  checkDebuffs: () => void;
  damageRaidBoss: (damage: number) => void;
  completeRaidBoss: () => void;
  notifications: AppNotification[];
  canAscend: boolean;
  generateNewRaidBoss: () => void;
  performAscension: () => void;
  readChapter: (id: number) => void;
  checkRifts: () => void;
  generateDailyTasks: () => void;
  purchaseStoreItem: (item: StoreItem) => boolean;
  setProStatus: (status: boolean) => void;
  pushNotification: (n: AppNotification) => void;
  dismissNotification: (id: string) => void;
  addCustomSkillSet: (set: CustomSkillSet) => void;
  removeCustomSkillSet: (id: string) => void;
  updateCustomSkillValue: (setId: string, skillName: string, value: number) => void;
  sendCommandToAgent: (agentType: string, command: string) => Promise<{ response: string, reasoning: string[], actions?: any[] }>;
  streamCommandToAgent: (agentType: string, command: string, onChunk: (text: string) => void) => Promise<void>;
  sendTrainerRequest: (message: string) => Promise<{ response: string, reasoning: string[], agentUsed: string, coordinatedWith: string[] }>;
  streamTrainerRequest: (message: string, onChunk: (text: string) => void) => Promise<{ fullResponse: string, agentUsed: string, coordinatedWith: string[] }>;
  consistency: ConsistencyData;
  recommendations: AgentRecommendation[];
  generateRecommendations: () => Promise<void>;
  expHistory: ExpHistoryEntry[];
  theme: ThemeColor;
  setTheme: (t: ThemeColor) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  getAgentMotivation: () => Promise<string>;
  getQuestGeneratorStatus: () => string;
  resetAllData: () => void;
  // v1.4.0 — agent mesh
  eventLog: Array<{ at: string; event: NexusEvent }>;
  publishEvent: <E extends NexusEvent['type']>(
    event: E,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
  ) => void;
  behaviorProfile: BehaviorProfile;
  reminderWindows: ReminderWindow[];
  setReminderWindows: (windows: ReminderWindow[]) => void;
  dailyBaseline: DailyBaseline;
  toggleBaselineMode: () => void;
  toggleBaselineTask: (taskId: string) => void;
  addCustomBaselineTask: (task: Omit<DailyBaselineTask, 'id' | 'completed'>) => void;
  removeCustomBaselineTask: (taskId: string) => void;
  resetDailyBaseline: () => void;

  // v1.4.x — Penalty Zone lockout mode. When `currentMode === 'penalty_zone'`
  // the dashboard shows a fullscreen survival-protocol screen instead of
  // the normal command center.
  currentMode: 'normal' | 'survival' | 'penalty_zone';
  penaltyZoneReason: string | null;
  enterPenaltyZone: (reason: string) => void;
  exitPenaltyZone: () => void;

  // Shadow interrogation + long-term memory
  shadowMemory: ShadowMemory;
  shadowMemoryDigest: string;
  recordShadowAnswer: (tag: ShadowTag, answer: string | string[] | undefined) => void;
  markShadowInterrogationComplete: (callSign: string | null) => void;
  startShadowInterrogation: () => void;
  setShadowInterrogationIndex: (index: number) => void;
  declineShadowInterrogation: () => void;
  appendShadowChat: (entry: ShadowChatEntry) => void;
  resetShadowMemory: () => void;
  shadowAnsweredCount: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const today = () => new Date().toISOString().split('T')[0];
const now = () => new Date().toISOString();

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean>(() => {
    return localStorage.getItem('nexus_assessment_complete') === 'true';
  });
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(() => {
    return localStorage.getItem('selectedCharacter') || 'Ayanokoji';
  });
  const [currentProtocolId, setCurrentProtocolId] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>(() => {
    const saved = localStorage.getItem('protocols');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', title: 'Neural Overclock', type: 'mental', stat: 'intelligence', gain: 2, desc: 'Intense cognitive load training.' },
      { id: 'p2', title: 'Hypertrophy Protocol', type: 'physical', stat: 'strength', gain: 2, desc: 'High-intensity resistance training.' }
    ];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('stats');
    return saved ? JSON.parse(saved) : { strength: 10, intelligence: 10, agility: 10, vitality: 10, willpower: 10, social: 10 };
  });
  const [lastStatUpdates, setLastStatUpdates] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('nexus_lastStatUpdates');
    if (saved) return JSON.parse(saved);
    const now = new Date().toISOString();
    return { strength: now, intelligence: now, agility: now, vitality: now, willpower: now, social: now };
  });

  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('nexus_credits');
    return saved ? parseInt(saved) : 50;
  });

  const [progression, setProgression] = useState<ProgressionState>(() => {
    const saved = localStorage.getItem('nexus_progression');
    if (saved) return JSON.parse(saved);
    return { level: 1, exp: 0, expToNextLevel: calculateExpToNextLevel(1), rank: 'E', totalExpEarned: 0, statPoints: 0 };
  });

  const [streakData, setStreakData] = useState<StreakData>(() => {
    const saved = localStorage.getItem('nexus_streak');
    return saved ? JSON.parse(saved) : { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, dailyCompletions: 0, totalDailyTarget: 3, weeklyStreak: 0, longestWeeklyStreak: 0 };
  });

  const [consistency, setConsistency] = useState<ConsistencyData>(() => {
    const saved = localStorage.getItem('nexus_consistency');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate the sliding-window shape — old boolean[] day-of-week
        // buckets are dropped and replaced with a fresh empty window
        // (the operator hasn't actually completed anything yet).
        return {
          ...parsed,
          last7Days: coerceWindow(parsed.last7Days),
          score: typeof parsed.score === 'number' ? parsed.score : 0,
        };
      } catch {
        /* fall through to default */
      }
    }
    // Fresh operator: real zero, empty window. Don't show "100%" before
    // they have done anything.
    return {
      score: 0,
      totalDays: 0,
      completedDays: 0,
      currentRun: 0,
      longestRun: 0,
      recoveryCount: 0,
      last7Days: buildEmptyWindow(),
      graceDaysRemaining: 2,
    };
  });

  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>(() => {
    const saved = localStorage.getItem('nexus_recommendations');
    return saved ? JSON.parse(saved) : [];
  });

  const orchestratorRef = useRef<AgentOrchestrator | null>(null);
  const getOrchestrator = useCallback(() => {
    if (!orchestratorRef.current) {
      orchestratorRef.current = new AgentOrchestrator();
      orchestratorRef.current.initialize().catch(() => {});
    }
    return orchestratorRef.current;
  }, []);

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('nexus_achievements');
    return saved ? JSON.parse(saved) : DEFAULT_ACHIEVEMENTS;
  });

  const [penaltyRecords, setPenaltyRecords] = useState<PenaltyRecord[]>(() => {
    const saved = localStorage.getItem('nexus_penalties');
    return saved ? JSON.parse(saved) : [];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('nexus_habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>(() => {
    const saved = localStorage.getItem('nexus_powerups');
    return saved ? JSON.parse(saved) : [];
  });

  const [debuffs, setDebuffs] = useState<Debuff[]>(() => {
    const saved = localStorage.getItem('nexus_debuffs');
    return saved ? JSON.parse(saved) : [];
  });

  const [shadowState, setShadowState] = useState<ShadowState>(() => {
    const saved = localStorage.getItem('nexus_shadow');
    if (saved) return JSON.parse(saved);
    return { strength: 5, intelligence: 5, agility: 5, vitality: 5, willpower: 5, social: 5, lastUpdated: now(), isDominant: false, challengeIssued: false, challengeCompleted: false };
  });

  const [raidBoss, setRaidBoss] = useState<RaidBoss | null>(() => {
    const saved = localStorage.getItem('nexus_raidboss');
    if (saved) return JSON.parse(saved);
    const bosses = [
      { name: 'The Lethargy Lord', desc: 'A manifestation of procrastination and inertia.', hp: 5000 },
      { name: 'The Distortion Beast', desc: 'Feeds on distraction and broken focus.', hp: 7500 },
      { name: 'The Chaos Wyrm', desc: 'Thrives on inconsistency. Streaks are your weapon.', hp: 10000 },
      { name: 'The Void Colossus', desc: 'Born from abandoned goals.', hp: 15000 },
    ];
    const boss = bosses[Math.floor(Math.random() * bosses.length)];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return {
      id: `raid_${Date.now()}`,
      name: boss.name,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      maxHp: boss.hp,
      currentHp: boss.hp,
      defeated: false,
      rewardCredits: 500,
      rewardExp: 300,
      bossDescription: boss.desc,
      participants: 1,
    };
  });

  const [ascensionData, setAscensionData] = useState<AscensionData>(() => {
    const saved = localStorage.getItem('nexus_ascension');
    return saved ? JSON.parse(saved) : { ascensionCount: 0, multiplier: 1.0, ascendedAt: [] };
  });

  const [narrativeChapters, setNarrativeChapters] = useState<NarrativeChapter[]>(() => {
    const saved = localStorage.getItem('nexus_narrative');
    return saved ? JSON.parse(saved) : NARRATIVE_CHAPTERS;
  });

  const [riftSchedules, setRiftSchedules] = useState<RiftSchedule[]>(() => {
    const saved = localStorage.getItem('nexus_rifts');
    return saved ? JSON.parse(saved) : [
      { id: 'r1', name: 'Night Owl Protocol', description: 'Deep focus training available only during late hours.', unlockHourStart: 22, unlockHourEnd: 2, protocolId: 'rift_nightowl', active: false, daysOfWeek: [0,1,2,3,4,5,6] },
      { id: 'r2', name: 'Dawn Warrior', description: 'Early morning strength protocol. Available at sunrise.', unlockHourStart: 5, unlockHourEnd: 7, protocolId: 'rift_dawn', active: false, daysOfWeek: [0,1,2,3,4,5,6] },
    ];
  });

  /** v1.4.0 — isPro is now a dormant flag. Pro subscription removed from store.
   *  Retained in localStorage for future real billing (Stripe/PayPal). */
  const [isPro, setIsPro] = useState<boolean>(() => localStorage.getItem('nexus_pro') === 'true');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const canAscend = (Object.values(stats) as number[]).every(s => s >= 100);
  const prevLevelRef = useRef(progression.level);

  // R-03 — calendar heatmap data (date → {exp, credits} earned) and theme color
  const [expHistory, setExpHistory] = useState<ExpHistoryEntry[]>(() => {
    const saved = localStorage.getItem('nexus_exp_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setThemeState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('nexus_theme') as ThemeColor | null;
    return saved === 'sapphire' || saved === 'crimson' ? saved : 'emerald';
  });

  const setTheme = useCallback((t: ThemeColor) => {
    setThemeState(t);
    localStorage.setItem('nexus_theme', t);
  }, []);

  // R-09 — language overlay
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('nexus_language') as Language | null;
    return saved === 'ja' ? 'ja' : 'en';
  });

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    localStorage.setItem('nexus_language', l);
  }, []);

  // v1.4.0 — Agent mesh: behavior profile + reminder windows + event log
  const [behaviorProfile, setBehaviorProfile] = useState<BehaviorProfile>(() => loadProfile());
  const [reminderWindows, setReminderWindowsState] = useState<ReminderWindow[]>(() => {
    try {
      const raw = localStorage.getItem('nexus_reminder_windows');
      if (!raw) return DEFAULT_REMINDER_WINDOWS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_REMINDER_WINDOWS;
    } catch {
      return DEFAULT_REMINDER_WINDOWS;
    }
  });
  const [eventLog, setEventLog] = useState<Array<{ at: string; event: NexusEvent }>>(() => getEventLog());

  const setReminderWindows = useCallback((windows: ReminderWindow[]) => {
    setReminderWindowsState(windows);
    saveReminderWindows(windows);
    localStorage.setItem('nexus_reminder_windows', JSON.stringify(windows));
  }, []);

  /** Publish a typed event into the bus. All subscribed agents will react. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publishEvent = useCallback(<E extends NexusEvent['type']>(event: E, payload: any) => {
    eventBus.publish(event, payload);
    // refresh event log so the UI can introspect
    setEventLog(getEventLog());
    // record into behavior profile (fire and forget)
    const full: NexusEvent = { ...payload, type: event } as NexusEvent;
    setBehaviorProfile(prev => {
      const next = recordBehaviorEvent(prev, full);
      persistProfile(next);
      return next;
    });
  }, []);

  const pushNotification = useCallback((n: AppNotification) => {
    setNotifications(prev => [...prev.slice(-9), n]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const [customSkillSets, setCustomSkillSets] = useState<CustomSkillSet[]>(() => {
    const saved = localStorage.getItem('nexus_custom_skills');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyBaseline, setDailyBaseline] = useState<DailyBaseline>(() => {
    const saved = localStorage.getItem('nexus_daily_baseline');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      mode: 'fixed',
      fixedTasks: DEFAULT_FIXED_BASELINE.map(t => ({ ...t, completed: false })),
      customTasks: [],
      lastCompletedDate: null,
      completionHistory: [],
    };
  });

  // v1.4.x — Penalty Zone lockout state. Persisted so a reload doesn't
  // reset the suspense (the whole point of a penalty is that you cannot
  // escape by app-restarting).
  const [currentMode, setCurrentMode] = useState<'normal' | 'survival' | 'penalty_zone'>(() => {
    const saved = localStorage.getItem('nexus_mode');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return saved === 'penalty_zone' || saved === 'survival' ? saved : 'normal';
  });
  const [penaltyZoneReason, setPenaltyZoneReason] = useState<string | null>(() => {
    return localStorage.getItem('nexus_penalty_reason');
  });

  const enterPenaltyZone = useCallback((reason: string) => {
    setCurrentMode('penalty_zone');
    setPenaltyZoneReason(reason);
    localStorage.setItem('nexus_mode', 'penalty_zone');
    localStorage.setItem('nexus_penalty_reason', reason);
  }, []);

  const exitPenaltyZone = useCallback(() => {
    setCurrentMode('normal');
    setPenaltyZoneReason(null);
    localStorage.removeItem('nexus_mode');
    localStorage.removeItem('nexus_penalty_reason');
  }, []);

  // Shadow long-term memory — persisted in localStorage by the util.
  // We mirror it into a React state for re-render-driven UI updates.
  const [shadowMemory, setShadowMemory] = useState<ShadowMemory>(() => loadShadowMemory());

  const recordShadowAnswer = useCallback(
    (tag: ShadowTag, answer: string | string[] | undefined) => {
      const next = recordShadowAnswerUtil(shadowMemory, tag, answer);
      setShadowMemory(next);
    },
    [shadowMemory],
  );

  const markShadowInterrogationComplete = useCallback((callSign: string | null) => {
    const next = markShadowInterrogationCompleteUtil(shadowMemory, callSign);
    setShadowMemory(next);
  }, [shadowMemory]);

  const startShadowInterrogation = useCallback(() => {
    setShadowMemory(prev => startShadowInterrogationUtil(prev));
  }, []);

  const setShadowInterrogationIndex = useCallback((index: number) => {
    setShadowMemory(prev => setShadowInterrogationIndexUtil(prev, index));
  }, []);

  const declineShadowInterrogation = useCallback(() => {
    setShadowMemory(prev => declineShadowInterrogationUtil(prev));
  }, []);

  const appendShadowChat = useCallback((entry: ShadowChatEntry) => {
    const next = appendShadowChatUtil(shadowMemory, entry);
    setShadowMemory(next);
  }, [shadowMemory]);

  const resetShadowMemory = useCallback(() => {
    clearShadowMemory();
    setShadowMemory(loadShadowMemory());
  }, []);

  const shadowMemoryDigest = formatMemoryDigest(shadowMemory);
  const shadowAnsweredCount = answeredShadowCount(shadowMemory);

  const [quests, setQuests] = useState<Quest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appPermissions, setAppPermissions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('appPermissions');
    return saved ? JSON.parse(saved) : { 'Instagram': false, 'Twitter': false, 'TikTok': false };
  });
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      name: 'Operator',
      primaryGoal: 'Build a disciplined self-improvement ecosystem across fitness, cognition, emotional resilience, and daily habits.',
      secondaryGoals: ['Get stronger', 'Improve focus', 'Build confidence', 'Create better habits'],
      fitnessExperience: 'beginner',
      learningStyle: 'visual and practical',
      emotionalState: 'motivated but inconsistent',
      barriers: ['time management', 'consistency', 'energy dips'],
      scheduleNotes: 'Training sessions should fit around study/work blocks and evening recovery.',
      preferences: ['structured routines', 'progress tracking', 'micro habit prompts'],
      wellnessFocus: ['strength', 'mental clarity', 'emotional stability'],
      accountabilityNeeds: 'Daily check-ins and simple, actionable steps.'
    };
  });

  // v1.4.0 — wire the agent mesh to the bus. This effect mounts once on
  // provider mount and survives for the lifetime of the app. Subscribers
  // are intentionally lightweight: notification-style pings + behavior
  // updates only. Heavy AI work (quest generation, motivational messages)
  // is triggered explicitly elsewhere.
  useEffect(() => {
    const orch = getOrchestrator();
    const unsubs: Array<() => void> = [];

    unsubs.push(eventBus.subscribe('protocol.activated', (e) => {
      pushNotification({
        id: `proto_activated_${e.protocolId}_${Date.now()}`,
        type: 'achievement',
        title: 'Protocol Locked In',
        description: `Strategic quest chain queued for ${e.kind} protocol. Open Quest Board.`,
        timestamp: new Date().toISOString(),
      });
    }));

    unsubs.push(eventBus.subscribe('book.activated', (e) => {
      pushNotification({
        id: `book_activated_${e.bookId}_${Date.now()}`,
        type: 'achievement',
        title: 'Reading Quest Generated',
        description: `Book mastery chain initialized for "${e.title}".`,
        timestamp: new Date().toISOString(),
      });
    }));

    unsubs.push(eventBus.subscribe('habit.created', (e) => {
      pushNotification({
        id: `habit_created_${e.habitId}_${Date.now()}`,
        type: 'achievement',
        title: e.isAddiction ? 'Addiction Targeted' : 'Habit Under Construction',
        description: `3 micro-quests auto-generated for "${e.title}".`,
        timestamp: new Date().toISOString(),
      });
    }));

    unsubs.push(eventBus.subscribe('habit.destroyed', (e) => {
      pushNotification({
        id: `habit_destroyed_${e.habitId}_${Date.now()}`,
        type: 'penalty',
        title: 'Replacement Rituals Generated',
        description: `Holding the line on "${e.title}". Replacement quests queued.`,
        timestamp: new Date().toISOString(),
      });
    }));

    unsubs.push(eventBus.subscribe('streak.broken', (e) => {
      pushNotification({
        id: `streak_broken_${Date.now()}`,
        type: 'penalty',
        title: 'Streak Reset',
        description: `You held a ${e.previousStreak}-day run. The Manager has logged it.`,
        timestamp: new Date().toISOString(),
      });
    }));

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []); // mount-only

  useEffect(() => {
    localStorage.setItem('selectedCharacter', selectedCharacter || '');
    localStorage.setItem('protocols', JSON.stringify(protocols));
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('appPermissions', JSON.stringify(appPermissions));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    localStorage.setItem('nexus_credits', credits.toString());
    localStorage.setItem('nexus_progression', JSON.stringify(progression));
    localStorage.setItem('nexus_streak', JSON.stringify(streakData));
    localStorage.setItem('nexus_achievements', JSON.stringify(achievements));
    localStorage.setItem('nexus_penalties', JSON.stringify(penaltyRecords));
    localStorage.setItem('nexus_habits', JSON.stringify(habits));
    localStorage.setItem('nexus_powerups', JSON.stringify(activePowerUps));
    localStorage.setItem('nexus_debuffs', JSON.stringify(debuffs));
    localStorage.setItem('nexus_shadow', JSON.stringify(shadowState));
    if (raidBoss) localStorage.setItem('nexus_raidboss', JSON.stringify(raidBoss));
    localStorage.setItem('nexus_ascension', JSON.stringify(ascensionData));
    localStorage.setItem('nexus_narrative', JSON.stringify(narrativeChapters));
    localStorage.setItem('nexus_rifts', JSON.stringify(riftSchedules));
    localStorage.setItem('nexus_custom_skills', JSON.stringify(customSkillSets));
    localStorage.setItem('nexus_lastStatUpdates', JSON.stringify(lastStatUpdates));
    localStorage.setItem('nexus_pro', isPro.toString());
    localStorage.setItem('nexus_assessment_complete', hasCompletedAssessment.toString());
    localStorage.setItem('nexus_exp_history', JSON.stringify(expHistory));
    localStorage.setItem('nexus_theme', theme);
    localStorage.setItem('nexus_language', language);
    localStorage.setItem('nexus_reminder_windows', JSON.stringify(reminderWindows));
  }, [hasCompletedAssessment, selectedCharacter, protocols, stats, credits, progression, streakData, achievements, penaltyRecords, habits, activePowerUps, debuffs, shadowState, raidBoss, ascensionData, narrativeChapters, riftSchedules, customSkillSets, isPro, appPermissions, userProfile, lastStatUpdates, expHistory, theme, language, reminderWindows]);

  useEffect(() => {
    localStorage.setItem('nexus_daily_baseline', JSON.stringify(dailyBaseline));
  }, [dailyBaseline]);

  const completeAssessment = async (initialStats: UserStats) => {
    setStats(initialStats);
    const stamped = Object.fromEntries(Object.keys(initialStats).map(k => [k, now()]));
    setLastStatUpdates(stamped);
    setHasCompletedAssessment(true);
  };

  const setCharacter = async (name: string) => { setSelectedCharacter(name); };
  const setProtocol = async (id: string) => { setCurrentProtocolId(id); };

  const addProtocol = async (protocol: Partial<Protocol>) => {
    const newProtocol: Protocol = {
      id: Date.now().toString(),
      title: protocol.title || 'Untitled Protocol',
      desc: protocol.desc || '',
      type: (protocol.type as ProtocolType) || 'mental',
      stat: protocol.stat || 'intelligence',
      gain: protocol.gain || 1,
      ...protocol
    };
    setProtocols(prev => [...prev, newProtocol]);
    // v1.4.0 — fan out to the agent mesh (QuestGen, BookMastery, etc.)
    publishEvent('protocol.activated', {
      protocolId: newProtocol.id,
      stat: newProtocol.stat,
      kind: newProtocol.type,
    });
    if (newProtocol.type === 'reading') {
      publishEvent('book.activated', {
        bookId: newProtocol.id,
        title: newProtocol.title,
      });
    }
    // v1.4.0 — strategic quest auto-generation
    const ctx = { stats, profile: userProfile, quests, enhancedQuests: [], tasks, level: progression.level, exp: progression.exp, expToNextLevel: progression.expToNextLevel };
    try {
      const autoQuests = newProtocol.type === 'reading'
        ? await strategicOnBookActivated(newProtocol, ctx)
        : await strategicOnProtocolActivated(newProtocol, ctx);
      if (autoQuests.length > 0) {
        setQuests(prev => [...prev, ...autoQuests]);
      }
    } catch (err) {
      console.warn('[addProtocol] strategic quest generation failed:', err);
    }
  };

  const removeProtocol = (id: string) => {
    setProtocols(prev => prev.filter(p => p.id !== id));
  };

  const updateProtocol = (id: string, updates: Partial<Protocol>) => {
    setProtocols(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  const addQuest = async (quest: Partial<Quest>) => {
    setQuests(prev => [...prev, {
      id: Date.now().toString(),
      title: quest.title || 'Untitled Quest',
      description: quest.description || '',
      type: quest.type || 'daily',
      category: quest.category || 'mental',
      difficulty: quest.difficulty || 1,
      rewardExp: quest.rewardExp || EXP_PER_QUEST,
      rewardCredits: quest.rewardCredits || NC_PER_QUEST_BASE,
      statAffected: quest.statAffected || 'intelligence',
      completed: false,
      failed: false,
      ...quest
    }]);
  };

  const recordEarning = useCallback((expDelta: number, creditsDelta: number) => {
    if (expDelta === 0 && creditsDelta === 0) return;
    const d = today();
    setExpHistory(prev => {
      const existing = prev.find(e => e.date === d);
      if (existing) {
        return prev.map(e => e.date === d ? { ...e, exp: e.exp + expDelta, credits: e.credits + creditsDelta } : e);
      }
      return [...prev, { date: d, exp: expDelta, credits: creditsDelta }];
    });
  }, []);

  const addCredits = (amount: number) => {
    if (amount === 0) return;
    setCredits(prev => Math.max(0, prev + amount));
    recordEarning(0, amount);
  };

  const spendCredits = (amount: number): boolean => {
    if (credits < amount) return false;
    setCredits(prev => prev - amount);
    return true;
  };

  const addExp = (amount: number) => {
    setProgression(prev => {
      const newTotal = prev.totalExpEarned + amount;
      let newExp = prev.exp + amount;
      let newLevel = prev.level;
      let newExpToNext = prev.expToNextLevel;
      let newStatPoints = prev.statPoints;

      while (newExp >= newExpToNext) {
        newExp -= newExpToNext;
        newLevel += 1;
        newExpToNext = calculateExpToNextLevel(newLevel);
        newStatPoints += Math.min(newLevel, 3);
      }

      if (newLevel > prev.level) {
        setTimeout(() => {
          pushNotification({
            id: `lvl_${newLevel}_${now()}`,
            type: 'level_up',
            title: `Level Up! Now Level ${newLevel}`,
            description: `Rank: ${getRankFromLevel(newLevel)}`,
            timestamp: now(),
          });
        }, 0);
      }

      return {
        level: newLevel,
        exp: newExp,
        expToNextLevel: newExpToNext,
        rank: getRankFromLevel(newLevel),
        totalExpEarned: newTotal,
        statPoints: newStatPoints
      };
    });
    recordEarning(amount, 0);
  };

  const checkLevelUp = useCallback(() => {
    setProgression(prev => {
      if (prev.exp >= prev.expToNextLevel) {
        let newExp = prev.exp;
        let newLevel = prev.level;
        let newExpToNext = prev.expToNextLevel;
        let newStatPoints = prev.statPoints;

        while (newExp >= newExpToNext) {
          newExp -= newExpToNext;
          newLevel += 1;
          newExpToNext = calculateExpToNextLevel(newLevel);
          newStatPoints += Math.min(newLevel, 3);
        }

        return {
          ...prev,
          level: newLevel,
          exp: newExp,
          expToNextLevel: newExpToNext,
          rank: getRankFromLevel(newLevel),
          statPoints: newStatPoints
        };
      }
      return prev;
    });
  }, []);

  const updateStreak = useCallback(() => {
    const d = today();
    setStreakData(prev => {
      if (prev.lastCompletedDate === d) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = prev.lastCompletedDate === yesterdayStr || prev.lastCompletedDate === null
        ? prev.currentStreak + 1
        : 1;

      const newWeeklyStreak = prev.lastCompletedDate === yesterdayStr || prev.lastCompletedDate === null
        ? prev.weeklyStreak + 1
        : 1;

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastCompletedDate: d,
        dailyCompletions: prev.dailyCompletions + 1,
        weeklyStreak: newWeeklyStreak,
        longestWeeklyStreak: Math.max(prev.longestWeeklyStreak, newWeeklyStreak),
      };
    });
  }, []);

  // R-02 — explicit user action: spend a rest token to mark today as
  // "rest" so the 3-of-7 streak window stays alive without requiring
  // effort logged.
  const spendRestToken = useCallback(() => {
    setConsistency(prev => {
      if (prev.graceDaysRemaining <= 0) return prev;
      // Mark today as completed (rest counts as completion) using the
      // sliding-window helper so the array stays valid.
      const nextWindow: DayCompletion[] = markToday(prev.last7Days, true);
      const completedCount = windowCompletions(nextWindow);
      const score = scoreFromWindow(nextWindow);
      return {
        ...prev,
        graceDaysRemaining: prev.graceDaysRemaining - 1,
        last7Days: nextWindow,
        score,
      };
    });
    pushNotification({
      id: `rest_${today()}_${Date.now()}`,
      type: 'achievement',
      title: 'Rest Token Spent',
      description: 'Today is logged as rest. Streak window intact. Recover — then return.',
      timestamp: new Date().toISOString(),
    });
  }, [pushNotification]);

  const checkStreak = useCallback(() => {
    const d = today();
    setStreakData(prev => {
      if (!prev.lastCompletedDate || prev.lastCompletedDate === d) return prev;
      const last = new Date(prev.lastCompletedDate);
      const now = new Date(d);
      const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 1) {
        return { ...prev, dailyCompletions: 0 };
      }
      return prev;
    });
  }, []);

  const updateConsistency = useCallback((completed: boolean) => {
    setConsistency(prev => {
      // Rotate the sliding window so it always reflects the last 7
      // calendar days, then mark today.
      const nextWindow: DayCompletion[] = markToday(prev.last7Days, completed);
      const completedCount = windowCompletions(nextWindow);
      const score = scoreFromWindow(nextWindow);

      // R-02 — 3-of-7 grace window: the run survives as long as ≥3 of
      // the last 7 days are active. A miss only resets the run when:
      //   1) the 3-of-7 alive threshold fails AND
      //   2) no grace tokens remain to soften the blow.
      const windowAlive = completedCount >= 3 || prev.graceDaysRemaining > 0;
      const newCurrentRun = completed
        ? prev.currentRun + 1
        : (windowAlive ? prev.currentRun : 0);

      const newGrace = completed ? prev.graceDaysRemaining : Math.max(0, prev.graceDaysRemaining - 1);
      const newRecovery = completed && prev.graceDaysRemaining === 0 && prev.currentRun === 0 && prev.completedDays > 0
        ? prev.recoveryCount + 1 : prev.recoveryCount;

      return {
        ...prev,
        score,
        totalDays: prev.totalDays + 1,
        completedDays: completed ? prev.completedDays + 1 : prev.completedDays,
        currentRun: newCurrentRun,
        longestRun: Math.max(prev.longestRun, newCurrentRun),
        recoveryCount: newRecovery,
        last7Days: nextWindow,
        graceDaysRemaining: newGrace,
      };
    });
    if (completed) {
      updateStreak();
    }
  }, [updateStreak]);

  const generateRecommendations = useCallback(async () => {
    const statEntries: [string, number][] = Object.entries(stats) as [string, number][];
    const sorted = statEntries.sort((a, b) => a[1] - b[1]);
    const lowest = sorted[0];
    const secondLowest = sorted[1];

    const recs: AgentRecommendation[] = [];
    recs.push({
      id: `rec_${Date.now()}_1`,
      agent: 'SAGE',
      priority: 'high',
      title: `${lowest[0].charAt(0).toUpperCase() + lowest[0].slice(1)} needs attention`,
      description: `Your ${lowest[0]} stat (${lowest[1]}) is your lowest. A focused protocol session could boost it by 2-3 points.`,
      actionLabel: `Train ${lowest[0]}`,
      targetStat: lowest[0],
      createdAt: new Date().toISOString(),
    });
    if (secondLowest[1] < 40) {
      recs.push({
        id: `rec_${Date.now()}_2`,
        agent: 'MANAGER',
        priority: 'medium',
        title: `Balance your ${secondLowest[0]}`,
        description: `${secondLowest[0].charAt(0).toUpperCase() + secondLowest[0].slice(1)} at ${secondLowest[1]} is below average. Consistency this week would help.`,
        actionLabel: `View protocols`,
        targetStat: secondLowest[0],
        createdAt: new Date().toISOString(),
      });
    }
    recs.push({
      id: `rec_${Date.now()}_3`,
      agent: 'CHRONOS',
      priority: 'low',
      title: consistency.score < 70 ? 'Build consistency momentum' : 'Maintain your rhythm',
      description: consistency.score < 70
        ? `Your 7-day consistency is ${consistency.score}%. Focus on 'never miss twice' to build momentum.`
        : `Your 7-day consistency is ${consistency.score}%. Keep the run going — you're building identity.`,
      actionLabel: 'View streak',
      createdAt: new Date().toISOString(),
    });

    setRecommendations(recs.slice(0, 3));
    localStorage.setItem('nexus_recommendations', JSON.stringify(recs.slice(0, 3)));
  }, [stats, consistency.score]);

  const getAgentMotivation = useCallback(async () => {
    try {
      const orch = getOrchestrator();
      const msg = await orch.generateMotivation({
        stats, profile: userProfile, quests, enhancedQuests: [],
        tasks,
      });
      return msg;
    } catch {
      return 'Keep pushing forward. Every action compounds into greatness.';
    }
  }, [stats, userProfile, quests, tasks, getOrchestrator]);

  const getQuestGeneratorStatus = useCallback(() => {
    try {
      const orch = getOrchestrator();
      return orch ? 'Online' : 'Standby';
    } catch {
      return 'Offline';
    }
  }, [getOrchestrator]);

  const generateProtocolQuests = useCallback(() => {
    const d = today();
    const ownedWithQuests = protocols.filter(p => p.quest && p.isStoreItem);
    if (ownedWithQuests.length === 0) return;

    const statEntries: [string, number][] = Object.entries(stats) as [string, number][];
    const sorted = statEntries.sort((a, b) => a[1] - b[1]);
    const lowestStat = sorted[0][0];

    const matching = ownedWithQuests.filter(p => p.stat === lowestStat);
    const picked = matching.length > 0
      ? matching[Math.floor(Math.random() * matching.length)]
      : ownedWithQuests[Math.floor(Math.random() * ownedWithQuests.length)];

    if (!picked.quest) return;

    const questKey = `${picked.id}_${d}`;
    const existingIds = new Set(quests.map(q => q.id));
    if (existingIds.has(questKey)) return;

    setQuests(prev => [...prev, {
      id: questKey,
      title: picked.quest.title,
      description: picked.quest.description,
      type: 'daily',
      category: picked.type === 'physical' ? 'fitness' : 'mental',
      difficulty: picked.quest.difficulty,
      rewardExp: picked.quest.rewardExp,
      rewardCredits: picked.quest.rewardCredits,
      statAffected: picked.quest.stat || picked.stat,
      completed: false,
      failed: false,
    }]);
  }, [protocols, stats, quests]);

  const applyPenalty = (type: PenaltyRecord['type'], reason: string, amount: number) => {
    const penalty: PenaltyRecord = {
      id: Date.now().toString(),
      type, reason, amount: Math.abs(amount), date: today()
    };
    setPenaltyRecords(prev => [...prev.slice(-49), penalty]);
    addCredits(-Math.abs(amount));
  };

  const checkAchievements = useCallback(() => {
    setAchievements(prev => {
      let changed = false;
      const updated = prev.map(a => {
        if (a.unlocked) return a;

        let progress = a.progress;
        switch (a.id) {
          case 'first_steps': progress = quests.filter(q => q.completed).length; break;
          case 'quest_hunter_10': progress = quests.filter(q => q.completed).length; break;
          case 'quest_master_50': progress = quests.filter(q => q.completed).length; break;
          case 'streak_3': progress = streakData.longestStreak; break;
          case 'streak_7': progress = streakData.longestStreak; break;
          case 'streak_30': progress = streakData.longestStreak; break;
          case 'streak_100': progress = streakData.longestStreak; break;
          case 'rank_d': progress = progression.level >= 5 ? 1 : 0; break;
          case 'rank_c': progress = progression.level >= 15 ? 1 : 0; break;
          case 'rank_b': progress = progression.level >= 30 ? 1 : 0; break;
          case 'rank_a': progress = progression.level >= 50 ? 1 : 0; break;
          case 'rank_s': progress = progression.level >= 75 ? 1 : 0; break;
          case 'bookworm': progress = protocols.filter(p => p.type === 'reading' && p.bookStatus === 'completed').length; break;
          case 'bibliophile': progress = protocols.filter(p => p.type === 'reading' && p.bookStatus === 'completed').length; break;
          case 'habit_builder': progress = habits.filter(h => h.streak >= 7).length; break;
          case 'addiction_slayer': { const ad = habits.filter(h => h.isAddiction); progress = ad.length > 0 ? Math.max(...ad.map(a => a.streak)) : 0; break; }
          case 'shadow_defeated': progress = shadowState.challengeCompleted ? 1 : 0; break;
          case 'raid_winner': progress = raidBoss?.defeated ? 1 : 0; break;
          case 'ascension_1': progress = ascensionData.ascensionCount; break;
          case 'level_10': progress = progression.level >= 10 ? 1 : 0; break;
          case 'level_25': progress = progression.level >= 25 ? 1 : 0; break;
          case 'level_50': progress = progression.level >= 50 ? 1 : 0; break;
          case 'stats_100': progress = Object.values(stats).reduce((a: number, b: number) => a + b, 0); break;
          case 'first_protocol': progress = protocols.length; break;
          case 'ai_protocol': progress = protocols.filter(p => p.aiGenerated).length; break;
          case 'perfect_week': progress = streakData.longestWeeklyStreak >= 7 ? 1 : 0; break;
        }

        if (progress >= a.requirement && !a.unlocked) {
          changed = true;
          addCredits(a.rewardCredits);
          addExp(a.rewardExp);
          pushNotification({
            id: `ach_${a.id}_${now()}`,
            type: 'achievement',
            title: a.title,
            description: a.description,
            reward: { credits: a.rewardCredits, exp: a.rewardExp },
            timestamp: now(),
          });
          publishEvent('achievement.unlocked', {
            achievementId: a.id,
            category: a.category,
          });
          return { ...a, progress: a.requirement, unlocked: true, unlockedAt: now() };
        }
        return { ...a, progress: Math.min(progress, a.requirement) };
      });
      return changed ? updated : prev;
    });
  }, [quests, streakData, progression, protocols, habits, shadowState, raidBoss, ascensionData, stats]);

  const completeQuest = async (id: string) => {
    const statByCategory: Record<string, StatType> = {
      fitness: 'strength', mental: 'intelligence', emotional: 'willpower', habit: 'willpower', social: 'social',
    };
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;
    const targetStat = statByCategory[quest.category] || 'intelligence';
    const gainMultiplier = ascensionData.multiplier;
    const powerUpMultiplier = activePowerUps.filter(p => new Date(p.expiresAt) > new Date()).reduce((m, p) => m * p.multiplier, 1);
    const totalMultiplier = gainMultiplier * powerUpMultiplier;

    setStats(s => ({
      ...s,
      [targetStat]: Math.min(100, Math.max(0, s[targetStat] + Math.round(1 * totalMultiplier))),
    }));
    setLastStatUpdates(prev => ({ ...prev, [targetStat]: now() }));

    // Update quest state (pure state transformation only)
    setQuests(prev => prev.map(q => {
      if (q.id !== id || q.completed) return q;
      return { ...q, completed: true, completedAt: now() };
    }));

    // Side effects moved outside updater
    addCredits(quest.rewardCredits);
    addExp(quest.rewardExp);
    updateConsistency(true);
    updateStreak();
    checkStreak();
    updateShadow(false);

    const missedCount = penaltyRecords.filter(p => p.type === 'missed' && p.date === today()).length;
    if (missedCount > 0) {
      const forgiven = Math.min(missedCount, 1);
      setPenaltyRecords(prev => {
        const toRemove = prev.filter(p => p.type === 'missed' && p.date === today()).slice(0, forgiven);
        return prev.filter(p => !toRemove.includes(p));
      });
      addCredits(NC_MISS_PENALTY_BASE * forgiven);
    }

    publishEvent('quest.completed', {
      questId: id,
      stat: targetStat,
      difficulty: quest.difficulty,
    });
    publishEvent('exp.gained', { amount: quest.rewardExp, stat: targetStat });
    publishEvent('stat.increased', { stat: targetStat, delta: 1, newValue: stats[targetStat] + 1 });

    // v1.4.0 — conditional Motivator ping on quest complete (Phase 12)
    // Only fire for significant quests to avoid noise
    if (quest.rewardExp >= 50 || quest.difficulty >= 40) {
      const orch = getOrchestrator();
      setTimeout(() => {
        orch.generateMotivation({
          stats,
          profile: userProfile,
          recentAchievements: [],
        }, `quest_completed:${quest.title || 'unknown'}`).then(msg => {
          pushNotification({
            id: `motivate_${Date.now()}`,
            type: 'level_up',
            title: 'Manager · Quest Complete',
            description: msg,
            timestamp: now(),
          });
        }).catch(() => {});
      }, 1200);
    }
  };

  const failQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed || quest.failed) return;

    // Update quest state (pure state transformation only)
    setQuests(prev => prev.map(q => {
      if (q.id !== id || q.completed || q.failed) return q;
      return { ...q, failed: true };
    }));

    // Side effects moved outside updater
    applyPenalty('failed', `Failed quest: ${quest.title}`, Math.floor(quest.rewardCredits * 0.5));
    updateShadow(true);
  };

  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    const gainMultiplier = ascensionData.multiplier;
    const powerUpMultiplier = activePowerUps.filter(p => new Date(p.expiresAt) > new Date()).reduce((m, p) => m * p.multiplier, 1);
    const totalMultiplier = gainMultiplier * powerUpMultiplier;

    setStats(s => ({
      ...s,
      willpower: Math.min(100, Math.max(0, s.willpower + Math.round(1 * totalMultiplier))),
    }));
    setLastStatUpdates(prev => ({ ...prev, willpower: now() }));

    // Update task state (pure state transformation only)
    setTasks(prev => prev.map(t => {
      if (t.id !== id || t.completed) return t;
      return { ...t, completed: true };
    }));

    // Side effects moved outside updater
    addCredits(task.rewardCredits);
    addExp(task.rewardExp);
    updateConsistency(true);
    checkStreak();
    updateShadow(false);

    publishEvent('task.completed', {
      taskId: id,
      stat: 'willpower',
      difficulty: task.difficulty,
    });
    publishEvent('exp.gained', { amount: task.rewardExp, stat: 'willpower' });
  };

  const failTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    // Side effects moved outside updater
    applyPenalty('missed', `Missed task: ${task.title}`, NC_MISS_PENALTY_BASE);
    updateShadow(true);
    updateConsistency(false);
  };

  const toggleAppPermission = async (appName: string) => {
    setAppPermissions(prev => ({ ...prev, [appName]: !prev[appName] }));
  };

  const addCustomSkillSet = (set: CustomSkillSet) => {
    setCustomSkillSets(prev => [...prev, set]);
  };

  const removeCustomSkillSet = (id: string) => {
    setCustomSkillSets(prev => prev.filter(s => s.id !== id));
  };

  const updateCustomSkillValue = (setId: string, skillName: string, value: number) => {
    setCustomSkillSets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        skills: s.skills.map(sk => sk.name === skillName ? { ...sk, value: Math.min(100, Math.max(0, value)) } : sk)
      };
    }));
  };

  const updateStat = async (stat: StatType, value: number) => {
    const gainMultiplier = ascensionData.multiplier;
    const powerUpMultiplier = activePowerUps.filter(p => new Date(p.expiresAt) > new Date()).reduce((m, p) => m * p.multiplier, 1);
    const totalMultiplier = gainMultiplier * powerUpMultiplier;
    const adjustedValue = Math.round(value * totalMultiplier);
    setStats(prev => {
      const newStats = { ...prev, [stat]: Math.min(100, Math.max(0, prev[stat] + adjustedValue)) };
      return newStats;
    });
    setLastStatUpdates(prev => ({ ...prev, [stat]: new Date().toISOString() }));
    updateConsistency(true);
  };

  const updateShadow = useCallback((increased: boolean) => {
    setShadowState(prev => {
      const shadowGrowth = increased ? 2 : -1;
      const newShadow = {
        strength: Math.min(100, Math.max(0, prev.strength + (increased ? 1 : -1))),
        intelligence: Math.min(100, Math.max(0, prev.intelligence + (increased ? 1 : -1))),
        agility: Math.min(100, Math.max(0, prev.agility + (increased ? 1 : -1))),
        vitality: Math.min(100, Math.max(0, prev.vitality + (increased ? 1 : -1))),
        willpower: Math.min(100, Math.max(0, prev.willpower + (increased ? 1 : -1))),
        social: Math.min(100, Math.max(0, prev.social + (increased ? 1 : -1))),
        lastUpdated: now(),
        isDominant: false,
        challengeIssued: prev.challengeIssued,
        challengeCompleted: prev.challengeCompleted,
      };

      const userAvg = (Object.values(stats) as number[]).reduce((a: number, b: number) => a + b, 0) / 6;
      const shadowAvg = Object.values(newShadow).filter((v): v is number => typeof v === 'number');
      const sAvg = shadowAvg.slice(0, 6).reduce((a: number, b: number) => a + b, 0) / 6;

      newShadow.isDominant = sAvg > userAvg;
      return newShadow;
    });
  }, [stats]);

  const addHabit = (habit: Partial<Habit>) => {
    const id = Date.now().toString();
    const microQuests = (habit.microQuests || []).map(q => ({
      ...q,
      habitId: id
    }));
    const newHabit: Habit = {
      id,
      title: habit.title || 'New Habit',
      description: habit.description || '',
      type: habit.type || 'build',
      category: habit.category || 'mental',
      streak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      microQuests,
      createdAt: now(),
      isAddiction: habit.isAddiction || false,
      weeklyTarget: habit.weeklyTarget || 5,
    };
    setHabits(prev => [...prev, newHabit]);
    publishEvent('habit.created', {
      habitId: newHabit.id,
      title: newHabit.title,
      isAddiction: newHabit.isAddiction,
    });
    // v1.4.0 — strategic quest auto-generation
    const ctx = { stats, profile: userProfile, quests, enhancedQuests: [], tasks, level: progression.level, exp: progression.exp, expToNextLevel: progression.expToNextLevel };
    strategicOnHabitCreated(newHabit, ctx).then(autoQuests => {
      if (autoQuests.length > 0) {
        setQuests(prev => [...prev, ...autoQuests]);
      }
    }).catch(err => console.warn('[addHabit] strategic quest generation failed:', err));
  };

  const completeMicroQuest = (habitId: string, questId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const updatedQuests = h.microQuests.map(q =>
        q.id === questId ? { ...q, completed: true } : q
      );
      const allDone = updatedQuests.every(q => q.completed);
      const d = today();
      const newStreak = allDone
        ? (h.lastCompletedDate === d ? h.streak : h.streak + 1)
        : h.streak;

      if (allDone && h.lastCompletedDate !== d) {
        addCredits(15 + h.microQuests.filter(q => q.completed).length * 5);
        addExp(20);
        updateStreak();
        updateShadow(false);
      }

      return {
        ...h,
        microQuests: updatedQuests,
        streak: newStreak,
        longestStreak: Math.max(h.longestStreak, newStreak),
        lastCompletedDate: allDone ? d : h.lastCompletedDate,
      };
    }));
  };

  const recordRelapse = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      applyPenalty('relapse', `Relapse: ${h.title}`, 50);
      addDebuff({
        id: Date.now().toString(),
        name: 'Relapse Debuff',
        description: `Failed to maintain ${h.title}. Willpower reduced.`,
        statPenalties: { willpower: -5 },
        duration: 24,
        active: true,
        appliedAt: now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      updateShadow(true);
      return {
        ...h,
        streak: 0,
        relapseDates: [...(h.relapseDates || []), today()],
        relapses: (h.relapses || 0) + 1,
        lastCompletedDate: null,
      };
    }));
  };

  const removeHabit = (id: string) => {
    const target = habits.find(h => h.id === id);
    setHabits(prev => prev.filter(h => h.id !== id));
    if (target) {
      publishEvent('habit.destroyed', {
        habitId: id,
        title: target.title,
      });
      // v1.4.0 — strategic quest auto-generation (replacement rituals)
      if (target.isAddiction) {
        const ctx = { stats, profile: userProfile, quests, enhancedQuests: [], tasks, level: progression.level, exp: progression.exp, expToNextLevel: progression.expToNextLevel };
        strategicOnHabitDestroyed(target, ctx).then(autoQuests => {
          if (autoQuests.length > 0) {
            setQuests(prev => [...prev, ...autoQuests]);
          }
        }).catch(err => console.warn('[removeHabit] strategic quest generation failed:', err));
      }
    }
  };

  const activatePowerUp = (item: StoreItem) => {
    if (item.duration === 0) return;
    const powerUp: ActivePowerUp = {
      id: Date.now().toString(),
      storeItemId: item.id,
      name: item.name,
      effect: item.powerUpEffect || '',
      multiplier: item.powerUpMultiplier || 1,
      activatedAt: now(),
      expiresAt: new Date(Date.now() + (item.duration || 24) * 60 * 60 * 1000).toISOString(),
    };
    setActivePowerUps(prev => [...prev, powerUp]);
  };

  const checkPowerUps = useCallback(() => {
    setActivePowerUps(prev => prev.filter(p => new Date(p.expiresAt) > new Date()));
  }, []);

  const addDebuff = (debuff: Debuff) => {
    setDebuffs(prev => [...prev, debuff]);
  };

  const checkDebuffs = useCallback(() => {
    setDebuffs(prev => prev.filter(d => {
      if (new Date(d.expiresAt) > new Date()) return true;
      return false;
    }));
  }, []);

  const generateInitialRaidBoss = (): RaidBoss => {
    const bosses = [
      { name: 'The Lethargy Lord', desc: 'A manifestation of procrastination and inertia.', hp: 5000 },
      { name: 'The Distortion Beast', desc: 'Feeds on distraction and broken focus.', hp: 7500 },
      { name: 'The Chaos Wyrm', desc: 'Thrives on inconsistency. Streaks are your weapon.', hp: 10000 },
      { name: 'The Void Colossus', desc: 'Born from abandoned goals.', hp: 15000 },
    ];
    const boss = bosses[Math.floor(Math.random() * bosses.length)];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return {
      id: `raid_${Date.now()}`,
      name: boss.name,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      maxHp: boss.hp,
      currentHp: boss.hp,
      defeated: false,
      rewardCredits: 500,
      rewardExp: 300,
      bossDescription: boss.desc,
      participants: 1,
    };
  };

  const generateNewRaidBoss = () => {
    setRaidBoss(generateInitialRaidBoss());
  };

  const damageRaidBoss = (damage: number) => {
    setRaidBoss(prev => {
      if (!prev || prev.defeated) return prev;
      const newHp = Math.max(0, prev.currentHp - damage);
      if (newHp <= 0) {
        addCredits(prev.rewardCredits);
        addExp(prev.rewardExp);
        return { ...prev, currentHp: 0, defeated: true, defeatedAt: now() };
      }
      return { ...prev, currentHp: newHp };
    });
  };

  const completeRaidBoss = () => {
    damageRaidBoss(999999);
  };

  const performAscension = () => {
    const allStatsMax = (Object.values(stats) as number[]).every(s => s >= 100);
    if (!allStatsMax) return;

    const newAscensionCount = ascensionData.ascensionCount + 1;

    setAscensionData(prev => ({
      ascensionCount: newAscensionCount,
      multiplier: parseFloat((prev.multiplier + 0.1).toFixed(2)),
      ascendedAt: [...prev.ascendedAt, new Date().toISOString()],
    }));

    const nowStr = new Date().toISOString();
    setStats({ strength: 10, intelligence: 10, agility: 10, vitality: 10, willpower: 10, social: 10 });
    setLastStatUpdates({ strength: nowStr, intelligence: nowStr, agility: nowStr, vitality: nowStr, willpower: nowStr, social: nowStr });
    addCredits(500 * newAscensionCount);
    addExp(1000);

    pushNotification({
      id: `asc_${newAscensionCount}_${now()}`,
      type: 'ascension_ready',
      title: `Ascension ${newAscensionCount} Complete`,
      description: `Multiplier increased to ${(ascensionData.multiplier + 0.1).toFixed(2)}x. Stats reset.`,
      reward: { credits: 500 * newAscensionCount, exp: 1000 },
      timestamp: now(),
    });
  };

  const readChapter = (id: number) => {
    setNarrativeChapters(prev => prev.map(c =>
      c.id === id ? { ...c, read: true } : c
    ));
    const chapter = narrativeChapters.find(c => c.id === id);
    if (chapter && !chapter.read) {
      addCredits(chapter.rewardCredits);
      addExp(chapter.rewardExp);
    }
  };

  const checkRifts = useCallback(() => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    setRiftSchedules(prev => prev.map(r => {
      let active = false;
      if (r.unlockHourStart <= r.unlockHourEnd) {
        active = hour >= r.unlockHourStart && hour < r.unlockHourEnd;
      } else {
        active = hour >= r.unlockHourStart || hour < r.unlockHourEnd;
      }
      active = active && r.daysOfWeek.includes(day);
      return { ...r, active };
    }));
  }, []);

  const generateDailyTasks = useCallback(() => {
    const d = today();
    setTasks(prev => {
      if (prev.some(t => t.date === d && !t.completed)) return prev;

      const bodyProtocols = protocols.filter(p => p.type === 'physical' || p.type === 'agility');
      const mindProtocols = protocols.filter(p => p.type === 'mental' || p.type === 'reading');
      const otherProtocols = protocols.filter(p => !bodyProtocols.includes(p) && !mindProtocols.includes(p));

      const pickRandom = (arr: Protocol[]): Protocol | null => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

      const body = pickRandom(bodyProtocols);
      const mind = pickRandom(mindProtocols);
      const other = pickRandom(otherProtocols);

      const newTasks: Task[] = [];

      if (body) {
        newTasks.push({
          id: `t_${d}_1`, title: `Log: ${body.title}`, description: `Show up for ${body.title}. The mirror is watching.`, category: 'fitness', difficulty: body.difficulty || 1, points: (body.gain || 2) * 5, rewardCredits: 10 + (body.difficulty || 1) * 3, rewardExp: 15 + (body.difficulty || 1) * 3, completed: false, date: d,
        });
      } else {
        newTasks.push({
          id: `t_${d}_1`, title: 'Log any body protocol', description: 'Show up for one body session today.', category: 'fitness', difficulty: 1, points: 10, rewardCredits: 10, rewardExp: 15, completed: false, date: d,
        });
      }

      if (mind) {
        newTasks.push({
          id: `t_${d}_2`, title: `Log: ${mind.title}`, description: `Show up for ${mind.title}. The mirror is watching.`, category: 'mental', difficulty: mind.difficulty || 1, points: (mind.gain || 2) * 5, rewardCredits: 10 + (mind.difficulty || 1) * 3, rewardExp: 15 + (mind.difficulty || 1) * 3, completed: false, date: d,
        });
      } else {
        newTasks.push({
          id: `t_${d}_2`, title: 'Read or study for 20 minutes', description: 'Expand your knowledge base. The mirror is watching.', category: 'mental', difficulty: 1, points: 10, rewardCredits: 10, rewardExp: 15, completed: false, date: d,
        });
      }

      newTasks.push({
        id: `t_${d}_3`, title: other ? `Complete ${other.title}` : 'Complete one habit micro-quest', description: other ? `Execute your ${other.title} protocol.` : 'Build consistency in your daily habits.', category: 'habit', difficulty: other?.difficulty || 1, points: other ? (other.gain || 2) * 5 : 10, rewardCredits: other ? 10 + (other.difficulty || 1) * 3 : 10, rewardExp: other ? 15 + (other.difficulty || 1) * 3 : 15, completed: false, date: d,
      });

      return [...prev, ...newTasks];
    });
  }, [protocols]);

  const purchaseStoreItem = (item: StoreItem): boolean => {
    if (item.exclusive && !isPro) return false;
    if (!spendCredits(item.cost)) return false;

    if ((item.type === 'protocol' || item.type === 'book') && item.protocolData) {
      addProtocol({ ...item.protocolData, isStoreItem: true, owned: true, cost: item.cost });
    } else if (item.type === 'powerup') {
      activatePowerUp(item);
    }

    return true;
  };

  const setProStatus = (status: boolean) => { setIsPro(status); };

  const sendCommandToAgent = async (agentType: string, command: string) => {
    try {
      const data = await generateAgentResponse(
        agentType as AgentType,
        command,
        { stats, protocols, character: selectedCharacter, history: chatHistory, profile: userProfile }
      );

      const newInteraction = {
        agentType,
        command,
        response: data.response,
        reasoning: data.reasoning,
        actions: [],
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev.slice(-9), newInteraction]);

      return { response: data.response, reasoning: data.reasoning, actions: [] };
    } catch (error: any) {
      console.error("Agent communication error:", error);
      throw new Error(error.message || "Neural link unstable. Synchronization failed.");
    }
  };

  const streamCommandToAgent = async (agentType: string, command: string, onChunk: (text: string) => void) => {
    try {
      const fullResponse = await streamAgentResponse(
        agentType as AgentType,
        command,
        { stats, protocols, character: selectedCharacter, history: chatHistory, profile: userProfile },
        onChunk
      );

      if (fullResponse) {
        const newInteraction = {
          agentType,
          command,
          response: fullResponse,
          reasoning: ["Streaming response"],
          actions: [],
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev.slice(-9), newInteraction]);
      }
    } catch (error: any) {
      console.error("Streaming agent error:", error);
      throw new Error(error.message || "Neural link unstable.");
    }
  };

  const sendTrainerRequest = async (message: string) => {
    const apiKey = localStorage.getItem('NVIDIA_API_KEY');

    try {
      const data = await generateTrainerResponse(
        message,
        { stats, protocols, character: selectedCharacter, profile: userProfile, history: chatHistory },
        apiKey
      );

      const newInteraction = {
        agentType: data.agentUsed,
        command: message,
        response: data.response,
        reasoning: data.reasoning || [],
        actions: [],
        timestamp: data.timestamp
      };
      setChatHistory(prev => [...prev.slice(-9), newInteraction]);

      return {
        response: data.response,
        reasoning: data.reasoning,
        agentUsed: data.agentUsed,
        coordinatedWith: data.coordinatedWith || []
      };
    } catch (error: any) {
      console.error("Trainer request error:", error);
      throw new Error(error.message || "Trainer coordination failed.");
    }
  };

  const streamTrainerRequest = async (message: string, onChunk: (text: string) => void) => {
    const apiKey = localStorage.getItem('NVIDIA_API_KEY');

    try {
      const data = await streamTrainerResponse(
        message,
        { stats, protocols, character: selectedCharacter, profile: userProfile, history: chatHistory },
        onChunk,
        apiKey
      );

      if (data.fullResponse) {
        const newInteraction = {
          agentType: data.agentUsed,
          command: message,
          response: data.fullResponse,
          reasoning: ["Streaming trainer response"],
          actions: [],
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev.slice(-9), newInteraction]);
      }

      return {
        fullResponse: data.fullResponse,
        agentUsed: data.agentUsed,
        coordinatedWith: data.coordinatedWith || []
      };
    } catch (error: any) {
      console.error("Streaming trainer error:", error);
      throw new Error(error.message || "Trainer stream failed.");
    }
  };

  useEffect(() => {
    checkLevelUp();
    checkAchievements();
    checkPowerUps();
    checkDebuffs();
    checkRifts();
    generateDailyTasks();
    generateProtocolQuests();
  }, [progression.level, quests, stats]);

  // Shadow isDominant polling — use refs to avoid re-creating interval on every shadowState change
  const statsRef = useRef(stats);
  const shadowStateRef = useRef(shadowState);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { shadowStateRef.current = shadowState; }, [shadowState]);

  useEffect(() => {
    const shadowInterval = setInterval(() => {
      const s = shadowStateRef.current;
      const u = statsRef.current;
      const shadowAvg = [s.strength, s.intelligence, s.agility, s.vitality, s.willpower, s.social].reduce((a: number, b: number) => a + b, 0) / 6;
      const userAvg = (Object.values(u) as number[]).reduce((a: number, b: number) => a + b, 0) / 6;
      if (shadowAvg > userAvg && !s.isDominant) {
        setShadowState(prev => ({ ...prev, isDominant: true }));
      }
    }, 30000);

    return () => clearInterval(shadowInterval);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    setRiftSchedules(prev => prev.map(r => {
      let active = false;
      if (r.unlockHourStart <= r.unlockHourEnd) {
        active = hour >= r.unlockHourStart && hour < r.unlockHourEnd;
      } else {
        active = hour >= r.unlockHourStart || hour < r.unlockHourEnd;
      }
      active = active && r.daysOfWeek.includes(day);
      return { ...r, active };
    }));
  }, []);

  useEffect(() => {
    const totalStats = (Object.values(stats) as number[]).reduce((a: number, b: number) => a + b, 0);
    if (totalStats >= 600 && ascensionData.ascensionCount === 0) {
    }
  }, [stats, ascensionData]);

  const resetAllData = useCallback(() => {
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith('nexus_') ||
      k === 'stats' ||
      k === 'selectedCharacter' ||
      k === 'userProfile' ||
      k === 'appPermissions'
    );
    keys.forEach(k => localStorage.removeItem(k));
    clearEventLog();
    window.location.reload();
  }, []);

  const toggleBaselineMode = useCallback(() => {
    setDailyBaseline(prev => ({
      ...prev,
      mode: prev.mode === 'fixed' ? 'custom' : 'fixed',
    }));
  }, []);

  const toggleBaselineTask = useCallback((taskId: string) => {
    setDailyBaseline(prev => {
      const tasks = prev.mode === 'fixed' ? prev.fixedTasks : prev.customTasks;
      const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = updated.filter(t => t.completed).length;
      const today = new Date().toISOString().split('T')[0];
      return {
        ...prev,
        ...(prev.mode === 'fixed' ? { fixedTasks: updated } : { customTasks: updated }),
        lastCompletedDate: completedCount > 0 ? today : prev.lastCompletedDate,
      };
    });
  }, []);

  const addCustomBaselineTask = useCallback((task: Omit<DailyBaselineTask, 'id' | 'completed'>) => {
    setDailyBaseline(prev => ({
      ...prev,
      customTasks: [...prev.customTasks, { ...task, id: `custom_${Date.now()}`, completed: false }],
    }));
  }, []);

  const removeCustomBaselineTask = useCallback((taskId: string) => {
    setDailyBaseline(prev => ({
      ...prev,
      customTasks: prev.customTasks.filter(t => t.id !== taskId),
    }));
  }, []);

  const resetDailyBaseline = useCallback(() => {
    setDailyBaseline(prev => ({
      ...prev,
      fixedTasks: prev.fixedTasks.map(t => ({ ...t, completed: false })),
      customTasks: prev.customTasks.map(t => ({ ...t, completed: false })),
    }));
  }, []);

  return (
    <GameContext.Provider value={{
      stats, quests, tasks, appPermissions,
      hasCompletedAssessment, selectedCharacter, currentProtocolId, protocols,
      userProfile, credits, progression, streakData, achievements, penaltyRecords,
      habits, activePowerUps, debuffs, shadowState, raidBoss, ascensionData,
      narrativeChapters, riftSchedules, customSkillSets, isPro,
      notifications, canAscend, lastStatUpdates,
      consistency, recommendations, generateRecommendations,
      expHistory, theme, setTheme,
      language, setLanguage,
      eventLog, publishEvent, behaviorProfile, reminderWindows, setReminderWindows,
      completeAssessment, setCharacter, setProtocol, addProtocol, removeProtocol, updateProtocol,
      addCustomSkillSet, removeCustomSkillSet, updateCustomSkillValue,
      updateUserProfile, addQuest, completeQuest, failQuest, completeTask, failTask,
      toggleAppPermission, updateStat, addCredits, spendCredits, addExp, checkLevelUp,
      updateStreak, spendRestToken, checkStreak, applyPenalty, checkAchievements,
      addHabit, completeMicroQuest, recordRelapse, removeHabit,
      activatePowerUp, checkPowerUps, addDebuff, checkDebuffs,
      damageRaidBoss, completeRaidBoss, generateNewRaidBoss, performAscension,
      readChapter, checkRifts, generateDailyTasks, purchaseStoreItem, setProStatus,
      pushNotification, dismissNotification,
      sendCommandToAgent, streamCommandToAgent,
      sendTrainerRequest, streamTrainerRequest,
      getAgentMotivation, getQuestGeneratorStatus,
      resetAllData,
      dailyBaseline, toggleBaselineMode, toggleBaselineTask, addCustomBaselineTask, removeCustomBaselineTask, resetDailyBaseline,
      currentMode, penaltyZoneReason, enterPenaltyZone, exitPenaltyZone,
      shadowMemory, shadowMemoryDigest, shadowAnsweredCount,
      recordShadowAnswer, markShadowInterrogationComplete,
      startShadowInterrogation, setShadowInterrogationIndex, declineShadowInterrogation,
      appendShadowChat, resetShadowMemory,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
