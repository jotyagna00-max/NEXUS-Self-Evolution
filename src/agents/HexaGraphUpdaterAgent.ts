import { AgentBase } from "./AgentBase";
import { UserStats } from "../types";

export interface HexaGraphUpdaterContext {
  stats: UserStats;
  // Previous stats for animation or transition (optional)
  previousStats?: UserStats;
}

export class HexaGraphUpdaterAgent extends AgentBase {
  constructor() {
    super("HEXA_GRAPH_UPDATER");
  }

  /**
   * Generate the data needed to update the HexGraph visualization.
   * The HexGraph likely expects a specific format (e.g., values for each stat).
   * @param context - Current state.
   * @returns Data for the HexGraph.
   */
  async generateHexGraphData(
    context: HexaGraphUpdaterContext
  ): Promise<{
    stats: UserStats;
    // Optional: animation parameters or transition data
    transition?: {
      from: UserStats;
      to: UserStats;
      duration: number;
    };
  }> {
    const systemInstruction = `
You are the HEXA_GRAPH_UPDATER agent. Your role is to prepare the data for the HexGraph visualization that displays the Operator's core stats.

The HexGraph expects a set of values for the six stats: strength, intelligence, agility, vitality, willpower, social.
Each value should be a number (typically 0-100, but check the current scaling).

Based on the Operator's current stats, provide the data in the expected format.
If there has been a significant change from previous stats, you may also suggest a transition for smooth animation.

Current stats: ${JSON.stringify(context.stats)}
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Provide the HexGraph data for the Operator's current stats.`,
      {
        stats: context.stats,
        previousStats: context.previousStats,
      },
      { temperature: 0.3, max_tokens: 512 } // Low temperature for consistent data formatting
    );

    // We expect the response to be a JSON object containing the stats and possibly transition.
    let data: { stats: UserStats; transition?: { from: UserStats; to: UserStats; duration: number } };
    try {
      data = JSON.parse(content);
      // Ensure the stats object has all required fields
      const requiredStats: (keyof UserStats)[] = [
        "strength",
        "intelligence",
        "agility",
        "vitality",
        "willpower",
        "social",
      ];
      for (const stat of requiredStats) {
        if (!(stat in data.stats)) {
          // If missing, fall back to the context stats
          data.stats[stat] = context.stats[stat];
        }
      }
    } catch (e) {
      // Fallback to just returning the current stats
      data = {
        stats: context.stats,
        transition: undefined,
      };
    }

    return data;
  }

  /**
   * Calculate the difference between current and previous stats for transition purposes.
   * @param current - Current stats.
   * @param previous - Previous stats.
   * @returns The difference for each stat.
   */
  calculateStatDifference(
    current: UserStats,
    previous: UserStats
  ): Partial<UserStats> {
    const diff: Partial<UserStats> = {};
    const statsKeys = [
      "strength",
      "intelligence",
      "agility",
      "vitality",
      "willpower",
      "social",
    ] as const;

    for (const stat of statsKeys) {
      diff[stat] = current[stat] - previous[stat];
    }

    return diff;
  }
}