import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile, QuestType, QuestCategory, EnhancedQuest } from "../types";

export interface QuestGeneratorContext {
  stats: UserStats;
  profile: UserProfile;
  // Existing quests to avoid duplication?
  existingQuests: EnhancedQuest[];
}

export class QuestGeneratorAgent extends AgentBase {
  constructor() {
    super("QUEST_GENERATOR");
  }

  /**
   * Generate a new quest (daily or destiny) based on the Operator's profile and stats.
   * @param questType - The type of quest to generate (daily, weekly, main_scenario, etc.)
   * @param context - Current state.
   * @param adjustments - Optional adjustments to difficulty and rewards from reward/penalty analysis.
   * @param source - Optional provenance info — when present, the quest is
   *                 auto-spawned from a protocol/book/habit. The prompt is
   *                 biased so the resulting quest is type-specific (e.g.
   *                 hypertrophy instead of generic exercise) and the returned
   *                 quest is stamped with `sourceType` / `sourceId` /
   *                 `sourceTitle` for the Quest Board lineage chip.
   * @returns The generated quest.
   */
  async generateQuest(
    questType: QuestType,
    context: QuestGeneratorContext,
    adjustments?: {
      difficultyAdjustment?: number;
      rewardExpAdjustment?: number;
      rewardStatPointsAdjustment?: number;
      focusStat?: keyof UserStats;
    },
    source?: { id: string; type: 'protocol' | 'book' | 'habit' | 'addiction'; title: string; hint?: string }
  ): Promise<EnhancedQuest> {
    let systemInstruction = `
You are the QUEST_GENERATOR agent, responsible for creating personalized quests that align with the Operator's goals, barriers, and current stat levels. Your quests should be challenging yet achievable, designed to promote growth in specific areas.

Generate a quest with the following properties:
- id: A unique identifier (you can suggest a format, but the system will generate the actual ID)
- title: A short, engaging title for the quest
- description: A detailed description of what the quest entails
- type: The quest type (provided as input: ${questType})
- category: One of: fitness, mental, emotional, habit, social
- difficulty: A number from 1 to 100 representing the challenge level
- rewardExp: Experience points reward for completion
- rewardStatPoints: Stat points reward for completion
- statAffected: The primary stat this quest affects (strength, intelligence, agility, vitality, willpower, social) or 'multiple'
- timeLimit: Optional time limit in minutes for completion
- expiresAt: Optional expiration date (ISO string)
- completed: false (default)
- failed: false (default)

Consider the Operator's:
- Current stats: ${JSON.stringify(context.stats)}
- Profile: ${JSON.stringify(context.profile)}
- Existing quests to avoid duplication: ${context.existingQuests.length} quests already exist
`;

    if (source) {
      systemInstruction += `
CRITICAL — QUEST LINEAGE:
This quest is auto-spawned from a ${source.type} titled "${source.title}" (id: ${source.id}).
${source.hint ? `Specific guidance: ${source.hint}` : ''}
The quest MUST be specific to "${source.title}" — not a generic stand-in. If it's a "Muscle Builder" protocol, talk about hypertrophy and tempo; if it's a "Meditation" book, talk about active reading and chapter summarization; if it's a habit, talk about the trigger → replacement loop. Make the operator feel that the system understood the source.
`;
    }

    if (adjustments) {
      systemInstruction += `
Additionally, consider these adjustments based on reward/penalty analysis:
- Difficulty adjustment: ${adjustments.difficultyAdjustment ?? 0} (add to base difficulty)
- Reward EXP adjustment: ${adjustments.rewardExpAdjustment ?? 0} (add to base reward EXP)
- Reward stat points adjustment: ${adjustments.rewardStatPointsAdjustment ?? 0} (add to base reward stat points)
- Focus stat: ${adjustments.focusStat ?? "none"} (emphasize this stat in the quest if applicable)
`;
    }

    systemInstruction += `
Make the quest specific, actionable, and tied to the Operator's primary goals and barriers.
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Generate a ${questType} quest for the Operator.`,
      {
        stats: context.stats,
        profile: context.profile,
        existingQuestsCount: context.existingQuests.length,
        // Pass adjustments for the model to consider
        adjustments: adjustments || {},
      },
      { temperature: 0.8, max_tokens: 1024 }
    );

    // Parse the JSON from the response. Falls back to a generic quest if the
    // model wraps it in fences or returns prose.
    let questData: Partial<EnhancedQuest> = AgentBase.parseJson<Partial<EnhancedQuest>>(
      content,
      {
        title: "Mindful Focus Session",
        description: "Spend 15 minutes in focused work or study without distractions. Track your attention span and note any breakthroughs.",
        type: questType,
        category: "mental",
        difficulty: 30,
        rewardExp: 15,
        rewardStatPoints: 1,
        statAffected: "intelligence",
      },
    );

    // Apply adjustments if provided
    let finalDifficulty = questData.difficulty ?? 50;
    let finalRewardExp = questData.rewardExp ?? 100;
    let finalRewardStatPoints = questData.rewardStatPoints ?? 1;
    if (adjustments) {
      if (adjustments.difficultyAdjustment !== undefined) {
        finalDifficulty += adjustments.difficultyAdjustment;
        // Clamp between 1 and 100
        finalDifficulty = Math.max(1, Math.min(100, finalDifficulty));
      }
      if (adjustments.rewardExpAdjustment !== undefined) {
        finalRewardExp += adjustments.rewardExpAdjustment;
        // Ensure non-negative
        finalRewardExp = Math.max(0, finalRewardExp);
      }
      if (adjustments.rewardStatPointsAdjustment !== undefined) {
        finalRewardStatPoints += adjustments.rewardStatPointsAdjustment;
        // Ensure non-negative
        finalRewardStatPoints = Math.max(0, finalRewardStatPoints);
      }
    }

    // Ensure required fields are present
    const quest: EnhancedQuest = {
      id: `quest_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Temporary ID; system should replace
      title: questData.title || "Unnamed Quest",
      description: questData.description || "No description provided.",
      type: questData.type || questType,
      category: questData.category || "habit",
      difficulty: finalDifficulty,
      rewardExp: finalRewardExp,
      rewardCredits: Math.floor(finalRewardExp * 0.6),
      rewardStatPoints: finalRewardStatPoints,
      statAffected: questData.statAffected || "multiple",
      timeLimit: questData.timeLimit,
      expiresAt: questData.expiresAt,
      completed: false,
      failed: false,
      completedAt: undefined,
      sourceType: source?.type,
      sourceId: source?.id,
      sourceTitle: source?.title,
      lineageLabel: source ? `${source.type}: ${source.title}` : undefined,
    };

    return quest;
  }

  /**
   * Generate a set of daily quests based on the Operator's routine and goals.
   * @param context - Current state.
   * @param count - Number of daily quests to generate (default 3)
   * @returns Array of generated quests.
   */
  async generateDailyQuests(
    context: QuestGeneratorContext,
    count: number = 3
  ): Promise<EnhancedQuest[]> {
    const quests = await Promise.all(
      Array.from({ length: count }, () => this.generateQuest("daily", context))
    );
    return quests;
  }
}