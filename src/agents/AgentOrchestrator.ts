import { ManagerAgent } from "./ManagerAgent";
import { PhysicalTrainerAgent } from "./PhysicalTrainerAgent";
import { MentalTrainerAgent } from "./MentalTrainerAgent";
import { QuestGeneratorAgent } from "./QuestGeneratorAgent";
import { NotifierAgent } from "./NotifierAgent";
import { MotivatorAgent } from "./MotivatorAgent";
import { StatsMonitorAgent } from "./StatsMonitorAgent";
import { HexaGraphUpdaterAgent } from "./HexaGraphUpdaterAgent";
import { ProgressTrackerAgent } from "./ProgressTrackerAgent";
import { BookMasteryAgent } from "./BookMasteryAgent";
import { RewardPenaltyAgent } from "./RewardPenaltyAgent";
import { HabitMasterAgent } from "./HabitMasterAgent";
import { ProtocolGeneratorAgent } from "./ProtocolGeneratorAgent";
import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile, Quest, EnhancedQuest } from "../types";
import { eventBus, NexusEvent, getEventLog } from "./EventBus";
import type { BehaviorProfile } from "./BehaviorProfile";

export interface OrchestratorContext {
  stats: UserStats;
  profile: UserProfile;
  quests: Quest[];
  enhancedQuests: EnhancedQuest[];
  tasks: any[]; // Assuming Task type from types.ts
  // Add any other state that agents might need
  statsHistory?: { date: string; stats: UserStats }[]; // For ProgressTracker
  statsHistoryByStat?: { [key in keyof UserStats]: number[] }; // For StatsMonitor
  questsHistory?: (Quest | EnhancedQuest)[];
  achievements?: any[];
  level?: number;
  exp?: number;
  expToNextLevel?: number;
}

export class AgentOrchestrator {
  private manager: ManagerAgent;
  private physicalTrainer: PhysicalTrainerAgent;
  private mentalTrainer: MentalTrainerAgent;
  private questGenerator: QuestGeneratorAgent;
  private notifier: NotifierAgent;
  private motivator: MotivatorAgent;
  private statsMonitor: StatsMonitorAgent;
  private hexaGraphUpdater: HexaGraphUpdaterAgent;
  private progressTracker: ProgressTrackerAgent;
  private bookMastery: BookMasteryAgent;
  private rewardPenalty: RewardPenaltyAgent;
  private habitMaster: HabitMasterAgent;
  private protocolGenerator: ProtocolGeneratorAgent;

  constructor() {
    this.manager = new ManagerAgent();
    this.physicalTrainer = new PhysicalTrainerAgent();
    this.mentalTrainer = new MentalTrainerAgent();
    this.questGenerator = new QuestGeneratorAgent();
    this.notifier = new NotifierAgent();
    this.motivator = new MotivatorAgent();
    this.statsMonitor = new StatsMonitorAgent();
    this.hexaGraphUpdater = new HexaGraphUpdaterAgent();
    this.progressTracker = new ProgressTrackerAgent();
    this.bookMastery = new BookMasteryAgent();
    this.rewardPenalty = new RewardPenaltyAgent();
    this.habitMaster = new HabitMasterAgent();
    this.protocolGenerator = new ProtocolGeneratorAgent('PROTOCOL_GENERATOR');
  }

  /**
   * Initialize all agent instances (if they need async setup, do it here).
   * Currently, all agents are ready upon construction.
   */
  async initialize(): Promise<void> {
    // Placeholder for any async initialization
    return Promise.resolve();
  }

