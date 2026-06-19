import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile } from "../types";

export interface StatsMonitorContext {
  stats: UserStats;
  profile: UserProfile;
  // Historical stats for trend analysis (optional)
  statsHistory?: { [key in keyof UserStats]: number[] };
}

export class StatsMonitorAgent extends AgentBase {
  constructor() {
    super("STATS_MONITOR");
  }

  /**
   * Analyze the current stats and provide insights or alerts.
   * @param context - Current state.
   * @returns Analysis content and any suggested stat adjustments.
   */
  async analyzeStats(
    context: StatsMonitorContext
  ): Promise<{
    content: string;
    reasoning: string | null;
    suggestedUpdates?: Partial<UserStats>;
  }> {
    const systemInstruction = `
You are the STATS_MONITOR agent. Your role is to monitor the Operator's core stats (strength, intelligence, agility, vitality, willpower, social) and provide insights on their progress, plateaus, or areas needing attention.

Analyze the current stats and provide:
1. A brief overview of each stat's current level and what it signifies.
2. Identification of any stats that are significantly lagging behind others or below desired thresholds.
3. Identification of stats that are showing strong progress.
4. Suggestions for which stats to focus on in the near term.
5. Optional: Suggested numerical adjustments to stats based on recent activities (if provided in context).

Consider the Operator's profile, goals, and any historical trends if available.
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Analyze the Operator's current stats.`,
      {
        stats: context.stats,
        profile: context.profile,
        statsHistory: context.statsHistory || {},
      },
      { temperature: 0.6, max_tokens: 1024 }
    );

    // We'll also try to extract suggested updates from the response if the model provides them in a structured way.
    // For simplicity, we'll assume the model might include a JSON block for suggested updates.
    // We'll attempt to parse a JSON object from the content that matches Partial<UserStats>.
    let suggestedUpdates: Partial<UserStats> | undefined;
    try {
      // Look for a JSON object in the content (assuming it's the only JSON or we take the first one)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Check if the parsed object has keys that are in UserStats
        const validKeys = Object.keys(parsed).filter((k) =>
          ["strength", "intelligence", "agility", "vitality", "willpower", "social"].includes(k)
        );
        if (validKeys.length > 0) {
          suggestedUpdates = {} as Partial<UserStats>;
          validKeys.forEach((key) => {
            suggestedUpdates[key as keyof UserStats] = parsed[key];
          });
        }
      }
    } catch (e) {
      // If parsing fails, we just don't have suggested updates.
    }

    return {
      content,
      reasoning: null, // We could extract reasoning if the model provides it, but we'll keep it simple.
      suggestedUpdates,
    };
  }

  /**
   * Check if any stat has crossed a threshold that warrants a notification.
   * @param context - Current state.
   * @param thresholds - Optional custom thresholds (default: 90 for high, 10 for low)
   * @returns Array of stat alerts.
   */
  async checkThresholds(
    context: StatsMonitorContext,
    thresholds: {
      high?: number;
      low?: number;
    } = {}
  ): Promise<{ stat: keyof UserStats; value: number; direction: "high" | "low" }[]> {
    const highThreshold = thresholds.high ?? 90;
    const lowThreshold = thresholds.low ?? 10;
    const alerts: { stat: keyof UserStats; value: number; direction: "high" | "low" }[] = [];

    const statsKeys = [
      "strength",
      "intelligence",
      "agility",
      "vitality",
      "willpower",
      "social",
    ] as const;

    for (const stat of statsKeys) {
      const value = context.stats[stat];
      if (value >= highThreshold) {
        alerts.push({ stat, value, direction: "high" });
      } else if (value <= lowThreshold) {
        alerts.push({ stat, value, direction: "low" });
      }
    }

    return alerts;
  }
}