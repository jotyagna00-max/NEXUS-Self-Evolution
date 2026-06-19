import { AgentBase } from './AgentBase';

export interface HabitContext {
  habits: any[];
  stats: any;
  profile: any;
}

export class HabitMasterAgent extends AgentBase {
  constructor() {
    super('HABIT_MASTER');
  }

  async generateHabitMicroQuests(
    habitTitle: string,
    habitDescription: string,
    isAddiction: boolean,
    streak: number,
    context?: HabitContext
  ): Promise<{ title: string; description: string; difficulty: number }[]> {
    const systemInstruction = `You are the HABIT_MASTER agent. Generate 3 daily micro-quests for someone who is trying to ${
      isAddiction ? 'overcome the addiction of' : 'build the habit of'
    } "${habitTitle}". 
    Each micro-quest should be specific, actionable, and take no more than 30 minutes.
    Consider their current streak (${streak} days) - make quests harder for longer streaks.
    Return ONLY a JSON array of objects with: title (string), description (string), difficulty (1-5).`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Generate micro-quests for habit: ${habitTitle}. Description: ${habitDescription || 'N/A'}`,
      { habits: context?.habits, stats: context?.stats, profile: context?.profile },
      { temperature: 0.7, max_tokens: 1024 }
    );

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return [
      { title: `Basic ${habitTitle}`, description: `Spend 5 minutes on ${habitTitle}`, difficulty: 1 },
      { title: `Focused ${habitTitle}`, description: `Deep practice of ${habitTitle} for 15 minutes`, difficulty: 2 },
      { title: `Master ${habitTitle}`, description: `Extended ${habitTitle} session for 30 minutes`, difficulty: 3 },
    ];
  }

  async generateAddictionReplacementRituals(
    addictionName: string,
    triggers: string[]
  ): Promise<{ trigger: string; replacement: string; difficulty: number }[]> {
    const systemInstruction = `You are the HABIT_MASTER agent. For someone trying to overcome "${addictionName}", generate replacement rituals for their triggers.
    Return a JSON array of objects with: trigger (string), replacement (string, a healthier alternative action), difficulty (1-5).`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Generate replacement rituals for addiction: ${addictionName}. Triggers: ${triggers.join(', ')}`,
      {},
      { temperature: 0.8, max_tokens: 1024 }
    );

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return [
      { trigger: 'Urge to engage', replacement: `Take 5 deep breaths and drink water instead of ${addictionName}`, difficulty: 3 },
      { trigger: 'Boredom', replacement: 'Go for a 5-minute walk or do 10 pushups', difficulty: 2 },
      { trigger: 'Stress', replacement: 'Write in a journal for 3 minutes about what is causing stress', difficulty: 3 },
    ];
  }

  async analyzePattern(habitData: { title: string; streak: number; relapses?: number; microQuests: any[] }): Promise<string> {
    const systemInstruction = `You are the HABIT_MASTER agent. Analyze this habit data and provide a brief, actionable insight (2-3 sentences). Be encouraging but direct.`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Analyze this habit: ${JSON.stringify(habitData)}`,
      {},
      { temperature: 0.6, max_tokens: 256 }
    );

    return content || 'Keep building momentum. Consistency is the key to transformation.';
  }
}