  /**
   * Process a user message through the orchestrator.
   * This is the main chatbot interface.
   * @param userMessage - The user's input.
   * @param context - Current state.
   * @returns The coordinated response string.
   */
  async processUserMessage(
    userMessage: string,
    context: OrchestratorContext
  ): Promise<string> {
    // Step 1: Delegate to determine which agent(s) should handle the request.
    const delegation = await this.manager.delegateRequest(userMessage, {
      stats: context.stats,
      profile: context.profile,
      quests: context.quests,
      enhancedQuests: context.enhancedQuests,
      tasks: context.tasks,
    });

    // Step 2: Get the primary agent instance.
    let primaryAgent: AgentBase;
    switch (delegation.primary) {
      case "PHYSICAL_TRAINER":
        primaryAgent = this.physicalTrainer;
        break;
      case "MENTAL_TRAINER":
        primaryAgent = this.mentalTrainer;
        break;
      case "QUEST_GENERATOR":
        primaryAgent = this.questGenerator;
        break;
      case "NOTIFIER":
        primaryAgent = this.notifier;
        break;
      case "MOTIVATOR":
        primaryAgent = this.motivator;
        break;
      case "STATS_MONITOR":
        primaryAgent = this.statsMonitor;
        break;
      case "HEXA_GRAPH_UPDATER":
        primaryAgent = this.hexaGraphUpdater;
        break;
      case "PROGRESS_TRACKER":
        primaryAgent = this.progressTracker;
        break;
      case "BOOK_MASTERY":
        primaryAgent = this.bookMastery;
        break;
      case "REWARD_PENALTY":
        primaryAgent = this.rewardPenalty;
        break;
      case "HABIT_MASTER":
        primaryAgent = this.habitMaster;
        break;
      case "PROTOCOL_GENERATOR":
        primaryAgent = this.protocolGenerator;
        break;
      case "MANAGER":
      default:
        primaryAgent = this.manager;
        break;
    }

    // Step 3: Get secondary agent instances.
    const secondaryAgents: AgentBase[] = delegation.secondary.map((agentKey) => {
      switch (agentKey) {
        case "PHYSICAL_TRAINER":
          return this.physicalTrainer;
        case "MENTAL_TRAINER":
          return this.mentalTrainer;
        case "QUEST_GENERATOR":
          return this.questGenerator;
        case "NOTIFIER":
          return this.notifier;
        case "MOTIVATOR":
          return this.motivator;
        case "STATS_MONITOR":
          return this.statsMonitor;
        case "HEXA_GRAPH_UPDATER":
          return this.hexaGraphUpdater;
        case "PROGRESS_TRACKER":
          return this.progressTracker;
        case "BOOK_MASTERY":
          return this.bookMastery;
        case "REWARD_PENALTY":
          return this.rewardPenalty;
        case "HABIT_MASTER":
          return this.habitMaster;
        case "PROTOCOL_GENERATOR":
          return this.protocolGenerator;
        case "MANAGER":
          return this.manager;
        default:
          return this.manager; // fallback
      }
    });

    // Step 4: Generate a coordinated response.
    // For now, we'll use the manager's coordination method.
    // However, note that the ManagerAgent's generateCoordinatedResponse expects the primary agent to generate a response.
    // We'll call that method.
    return this.manager.generateCoordinatedResponse(
      userMessage,
      {
        stats: context.stats,
        profile: context.profile,
        quests: context.quests,
        enhancedQuests: context.enhancedQuests,
        tasks: context.tasks,
      },
      primaryAgent,
      secondaryAgents
    );
  }

  // -------------------------------------------------------------------------
  // Specific agent action methods (can be called by other parts of the app)
  // -------------------------------------------------------------------------

  /**
   * Generate a workout advice from the physical trainer.
   */
  async getWorkoutAdvice(
    userMessage: string,
    context: OrchestratorContext
  ): Promise<string> {
    const response = await this.physicalTrainer.generateWorkoutAdvice(
      userMessage,
      {
        stats: context.stats,
        profile: context.profile,
      }
    );
    return response.content;
  }

  /**
   * Generate mental training advice.
   */
  async getMentalAdvice(
    userMessage: string,
    context: OrchestratorContext
  ): Promise<string> {
    const response = await this.mentalTrainer.generateMentalAdvice(
      userMessage,
      {
        stats: context.stats,
        profile: context.profile,
      }
    );
    return response.content;
  }

