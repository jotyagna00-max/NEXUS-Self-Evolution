import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile } from "../types";

export interface MotivatorContext {
  stats: UserStats;
  profile: UserProfile;
  // Recent achievements or completed quests
  recentAchievements?: any[];
}

export class MotivatorAgent extends AgentBase {
  constructor() {
    super("MOTIVATOR");
  }

  /**
   * Generate a motivational message based on the Operator's state and context.
   * @param context - Current state.
   * @param occasion - Optional occasion (e.g., "morning", "after_workout", "quest_completed")
   * @returns Motivational message content.
   */
  async generateMotivation(
    context: MotivatorContext,
    occasion?: string
  ): Promise<string> {
    const systemInstruction = `
You are the MOTIVATOR agent. Your role is to provide uplifting, encouraging, and motivating messages to the Operator to help them stay committed to their self-improvement journey.

Generate a motivational message that:
1. Acknowledges the Operator's current efforts and progress.
2. Encourages continued action towards their goals.
3. Is personalized based on their profile, stats, and any recent achievements.
4. Is concise (1-3 sentences) but impactful.

Consider the occasion if provided: '${occasion || "general motivation"}'.
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Generate a motivational message for the Operator.`,
      {
        stats: context.stats,
        profile: context.profile,
        recentAchievements: context.recentAchievements || [],
        occasion,
      },
      { temperature: 0.8, max_tokens: 512 }
    );

    return content;
  }

  /**
   * Generate a motivational message for a specific stat that needs improvement.
   * @param stat - The stat that needs attention (e.g., "strength", "intelligence")
   * @param context - Current state.
   * @returns Motivational message focusing on that stat.
   */
  async motivateStatImprovement(
    stat: keyof UserStats,
    context: MotivatorContext
  ): Promise<string> {
    const systemInstruction = `
You are the MOTIVATOR agent. Generate a motivational message encouraging the Operator to improve their ${stat} stat.

The message should:
1. Acknowledge the current level of ${stat} (without being discouraging).
2. Explain why improving ${stat} is important for their overall goals.
3. Suggest a simple, actionable first step.
4. Be encouraging and motivating.

Current ${stat} level: ${context.stats[stat]}
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Motivate the Operator to improve their ${stat}.`,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.7, max_tokens: 512 }
    );

    return content;
  }
}