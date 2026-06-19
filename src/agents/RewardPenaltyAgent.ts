import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile, Quest, EnhancedQuest, Task, Achievement } from "../types";

export interface RewardPenaltyContext {
  stats: UserStats;
  profile: UserProfile;
  quests: Quest[];
  enhancedQuests: EnhancedQuest[];
  tasks: Task[];
  achievements: Achievement[];
  // maybe recent completed/failed items
  recentCompletedQuests?: EnhancedQuest[];
  recentFailedQuests?: EnhancedQuest[];
  recentCompletedTasks?: Task[];
}

export class RewardPenaltyAgent extends AgentBase {
  constructor() {
    super("REWARD_PENALTY");
  }

  /**
   * Analyze rewards and penalties based on recent activities and suggest adjustments.
   * @param context - Current state.
   * @returns Analysis with suggested stat adjustments, reward/penalty applications.
   */
  async analyzeRewardsPenalties(
    context: RewardPenaltyContext
  ): Promise<{
    content: string;
    reasoning: string | null;
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
    const systemInstruction = `
You are the REWARD_PENALTY agent. Your role is to track the Operator's rewards (completed quests, tasks, achievements) and penalties (missed tasks, failed quests, lack of consistency) and adjust stats, exp, and points accordingly.

Based on the recent activities, provide:
1. A summary of rewards earned and penalties incurred.
2. Suggested adjustments to stats (strength, intelligence, agility, vitality, willpower, social).
3. Suggested additional exp and stat points to award (for rewards) or deduct (for penalties).
4. Recommendations for future quest difficulty or rewards based on performance.

Consider the Operator's profile, goals, and current stats.
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Analyze rewards and penalties based on recent activities.`,
      {
        stats: context.stats,
        profile: context.profile,
        questsCount: context.quests.length,
        enhancedQuestsCount: context.enhancedQuests.length,
        tasksCount: context.tasks.length,
        achievementsCount: context.achievements.length,
        recentCompletedQuests: context.recentCompletedQuests?.length || 0,
        recentFailedQuests: context.recentFailedQuests?.length || 0,
        recentCompletedTasks: context.recentCompletedTasks?.length || 0,
      },
      { temperature: 0.6, max_tokens: 1500 }
    );

    // Attempt to extract JSON adjustments from the content.
    let suggestedStatUpdates: Partial<UserStats> | undefined;
    let suggestedRewardAdjustments: { expToAdd?: number; statPointsToAdd?: number } | undefined;
    let suggestedPenaltyAdjustments: { expToSubtract?: number; statPointsToSubtract?: number } | undefined;

