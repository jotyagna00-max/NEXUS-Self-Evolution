import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile } from "../types";
import type { BehaviorProfile } from "./BehaviorProfile";

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
   * v1.4.0 — Generate a short motivational ping when the operator completes a
   * quest. Personalized with the quest's stat and the operator's behavior
   * profile. Falls back to generateMotivation() if the profile is too thin.
   */
  async motivateCompletion(
    quest: { title: string; statAffected?: string; difficulty?: number; rewardExp?: number },
    context: MotivatorContext,
    profile?: BehaviorProfile,
  ): Promise<string> {
    const statNote = quest.statAffected && quest.statAffected !== 'multiple'
      ? ` Focus stat: ${quest.statAffected}.`
      : '';
    const profileNote = profile?.preferredFocusStat
      ? ` Operator's current focus: ${profile.preferredFocusStat}.`
      : '';
    const diffNote = quest.difficulty ? ` Difficulty: ${quest.difficulty}/100.` : '';

    const occasion = `quest_completed:${quest.title}${statNote}${diffNote}${profileNote}`;

    // If we have enough profile data, generate a targeted message
    if (profile && profile.completionStreakProfile) {
      return this.generateMotivation(context, occasion);
    }

    // Fallback to generic motivation
    return this.generateMotivation(context, 'quest_completed');
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