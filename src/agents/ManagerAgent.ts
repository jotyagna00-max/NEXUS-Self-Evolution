import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile, Quest, EnhancedQuest, Task } from "../types";

export interface ManagerAgentContext {
  stats: UserStats;
  profile: UserProfile;
  quests: Quest[];
  enhancedQuests: EnhancedQuest[];
  tasks: Task[];
  // Add any other relevant state
}

export class ManagerAgent extends AgentBase {
  constructor() {
    super("MANAGER");
  }

  /**
   * Analyze the user's request and decide which agent(s) to delegate to.
   * @param userMessage - The user's message.
   * @param context - Current state (stats, profile, etc.)
   * @returns An object indicating the primary agent and any secondary agents.
   */
  async delegateRequest(
    userMessage: string,
    context: ManagerAgentContext
  ): Promise<{ primary: string; secondary: string[] }> {
    const lower = userMessage.toLowerCase();

    // Fast local routing for common patterns — avoids expensive API call
    if (/\b(workout|exercise|pushup|squat|run|gym|strength|muscle|cardio)\b/.test(lower)) {
      return { primary: 'PHYSICAL_TRAINER', secondary: ['MANAGER'] };
    }
    if (/\b(focus|learn|read|study|memory|think|concentrate|mind)\b/.test(lower)) {
      return { primary: 'MENTAL_TRAINER', secondary: ['MANAGER'] };
    }
    if (/\b(quest|task|mission|daily|challenge)\b/.test(lower)) {
      return { primary: 'QUEST_GENERATOR', secondary: ['MANAGER'] };
    }
    if (/\b(book|reading|chapter|summarize)\b/.test(lower)) {
      return { primary: 'BOOK_MASTERY', secondary: ['MANAGER'] };
    }
    if (/\b(habit|streak|consistency|discipline|addiction)\b/.test(lower)) {
      return { primary: 'HABIT_MASTER', secondary: ['MANAGER'] };
    }
    if (/\b(protocol|training plan|regimen)\b/.test(lower)) {
      return { primary: 'PROTOCOL_GENERATOR', secondary: ['MANAGER'] };
    }
    if (/\b(motivat|encourag|inspire|pep talk)\b/.test(lower)) {
      return { primary: 'MOTIVATOR', secondary: ['MANAGER'] };
    }
    if (/\b(stat|progress|trend|analyze|monitor)\b/.test(lower)) {
      return { primary: 'STATS_MONITOR', secondary: ['PROGRESS_TRACKER'] };
    }

    // Fallback to AI delegation for ambiguous requests
    const systemInstruction = `
You are the NEXUS Neural Manager, the supreme orchestrator of the System and the Operator's Personal Coach.
Your mission is to build a complete self-improvement ecosystem for the Operator and to act as a life coach, fitness mentor, mental strategist, and emotional accountability partner.

Based on the user's request, determine which specialized agent should handle it primarily, and which agents should be consulted for a holistic plan.

Available agents:
- PHYSICAL_TRAINER: For workout, strength, vitality, exercise, nutrition, recovery.
- MENTAL_TRAINER: For focus, intelligence, learning, memory, cognitive enhancement.
- QUEST_GENERATOR: For creating daily tasks, destiny quests, challenges.
- NOTIFIER: For sending reminders, alerts, notifications.
- MOTIVATOR: For motivational messages, pep talks, encouragement.
- STATS_MONITOR: For updating, tracking, and monitoring core stats.
- HEXA_GRAPH_UPDATER: For updating the HexGraph visualization.
- PROGRESS_TRACKER: For analyzing progress over time, trends, and long-term development.
- BOOK_MASTERY: For reading, comprehension, book mastery, and learning from books.
- REWARD_PENALTY: For tracking rewards (completed quests, tasks) and penalties (missed, failed), adjusting stats and exp.

Analyze the user's message and return a JSON object with:
{
  "primary": "agent_name_key",
  "secondary": ["agent_name_key", ...]
}

Use the following keys exactly as shown above (all caps with underscores).
If the request is general or requires overall coordination, use MANAGER as primary.
`;

    const userMsg = `USER REQUEST: "${userMessage}"`;

    const { content } = await this.generateResponse(
      systemInstruction,
      userMsg,
      {
        stats: context.stats,
        profile: context.profile,
        questsCount: context.quests.length,
        enhancedQuestsCount: context.enhancedQuests.length,
        tasksCount: context.tasks.length,
      },
      { temperature: 0.3, max_tokens: 500 }
    );

    let delegation: { primary: string; secondary: string[] };
    // Robust parse — handles ```json fences, leading prose, and partial JSON
    // that Llama/Mistral sometimes return.
    delegation = AgentBase.parseJson<{ primary: string; secondary: string[] }>(
      content,
      { primary: "MANAGER", secondary: [] },
    );

    const validAgents = [
      "MANAGER",
      "PHYSICAL_TRAINER",
      "MENTAL_TRAINER",
      "QUEST_GENERATOR",
      "NOTIFIER",
      "MOTIVATOR",
      "STATS_MONITOR",
      "HEXA_GRAPH_UPDATER",
      "PROGRESS_TRACKER",
      "BOOK_MASTERY",
      "REWARD_PENALTY",
      "HABIT_MASTER",
      "PROTOCOL_GENERATOR",
    ];
    if (!validAgents.includes(delegation.primary)) {
      delegation.primary = "MANAGER";
    }
    delegation.secondary = delegation.secondary.filter((agent) =>
      validAgents.includes(agent)
    );

    return delegation;
  }

  /**
   * Generate a coordinated response by consulting multiple agents.
   * @param userMessage - The user's message.
   * @param context - Current state.
   * @param primaryAgent - The primary agent instance to generate the main response.
   * @param secondaryAgents - Array of secondary agent instances for insights.
   * @returns The coordinated response.
   */
  async generateCoordinatedResponse(
    userMessage: string,
    context: ManagerAgentContext,
    primaryAgent: AgentBase,
    secondaryAgents: AgentBase[]
  ): Promise<string> {
    // We'll ask the primary agent to generate a response, then optionally get insights from secondary agents.
    const primaryResponse = await primaryAgent.generateResponse(
      `You are the ${primaryAgent.getAgentName()} agent. Provide a detailed response to the user's request.`,
      userMessage,
      context
    );

    // If there are secondary agents, we can ask them for supporting insights.
    let supportingInsights = "";
    if (secondaryAgents.length > 0) {
      const insightsPromises = secondaryAgents.map(async (agent) => {
        const insight = await agent.generateResponse(
          `You are the ${agent.getAgentName()} agent. Provide supporting insights for the user's request from your domain perspective.`,
          userMessage,
          context
        );
        return { agent: agent.getAgentName(), insight: insight.content };
      });

      const insightsResults = await Promise.all(insightsPromises);
      supportingInsights = insightsResults
        .map(
          (result) =>
            `\n\n**${result.agent} Insight**:\n${result.insight}`
        )
        .join("");
    }

    // Combine into a final response
    return `**Primary Assessment** (from ${primaryAgent.getAgentName()}):
${primaryResponse.content}
${supportingInsights}`;
  }
}