    try {
      // Look for a JSON block in the content (assuming the model might output a JSON object with these fields)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Stat updates
        const statKeys = ["strength", "intelligence", "agility", "vitality", "willpower", "social"] as const;
        const validStatUpdates = statKeys.filter(k => parsed[k] !== undefined);
        if (validStatUpdates.length > 0) {
          suggestedStatUpdates = {} as Partial<UserStats>;
          validStatUpdates.forEach(k => {
            suggestedStatUpdates[k] = parsed[k];
          });
        }
        // Reward adjustments
        if (parsed.expToAdd !== undefined || parsed.statPointsToAdd !== undefined) {
          suggestedRewardAdjustments = {};
          if (parsed.expToAdd !== undefined) suggestedRewardAdjustments.expToAdd = parsed.expToAdd;
          if (parsed.statPointsToAdd !== undefined) suggestedRewardAdjustments.statPointsToAdd = parsed.statPointsToAdd;
        }
        // Penalty adjustments
        if (parsed.expToSubtract !== undefined || parsed.statPointsToSubtract !== undefined) {
          suggestedPenaltyAdjustments = {};
          if (parsed.expToSubtract !== undefined) suggestedPenaltyAdjustments.expToSubtract = parsed.expToSubtract;
          if (parsed.statPointsToSubtract !== undefined) suggestedPenaltyAdjustments.statPointsToSubtract = parsed.statPointsToSubtract;
        }
      }
    } catch (e) {
      // If parsing fails, we just don't have adjustments.
    }

    return {
      content,
      reasoning: null,
      suggestedStatUpdates,
      suggestedRewardAdjustments,
      suggestedPenaltyAdjustments,
    };
  }

  /**
   * Generate a notification about rewards/penalties for the Notifier agent.
   * @param context - Current state.
   * @returns Notification title and body.
   */
  async generateRewardPenaltyNotification(
    context: RewardPenaltyContext
  ): Promise<{ title: string; body: string }> {
    const systemInstruction = `
You are the REWARD_PENALTY agent. Generate a concise notification summarizing the Operator's recent rewards and penalties to keep them informed and motivated.

The notification should have a title and body, highlighting key achievements or areas needing improvement.
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Generate a reward/penalty notification for the Operator.`,
      {
        stats: context.stats,
        profile: context.profile,
        recentCompletedQuests: context.recentCompletedQuests?.length || 0,
        recentFailedQuests: context.recentFailedQuests?.length || 0,
        recentCompletedTasks: context.recentCompletedTasks?.length || 0,
      },
      { temperature: 0.7, max_tokens: 512 }
    );

    let notification: { title: string; body: string };
    try {
      notification = JSON.parse(content);
    } catch (e) {
      notification = {
        title: "Reward & Penalty Update",
        body: "Check your progress in the NEXUS dashboard for recent rewards and penalties.",
      };
    }
    return notification;
  }

  /**
   * Suggest quest adjustments based on reward/penalty analysis (to send to QuestGenerator).
   * @param context - Current state.
   * @returns Suggestions for quest difficulty, rewards, etc.
   */
  async suggestQuestAdjustments(
    context: RewardPenaltyContext
  ): Promise<{
    difficultyAdjustment?: number; // positive to increase difficulty, negative to decrease
    rewardExpAdjustment?: number; // multiplier or flat?
    rewardStatPointsAdjustment?: number;
    focusStat?: keyof UserStats; // which stat to focus on in next quests
  }> {
    const systemInstruction = `
You are the REWARD_PENALTY agent. Based on the Operator's reward and penalty history, suggest adjustments for future quests generated by the QUEST_GENERATOR agent to maintain appropriate challenge and motivation.

Consider:
- If the Operator is consistently completing quests easily, increase difficulty.
- If they are failing often, decrease difficulty or adjust rewards to encourage effort.
- Adjust rewards based on performance (e.g., bonus exp for streaks).
- Suggest which stat to focus on in upcoming quests based on lagging areas.

Return a JSON object with optional fields:
- difficultyAdjustment: number (e.g., +10 to increase difficulty by 10 points)
- rewardExpAdjustment: number (percentage or flat exp to add to base reward)
- rewardStatPointsAdjustment: number (similar for stat points)
- focusStat: one of the stats to emphasize in next quests
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Suggest quest adjustments based on reward/penalty analysis.`,
      {
        stats: context.stats,
        profile: context.profile,
        recentCompletedQuests: context.recentCompletedQuests?.length || 0,
        recentFailedQuests: context.recentFailedQuests?.length || 0,
        recentCompletedTasks: context.recentCompletedTasks?.length || 0,
      },
      { temperature: 0.6, max_tokens: 512 }
    );

    let adjustments: any;
    try {
      adjustments = JSON.parse(content);
    } catch (e) {
      adjustments = {};
    }

    // Extract and return typed suggestions
    return {
      difficultyAdjustment: adjustments.difficultyAdjustment,
      rewardExpAdjustment: adjustments.rewardExpAdjustment,
      rewardStatPointsAdjustment: adjustments.rewardStatPointsAdjustment,
      focusStat: adjustments.focusStat as keyof UserStats,
    };
  }
}