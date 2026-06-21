import { AgentBase } from './AgentBase';
import { Protocol, ProtocolType, StatType } from '../types';

interface AIGeneratedProtocol {
  title: string;
  desc: string;
  type: ProtocolType;
  stat: StatType;
  gain: number;
  difficulty: number;
  estDuration: string;
  weeklyRecommended: number;
  keywords: string[];
}

export class ProtocolGeneratorAgent extends AgentBase {
  name = 'ProtocolGenerator';
  description = 'Generates structured evolution protocols from natural language descriptions';

  async generateProtocol(userInput: string, context?: { stats?: Record<string, number>; profile?: any }): Promise<AIGeneratedProtocol> {
    const systemPrompt = `You are a protocol architect for the NEXUS self-improvement system. 
      Your job is to analyze a user's description of what they want to improve and generate a structured protocol.

      Rules:
      - type must be one of: mental, physical, agility, willpower, reading, habit
      - stat must be one of: strength, intelligence, agility, vitality, willpower, social
      - gain must be 1-5 (how much stat increase per session)
      - difficulty must be 1-5
      - estDuration is a string like "20 min/day"
      - If the user mentions reading/books/knowledge → type: reading
      - If the user mentions physical/body/workout → type: physical 
      - If the user mentions mind/focus/memory/learning → type: mental
      - If the user mentions discipline/willpower/habits → type: willpower
      - If the user mentions speed/reaction/reflexes → type: agility
      - Generate 3-5 relevant keywords

      Return ONLY valid JSON with no markdown formatting.`;

    const userPrompt = `Generate a protocol for: "${userInput}"
      ${context?.stats ? `Current stats: ${JSON.stringify(context.stats)}` : ''}
      ${context?.profile?.primaryGoal ? `Primary goal: ${context.profile.primaryGoal}` : ''}

      Return this exact JSON structure:
      { "title": "string", "desc": "string", "type": "string", "stat": "string", "gain": number, "difficulty": number, "estDuration": "string", "weeklyRecommended": number, "keywords": ["string"] }`;

    const response = await this.queryAI(systemPrompt, userPrompt);
    return this.parseProtocolResponse(response, userInput);
  }

  async generateBatchProtocols(interests: string[]): Promise<AIGeneratedProtocol[]> {
    const systemPrompt = 'You are a protocol architect. Generate multiple protocols based on the user\'s interests. Return a JSON array of protocol objects.';
    const userPrompt = `Generate protocols for these interests: ${interests.join(', ')}. 
      Return a JSON array where each object has: title, desc, type, stat, gain (1-5), difficulty (1-5), estDuration, weeklyRecommended, keywords.`;

    const response = await this.queryAI(systemPrompt, userPrompt);
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { }
    return [];
  }

  async suggestProtocolUpgrade(existingProtocol: Protocol): Promise<Partial<Protocol>> {
    const systemPrompt = 'You are a protocol optimizer. Suggest improvements to an existing protocol.';
    const userPrompt = `Optimize this protocol: ${JSON.stringify(existingProtocol)}. 
      Suggest improvements to: title, desc, gain (max +1 from current), difficulty, estDuration.
      Return JSON with only the fields that should change.`;

    const response = await this.queryAI(systemPrompt, userPrompt);
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { }
    return {};
  }

  private parseProtocolResponse(response: string, fallbackInput: string): AIGeneratedProtocol {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        title: parsed.title || fallbackInput.slice(0, 40),
        desc: parsed.desc || `A protocol designed for: ${fallbackInput}`,
        type: (['mental', 'physical', 'agility', 'willpower', 'reading', 'habit'].includes(parsed.type) ? parsed.type : 'mental') as ProtocolType,
        stat: (['strength', 'intelligence', 'agility', 'vitality', 'willpower', 'social'].includes(parsed.stat) ? parsed.stat : 'intelligence') as StatType,
        gain: Math.min(5, Math.max(1, parsed.gain || 2)),
        difficulty: Math.min(5, Math.max(1, parsed.difficulty || 2)),
        estDuration: parsed.estDuration || '20 min/day',
        weeklyRecommended: parsed.weeklyRecommended || 5,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
      };
    } catch {
      return {
        title: fallbackInput.slice(0, 40),
        desc: `A protocol designed for: ${fallbackInput}`,
        type: 'mental',
        stat: 'intelligence',
        gain: 2,
        difficulty: 2,
        estDuration: '20 min/day',
        weeklyRecommended: 5,
        keywords: [fallbackInput.split(' ').slice(0, 3).join(' ')],
      };
    }
  }

  private async queryAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const { content } = await this.generateResponse(
        systemPrompt,
        userPrompt,
        {},
        { temperature: 0.7, max_tokens: 1024 }
      );
      return content;
    } catch {
      return this.generateFallbackResponse(userPrompt);
    }
  }

  private generateFallbackResponse(_prompt: string): string {
    return JSON.stringify({
      title: 'AI Generated Protocol',
      desc: 'A personalized protocol generated from your description.',
      type: 'mental',
      stat: 'intelligence',
      gain: 2,
      difficulty: 2,
      estDuration: '20 min/day',
      weeklyRecommended: 5,
      keywords: ['self-improvement', 'discipline', 'focus'],
    });
  }
}