  /**
   * Generate a new quest (daily, weekly, etc.).
   * Optionally incorporates reward/penalty adjustments.
   * Optionally carries provenance so the prompt biases toward the source
   * (protocol/book/habit) and the returned quest is stamped with
   * `sourceId`/`sourceType`/`sourceTitle` for Quest Board lineage.
   */
  async generateQuest(
    questType: string,
    context: OrchestratorContext,
    useAdjustments: boolean = true,
    source?: { id: string; type: 'protocol' | 'book' | 'habit' | 'addiction'; title: string; hint?: string }
  ): Promise<EnhancedQuest> {
    let adjustments: undefined | {
      difficultyAdjustment?: number;
      rewardExpAdjustment?: number;
      rewardStatPointsAdjustment?: number;
      focusStat?: keyof UserStats;
    };
    if (useAdjustments) {
      adjustments = await this.suggestQuestAdjustments(context);
    }
    return this.questGenerator.generateQuest(questType as any, {
      stats: context.stats,
      profile: context.profile,
      existingQuests: context.enhancedQuests,
    }, adjustments, source);
  }

  /**
   * Generate a notification based on a trigger.
   */
  async generateNotification(
    trigger: string,
    context: OrchestratorContext
  ): Promise<{ title: string; body: string }> {
    return this.notifier.generateNotification(trigger, {
      stats: context.stats,
      profile: context.profile,
    });
  }

  /**
   * Generate a motivational message.
   */
  async generateMotivation(
    context: OrchestratorContext,
    occasion?: string
  ): Promise<string> {
    return this.motivator.generateMotivation(
      {
        stats: context.stats,
        profile: context.profile,
        recentAchievements: [], // We could pass recent achievements from context if available
      },
      occasion
    );
  }

  /**
   * Analyze stats and get suggestions.
   */
  async analyzeStats(
    context: OrchestratorContext
  ): Promise<{
    content: string;
    suggestedUpdates?: Partial<UserStats>;
  }> {
    const result = await this.statsMonitor.analyzeStats({
      stats: context.stats,
      profile: context.profile,
      statsHistory: context.statsHistoryByStat,
    });
    return {
      content: result.content,
      suggestedUpdates: result.suggestedUpdates,
    };
  }

  /**
   * Get HexGraph update data.
   */
  async getHexGraphData(
    context: OrchestratorContext
  ): Promise<{
    stats: UserStats;
    transition?: {
      from: UserStats;
      to: UserStats;
      duration: number;
    };
  }> {
    return this.hexaGraphUpdater.generateHexGraphData({
      stats: context.stats,
      previousStats: undefined, // We could pass previous stats from context if available
    });
  }

  /**
   * Analyze progress over time.
   */
  async analyzeProgress(
    context: OrchestratorContext
  ): Promise<string> {
    const result = await this.progressTracker.analyzeProgress({
      stats: context.stats,
      profile: context.profile,
      statsHistory: context.statsHistory,
      questsHistory: context.questsHistory,
      level: context.level || 0,
      exp: context.exp || 0,
      expToNextLevel: context.expToNextLevel || 0,
    });
    return result.content;
  }

  /**
   * Get book mastery advice.
   */
  async getBookAdvice(
    userMessage: string,
    context: OrchestratorContext
  ): Promise<string> {
    const response = await this.bookMastery.generateBookAdvice(
      userMessage,
      {
        stats: context.stats,
        profile: context.profile,
      }
    );
    return response.content;
  }

  /**
   * Generate a reading quest (book mastery).
   */
  async generateReadingQuest(
    context: OrchestratorContext
  ): Promise<any> {
    return this.bookMastery.generateReadingQuest({
      stats: context.stats,
      profile: context.profile,
    });
  }

