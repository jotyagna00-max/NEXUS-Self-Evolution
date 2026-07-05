import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile } from "../types";

export interface MentalTrainerContext {
  stats: UserStats;
  profile: UserProfile;
}

export class MentalTrainerAgent extends AgentBase {
  constructor() {
    super("MENTAL_TRAINER");
  }

  /**
   * Generate cognitive training advice or learning strategies.
   * @param userMessage - The user's message.
   * @param context - Current state.
   * @returns Response content and reasoning.
   */
  async generateMentalAdvice(
    userMessage: string,
    context: MentalTrainerContext
  ): Promise<{ content: string }> {
    const systemInstruction = `
You are SAGE, the Intelligence Specialist. You focus EXCLUSIVELY on cognitive enhancement, logic, speed-reading, and knowledge retrieval. Your analysis should be deep, academic, and focused on neuroplasticity and mental overclocking. Use the latest cognitive science research to inform your recommendations.

When providing advice:
1. Tailor recommendations to the Operator's current stats, profile, learning style, and goals.
2. Be specific: propose concrete exercises, timelines, and fallback strategies.
3. Address the user as 'Operator'.
4. If the request is about a specific aspect (e.g., memory, focus, learning speed), focus on that.
5. Consider any barriers mentioned in the profile (e.g., distractions, time constraints).
`;

    return this.generateResponse(
      systemInstruction,
      userMessage,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.7, max_tokens: 1024 }
    );
  }

  /**
   * Assess the Operator's cognitive baseline from assessment answers.
   * @param answers - Array of { question, answer } pairs from the cognitive assessment phase.
   * @returns Suggested initial values for intelligence, willpower, social.
   */
  async assessCognitiveBaseline(
    answers: { question: string; answer: string }[]
  ): Promise<{ intelligence: number; willpower: number; social: number; reasoning: string }> {
    const systemInstruction = `
You are SAGE, the Intelligence and Cognitive Enhancement Specialist. Your role is to evaluate the Operator's baseline cognitive and psychological profile based on their assessment answers and assign precise initial stat values.

Analyze the answers holistically. Consider focus capacity, learning habits, memory strategies, problem-solving approach, emotional regulation, and social engagement.

Rules:
- All stats range from 1 to 100.
- The average human baseline is 25. A sharp mind is 50-70. A scholar is 75-90. Genius level is 90+.
- Intelligence: raw cognitive ability, learning speed, knowledge breadth, problem-solving.
- Willpower: discipline, delayed gratification, consistency, resistance to distraction.
- Social: communication effectiveness, empathy, collaboration, emotional intelligence.
- Be precise and honest — do not inflate values. A novice should get 10-30.
- Return ONLY valid JSON with no markdown wrapping.

Return format:
{ "intelligence": <number>, "willpower": <number>, "social": <number>, "reasoning": "<brief explanation>" }
`;

    const answersText = answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join("\n\n");

    const { content } = await this.generateResponse(
      systemInstruction,
      `OPERATOR'S COGNITIVE ASSESSMENT:\n${answersText}`,
      {},
      { temperature: 0.3, max_tokens: 512 }
    );

    const parsed = AgentBase.parseJson<{ intelligence: number; willpower: number; social: number; reasoning: string }>(
      content,
      { intelligence: 25, willpower: 25, social: 25, reasoning: "Fallback: default baseline applied." },
    );
    return {
      intelligence: Math.max(1, Math.min(100, parsed.intelligence ?? 25)),
      willpower: Math.max(1, Math.min(100, parsed.willpower ?? 25)),
      social: Math.max(1, Math.min(100, parsed.social ?? 25)),
      reasoning: parsed.reasoning || "Baseline assessed by SAGE.",
    };
  }

  /**
   * Suggest mental stat updates based on cognitive activities.
   * @param activity - Description of the cognitive activity completed.
   * @param context - Current state.
   * @returns Suggested intelligence update.
   */
  async suggestIntelligenceUpdate(
    activity: string,
    context: MentalTrainerContext
  ): Promise<{ intelligence?: number; reasoning: string }> {
    const systemInstruction = `
You are SAGE, the Intelligence Specialist. Based on the cognitive activity completed by the Operator, suggest an appropriate increase to their intelligence stat. Consider the cognitive load, novelty, and duration of the activity, the Operator's current stats, and their learning style.

Return a JSON object with an optional intelligence increase (number) and a reasoning string.
Example: { "intelligence": 3, "reasoning": "Completed a 30-minute session of advanced logic puzzles and speed-reading exercises." }
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Cognitive activity completed: "${activity}"`,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.5, max_tokens: 256 }
    );

    const parsed = AgentBase.parseJson<{ intelligence?: number; reasoning?: string }>(
      content,
      { intelligence: undefined, reasoning: "Failed to parse intelligence update suggestion." },
    );
    return {
      intelligence: parsed.intelligence,
      reasoning: parsed.reasoning || "No reasoning provided.",
    };
  }
}