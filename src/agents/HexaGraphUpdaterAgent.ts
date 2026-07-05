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
    transition?: {
      from: UserStats;
      to: UserStats;
      duration: number;
    };
  }> {
    return {
      stats: context.stats,
      transition: context.previousStats ? {
        from: context.previousStats,
        to: context.stats,
        duration: 300,
      } : undefined,
    };
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