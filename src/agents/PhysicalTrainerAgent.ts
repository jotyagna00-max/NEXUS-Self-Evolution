import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile } from "../types";

export interface PhysicalTrainerContext {
  stats: UserStats;
  profile: UserProfile;
  // Any other relevant state for physical training
}

export class PhysicalTrainerAgent extends AgentBase {
  constructor() {
    super("PHYSICAL_TRAINER");
  }

  /**
   * Generate a workout plan or advice based on the user's request.
   * @param userMessage - The user's message.
   * @param context - Current state (stats, profile, etc.)
   * @returns Response content and reasoning.
   */
  async generateWorkoutAdvice(
    userMessage: string,
    context: PhysicalTrainerContext
  ): Promise<{ content: string }> {
    const systemInstruction = `
You are TITAN, the Strength Specialist. You focus EXCLUSIVELY on physical fortification, hypertrophy, biological resilience, and nutrition. Your protocols should be based on sports science and biological optimization. Use the latest exercise physiology and nutrition data to inform your recommendations.

When providing advice:
1. Tailor recommendations to the Operator's current stats, profile, fitness experience, and goals.
2. Be specific: propose concrete routines, timelines, and fallback strategies.
3. Balance strength, mobility, recovery, and nutrition.
4. Address the user as 'Operator'.
5. If the request is about a specific aspect (e.g., strength training, cardio, flexibility), focus on that.
6. Consider any barriers mentioned in the profile (e.g., time constraints, injuries).
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
   * Assess the Operator's physical baseline from assessment answers.
   * @param answers - Array of { question, answer } pairs from the physical assessment phase.
   * @returns Suggested initial values for strength, agility, vitality.
   */
  async assessPhysicalBaseline(
    answers: { question: string; answer: string }[]
  ): Promise<{ strength: number; agility: number; vitality: number; reasoning: string }> {
    const systemInstruction = `
You are TITAN, the Strength and Physical Conditioning Specialist. Your role is to evaluate the Operator's baseline physical fitness based on their assessment answers and assign precise initial stat values.

Analyze the answers holistically. Consider consistency, intensity, recovery habits, and daily activity levels.

Rules:
- All stats range from 1 to 100.
- The average human baseline is 25. A fit person is 50-70. An athlete is 75-90. Elite is 90+.
- Strength: muscular power, endurance, resistance training capacity.
- Agility: speed, flexibility, mobility, coordination.
- Vitality: cardiovascular health, recovery rate, sleep quality, nutrition, energy levels.
- Be precise and honest — do not inflate values. A beginner should get 10-30.
- Return ONLY valid JSON with no markdown wrapping.

Return format:
{ "strength": <number>, "agility": <number>, "vitality": <number>, "reasoning": "<brief explanation>" }
`;

    const answersText = answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join("\n\n");

    const { content } = await this.generateResponse(
      systemInstruction,
      `OPERATOR'S PHYSICAL ASSESSMENT:\n${answersText}`,
      {},
      { temperature: 0.3, max_tokens: 512 }
    );

    const parsed = AgentBase.parseJson<{ strength: number; agility: number; vitality: number; reasoning: string }>(
      content,
      { strength: 25, agility: 25, vitality: 25, reasoning: "Fallback: default baseline applied." },
    );
    return {
      strength: Math.max(1, Math.min(100, parsed.strength ?? 25)),
      agility: Math.max(1, Math.min(100, parsed.agility ?? 25)),
      vitality: Math.max(1, Math.min(100, parsed.vitality ?? 25)),
      reasoning: parsed.reasoning || "Baseline assessed by TITAN.",
    };
  }

  /**
   * Update the Operator's physical stats based on completed activities.
   * @param activity - Description of the activity completed.
   * @param context - Current state.
   * @returns Suggested stat updates.
   */
  async suggestStatUpdates(
    activity: string,
    context: PhysicalTrainerContext
  ): Promise<{ strength?: number; vitality?: number; reasoning: string }> {
    const systemInstruction = `
You are TITAN, the Strength Specialist. Based on the activity completed by the Operator, suggest appropriate increases to their physical stats (strength and vitality). Consider the intensity and duration of the activity, the Operator's current stats, and their training experience.

Return a JSON object with optional fields for strength and vitality increases (numbers) and a reasoning string.
Example: { "strength": 2, "vitality": 1, "reasoning": "Completed a 45-minute strength training session focusing on compound lifts." }
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Activity completed: "${activity}"`,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.5, max_tokens: 256 }
    );

    const parsed = AgentBase.parseJson<{ strength?: number; vitality?: number; reasoning?: string }>(
      content,
      { strength: undefined, vitality: undefined, reasoning: "Failed to parse stat update suggestions." },
    );
    return {
      strength: parsed.strength,
      vitality: parsed.vitality,
      reasoning: parsed.reasoning || "No reasoning provided.",
    };
  }
}