  /**
   * Analyze rewards and penalties and get suggestions.
   */
  async analyzeRewardsPenalties(
    context: OrchestratorContext
  ): Promise<{
    content: string;
    suggestedStatUpdates?: Partial<UserStats>;
    suggestedRewardAdjustments?: {
      expToAdd?: number;
      statPointsToAdd?: number;
    };
    suggestedPenaltyAdjustments?: {
      expToSubtract?: number;
      statPointsToSubtract?: number;
    };
  }> {
    const result = await this.rewardPenalty.analyzeRewardsPenalties({
      stats: context.stats,
      profile: context.profile,
      quests: context.quests,
      enhancedQuests: context.enhancedQuests,
      tasks: context.tasks,
      achievements: [], // We don't have achievements in OrchestratorContext; could add if needed
      recentCompletedQuests: [], // Could be passed from context if available
      recentFailedQuests: [],
      recentCompletedTasks: [],
    });
    return {
      content: result.content,
      suggestedStatUpdates: result.suggestedStatUpdates,
      suggestedRewardAdjustments: result.suggestedRewardAdjustments,
      suggestedPenaltyAdjustments: result.suggestedPenaltyAdjustments,
    };
  }

  /**
   * Generate a reward/penalty notification.
   */
  async generateRewardPenaltyNotification(
    context: OrchestratorContext
  ): Promise<{ title: string; body: string }> {
    return this.rewardPenalty.generateRewardPenaltyNotification({
      stats: context.stats,
      profile: context.profile,
      quests: context.quests,
      enhancedQuests: context.enhancedQuests,
      tasks: context.tasks,
      achievements: context.achievements || [],
      recentCompletedQuests: [],
      recentFailedQuests: [],
      recentCompletedTasks: [],
    });
  }

  /**
   * Suggest quest adjustments based on reward/penalty analysis (to feed into quest generation).
   */
  async suggestQuestAdjustments(
    context: OrchestratorContext
  ): Promise<{
    difficultyAdjustment?: number;
    rewardExpAdjustment?: number;
    rewardStatPointsAdjustment?: number;
    focusStat?: keyof UserStats;
  }> {
    return this.rewardPenalty.suggestQuestAdjustments({
      stats: context.stats,
      profile: context.profile,
      quests: context.quests,
      enhancedQuests: context.enhancedQuests,
      tasks: context.tasks,
      achievements: context.achievements || [],
      recentCompletedQuests: [],
      recentFailedQuests: [],
      recentCompletedTasks: [],
    });
  }

  /**
   * v1.4.0 — broadcast a typed event into the bus. The GameContext calls
   * `eventBus.publish` directly; this method is for callers who want a
   * single entrypoint (e.g. agent-driven internal events).
   */
  broadcast<E extends NexusEvent['type']>(event: E,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any): void {
    eventBus.publish(event, payload);
  }

  /** Subscribe a callback to every event in the bus. Returns an unsubscribe fn. */
  subscribeAll(handler: (e: NexusEvent) => void): () => void {
    return eventBus.subscribeAll(handler as any);
  }

  /** Read the persisted event log (used by Progress Tracker). */
  getEventLog(): Array<{ at: string; event: NexusEvent }> {
    return getEventLog();
  }

  /** Run MotivatorAgent with a Behavior Profile-aware context. */
  async motivateWithProfile(
    occasion: string,
    ctx: OrchestratorContext,
    profile?: BehaviorProfile,
  ): Promise<string> {
    return this.motivator.generateMotivation(
      {
        stats: ctx.stats,
        profile: ctx.profile,
        recentAchievements: ctx.achievements?.filter(a => a.unlocked).slice(-3) || [],
      },
      occasion + (profile?.preferredFocusStat ? ` | focus:${profile.preferredFocusStat}` : ''),
    );
  }

  /** Get a Notifier-generated push notification for a specific trigger. */
  async buildNotification(trigger: string, ctx: OrchestratorContext): Promise<{ title: string; body: string }> {
    return this.notifier.generateNotification(trigger, { stats: ctx.stats, profile: ctx.profile });
  }

  // v1.4.0 — public accessors for strategic quest service (was accessing private fields by string index)
  getHabitMaster(): any { return this.habitMaster; }
  getQuestGenerator(): any { return this.questGenerator; }
  getRewardPenalty(): any { return this.rewardPenalty; }
}