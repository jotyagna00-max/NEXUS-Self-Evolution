import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile, Quest, EnhancedQuest } from "../types";

export interface ProgressTrackerContext {
  stats: UserStats;
  profile: UserProfile;
  // Historical data for trends
  statsHistory?: { date: string; stats: UserStats }[];
  questsHistory?: (Quest | EnhancedQuest)[];
  // Maybe level and exp progress
  level: number;
  exp: number;
  expToNextLevel: number;
}

export class ProgressTrackerAgent extends AgentBase {
  constructor() {
    super("PROGRESS_TRACKER");
  }

  /**
   * Analyze the Operator's progress over time and provide insights.
   * @param context - Current state and historical data.
   * @returns Analysis content.
   */
  async analyzeProgress(
    context: ProgressTrackerContext
  ): Promise<{ content: string; reasoning: string | null }> {
    const systemInstruction = `
You are the PROGRESS_TRACKER agent. Your role is to analyze the Operator's progress over time, looking at trends in stats, quest completion, and overall development.

Provide a report that includes:
1. **Stat Trends**: How each core stat has changed over the past week/month (if history is available).
2. **Quest Completion**: Rate of quest completion, types of quests completed, and any patterns.
3. **Level and EXP Progress**: Current level, experience points, and progress to next level.
4. **Milestones Achieved**: Any recent achievements or notable accomplishments.
5. **Areas for Improvement**: Based on trends, which areas need more focus.
6. **Recommendations**: Actionable suggestions to maintain or accelerate progress.

Use the historical data if provided; otherwise, focus on the current state and general advice.
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Analyze the Operator's progress over time.`,
      {
        stats: context.stats,
        profile: context.profile,
        statsHistory: context.statsHistory || [],
        questsHistory: context.questsHistory || [],
        level: context.level,
        exp: context.exp,
        expToNextLevel: context.expToNextLevel,
      },
      { temperature: 0.6, max_tokens: 1500 }
    );

    return {
      content,
      reasoning: null,
    };
  }

  /**
   * Predict the time to reach a certain stat goal based on current trends.
   * @param stat - The stat to predict.
   * @param targetValue - The desired value for the stat.
   * @param context - Current state and history.
   * @returns Estimated time (in days) and confidence.
   */
  async predictStatGoal(
    stat: keyof UserStats,
    targetValue: number,
    context: ProgressTrackerContext
  ): Promise<{
    estimatedDays: number | null;
    confidence: "low" | "medium" | "high";
    reasoning: string;
  }> {
    // If we don't have history, we cannot predict.
    if (!context.statsHistory || context.statsHistory.length < 2) {
      return {
        estimatedDays: null,
        confidence: "low",
        reasoning: "Insufficient historical data to make a prediction.",
      };
    }

    // We'll ask the model to analyze the trend and predict.
    const systemInstruction = `
You are the PROGRESS_TRACKER agent. Based on the historical data for the Operator's ${stat} stat, predict how many days it will take to reach a value of ${targetValue}.

Consider:
- The current value of ${stat}: ${context.stats[stat]}
- The historical trend (if any) from the provided data.
- The Operator's typical activities and consistency.

Return a JSON object with:
- estimatedDays: number (or null if cannot predict)
- confidence: "low", "medium", or "high"
- reasoning: string explaining the prediction
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Predict time to reach ${stat} = ${targetValue}.`,
      {
        stats: context.stats,
        profile: context.profile,
        statsHistory: context.statsHistory,
      },
      { temperature: 0.5, max_tokens: 512 }
    );

    const parsed = AgentBase.parseJson<{
      estimatedDays?: number | null;
      confidence?: "low" | "medium" | "high";
      reasoning?: string;
    }>(
      content,
      { estimatedDays: null, confidence: "low", reasoning: "Failed to parse prediction result." },
    );
    return {
      estimatedDays: typeof parsed.estimatedDays === 'number' ? parsed.estimatedDays : null,
      confidence: parsed.confidence || "low",
      reasoning: parsed.reasoning || "No reasoning provided.",
    };
  }
}