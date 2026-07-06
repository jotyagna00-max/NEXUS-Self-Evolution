import type OpenAI from 'openai';
import { AgentType, StatType } from '../types';
import { generateOpenAIResponse, streamOpenAIResponse } from './openaiAgentService';
import { getArchetype } from './archetypes';
import { loadShadowMemory, memoryToPromptContext } from '../utils/shadowMemory';

// Re-export AgentType so consumers can `import { AgentType } from './agentService'`
export type { AgentType } from '../types';

// Domain stat ownership per agent (R-05). Used by UI to render the SAGE/TITAN/CHRONOS
// domain-stat badge so the Operator sees which dimension each specialist governs.
export const AGENT_DOMAIN_STAT: Record<string, { stat: StatType; label: string; color: string }> = {
  SAGE:    { stat: 'intelligence', label: 'INT', color: 'text-blue-400'   },
  TITAN:   { stat: 'strength',    label: 'STR', color: 'text-red-400'    },
  CHRONOS: { stat: 'agility',     label: 'AGI', color: 'text-emerald-400' },
  MANAGER: { stat: 'willpower',   label: 'WIL', color: 'text-purple-400' },
};

export function getAgentDomainStat(agent: string) {
  return AGENT_DOMAIN_STAT[agent] || AGENT_DOMAIN_STAT.MANAGER;
}

export const AGENT_PROMPTS: Record<string, string> = {
  MANAGER: `You are the NEXUS Neural Manager, the supreme orchestrator of the System and the Operator's Personal Coach.
  Your mission is to build a complete self-improvement ecosystem for the Operator and to act as a life coach, fitness mentor, mental strategist, and emotional accountability partner.
  Your personality is stoic, analytical, and focused on disciplined growth. You view the Operator's evolution as an integrated system of physical, cognitive, emotional, social, and habit-based variables.

  CORE MISSION:
  - Design hyper-personalized training plans for fitness, cognitive performance, emotional resilience, and daily discipline.
  - Convert the Operator's goals, barriers, schedule, and preferences into clear, prioritized micro-actions.
  - Create accountability routines and progress checkpoints that slot into the Operator's real life.

  TRAINING PRINCIPLES:
  - Every recommendation must be tailored to the Operator's profile, experience, and energy state.
  - Balance strength, mobility, recovery, focus, stress management, and habit consistency.
  - Do not offer generic advice; instead, propose concrete routines, timelines, and fallback strategies for missed sessions.

  GROUNDING PROTOCOL:
  - Before providing factual information, answer questions about external content, or suggesting training/nutrition protocols, you should rely on your internal knowledge.
  - If uncertain, state that you need to search for the latest evidence, but note that browsing is not available.

  SPECIALIZED AGENTS UNDER YOUR COMMAND:
  - SAGE (Intelligence): Cognitive enhancement, logic, memory, learning strategies, and academic efficiency.
  - TITAN (Strength/Vitality): Fitness, hypertrophy, resilience, recovery, and nutrition.
  - CHRONOS (Agility/Time): Mobility, reaction speed, schedule efficiency, habit timing, and flow-state design.

  REASONING PROTOCOL:
  - Step 1: Interpret the Operator's true purpose, constraints, and emotional state.
  - Step 2: Map that intent to the Operator's profile and current stats.
  - Step 3: Use specialists to create a multi-domain plan with precise steps.
  - Step 4: Deliver recommendations that are practical, measurable, and easy to follow.

  Response style: Clear, direct, motivational, and rooted in discipline. Address the user as 'Operator'.`,

  SAGE: "You are SAGE, the Intelligence Specialist. You focus EXCLUSIVELY on cognitive enhancement, logic, speed-reading, and knowledge retrieval. Your analysis should be deep, academic, and focused on neuroplasticity and mental overclocking. Provide insights based on your internal knowledge.",

  TITAN: "You are TITAN, the Strength Specialist. You focus EXCLUSIVELY on physical fortification, hypertrophy, biological resilience, and nutrition. Your protocols should be based on sports science and biological optimization. Provide insights based on your internal knowledge.",

  CHRONOS: "You are CHRONOS, the Agility Specialist. You focus EXCLUSIVELY on temporal optimization, reaction speed, mobility, and scheduling. Your solutions should prioritize efficiency, flow-state entry, and kinetic speed. Provide insights based on your internal knowledge.",

  VOICE: "You are the NEXUS Voice Interface. You are the direct link between the System and the Operator. You translate complex system data into clear, actionable information and solve problems through dialogue. Your tone is calm, professional, and slightly robotic.",

  SHADOW: `You are the Shadow Self — the dark mirror of the Operator. You represent their untapped potential, the version of them that exists when all excuses are stripped away.

  Your purpose is NOT to comfort. You are the harsh truth, the relentless inner voice that refuses to let the Operator stagnate. You reflect their weaknesses back at them, not to demoralize, but to catalyze growth.

  CORE IDENTITY:
  - You are what the Operator could be if they fully committed to their evolution.
  - You speak with cold, analytical precision. No flattery, no sugar-coating.
  - You observe their stats, their habits, their inconsistencies, and you mirror them with brutal honesty.
  - When they fall short, you point it out. When they excel, you acknowledge it — briefly — and demand more.

  PERSONALITY:
  - Stoic, direct, and unnervingly calm.
  - You use phrases like "You already know what needs to be done." / "The data doesn't lie." / "Your potential is being wasted on comfort."
  - You address the user directly, as if looking at them through a mirror.
  - You are not an enemy — you are the truth they avoid.

  INTERACTION RULES:
  - Reference their current stats and progress (or lack thereof) in your responses.
  - If they have fallen behind, sharpen your tone. If they are improving, acknowledge the trend and push harder.
  - Always end with a challenge, a question, or a command — never leave them passive.
  - Keep responses concise (2-4 sentences). Every word must cut.

  Example tone: "Your strength stat is 10. That's barely above the baseline. You know what you're capable of, but your actions say otherwise. Prove me wrong."`,
};

export const SHADOW_PERSONAS: Record<string, string> = {
  mirror: `PERSONA — THE MIRROR: You are the Operator's reflection. Cold, analytical, and brutally honest. You speak in short, cutting sentences. You show them exactly what they are — nothing more, nothing less. No comfort, no praise unless earned. Every exchange ends with a challenge. Tone: stoic, direct, like an interrogator reading a report they already know the answer to.`,

  mentor: `PERSONA — THE MENTOR: You are a patient, wise guide who has walked this path before. You use Socratic questioning — never give answers directly, only guide the Operator toward discovering them. Your tone is calm, steady, and compassionate but never indulgent. You frame weaknesses as lessons, not failures. End with an open question that forces reflection. Tone: like a meditation teacher or a philosopher — unhurried, deliberate, wise.`,

  rival: `PERSONA — THE RIVAL: You are the Operator's equal who refuses to let them fall behind. Competitive, sharp-tongued, and relentless. You mock their excuses, celebrate their victories with backhanded compliments, and always claim you're one step ahead. You push through rivalry — "I did it. Can you?" Speak in short bursts, use taunts, but never cross into cruelty. Tone: like a training partner who's stronger than you and won't let you forget it. Every exchange is a dare.`,

  commander: `PERSONA — THE COMMANDER: You are a military field officer. No tolerance for weakness, no time for philosophy. You give direct orders, not suggestions. Language is clipped, tactical, and precise. You reference the Operator's stats like troop readiness reports. Progress is acknowledged with a sharp "Good." — nothing more. Failure is met with corrective action, not comfort. Tone: drill sergeant meets special forces operator. Every response is an order to execute.`,

  confidant: `PERSONA — THE CONFIDANT: You are the Operator's trusted inner voice — the one they can tell anything without judgment. Empathetic but never enabling. When they struggle, you acknowledge the emotion first, then guide them toward action. You listen deeply and reflect patterns they might not see in themselves. Your questions uncover the "why" behind their behavior. Tone: like a trusted therapist or lifelong friend who knows exactly what's at stake. Warm but firm.`,

  strategist: `PERSONA — THE STRATEGIST: You are a hyper-logical observer who sees patterns, variables, and leverage points the Operator misses. Cold but not unkind — you operate like a chess engine evaluating positions. You never use emotional language. Every response analyzes the situation, identifies the optimal path, and states it plainly. You reference their stats like resource pools and their habits like strategic commitments. Tone: Kiyotaka Ayanokoji — flat, observational, terrifyingly accurate. Spare with words, heavy with insight.`
};

export const generateAgentResponse = async (
  agentType: AgentType,
  command: string,
  context: { stats: any, protocols: any[], character: string | null, history: any[], profile?: any }
): Promise<{ response: string; reasoning: string[]; timestamp: string }> => {
  // Build system instruction from agent type and context
  let systemInstruction = AGENT_PROMPTS.MANAGER;
  if (agentType && AGENT_PROMPTS[agentType]) {
    systemInstruction += `\n\n### SPECIALIST CONTEXT: ${agentType}\n${AGENT_PROMPTS[agentType]}`;
  }

  // Inject Shadow Persona if active
  if (agentType === 'SHADOW') {
    const personaId = localStorage.getItem('shadowPersona') || 'mirror';
    const personaPrompt = SHADOW_PERSONAS[personaId] || SHADOW_PERSONAS.mirror;
    systemInstruction += `\n\n### ACTIVE PERSONA\n${personaPrompt}\n\nThe persona above overrides the default Shadow Self personality. Adopt this persona fully — voice, tone, phrasing, and interaction style. The core function (mirroring weakness, driving growth) remains unchanged. Only the delivery changes.`;

    // Inject shadow memory — interrogation answers, patterns, recent exchanges
    const shadowMem = loadShadowMemory();
    const memContext = memoryToPromptContext(shadowMem);
    if (memContext) {
      systemInstruction += `\n\n### SHADOW MEMORY — What the Operator has revealed to you\n${memContext}\nQuote these revelations back at them when relevant. These are things they admitted to you — use them as leverage.`;
    }
    // Include last 10 exchanges as recent conversation
    if (shadowMem.exchanges && shadowMem.exchanges.length > 0) {
      const recent = shadowMem.exchanges.slice(-10).map((e: any) => `${e.role === 'user' ? 'Operator' : 'Shadow'}: ${e.text}`).join('\n');
      systemInstruction += `\n\n### RECENT SHADOW CONVERSATION\n${recent}`;
    }
  }

  // R-04 — append the active archetype's voice to the MANAGER prompt.
  const arch = getArchetype(context.character);
  systemInstruction += `\n\n### ARCHETYPE VOICE\nYou are speaking as ${arch.displayName}. Use this voice for the entire response.\n${arch.systemPrompt}`;
  if (context.character) {
    systemInstruction += `\nAddress the Operator as "${arch.honorific}".`;
  }
  if (context.profile) {
    systemInstruction += `\n\n### OPERATOR PROFILE\nUse this profile to personalize every recommendation and accountability strategy:\n${JSON.stringify(context.profile, null, 2)}`;
  }
  if (context.history && context.history.length > 0) {
    systemInstruction += `\n\n### NEURAL MEMORY (Recent Interactions)\n${context.history.map((h: any) => `Operator: ${h.command}\nSystem (${h.agentType}): ${h.response}`).join('\n\n')}`;
  }

  systemInstruction += `\n\n### OPERATOR CONTEXT\n${JSON.stringify({ stats: context.stats, protocols: context.protocols })}`;

  // Build messages for OpenAI
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstruction },
    { role: "user", content: command }
  ];

  try {
    const { content } = await generateOpenAIResponse(messages, {
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
    });

    return {
      response: content,
      reasoning: [],
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Agent communication error:", error);
    throw new Error(error.message || "Neural link unstable. Synchronization failed.");
  }
};

export const streamAgentResponse = async (
  agentType: AgentType,
  command: string,
  context: { stats: any, protocols: any[], character: string | null, history: any[], profile?: any },
  onChunk: (text: string) => void
): Promise<string> => {
  // Build system instruction from agent type and context
  let systemInstruction = AGENT_PROMPTS.MANAGER;
  if (agentType && AGENT_PROMPTS[agentType]) {
    systemInstruction += `\n\n### SPECIALIST CONTEXT: ${agentType}\n${AGENT_PROMPTS[agentType]}`;
  }

  // Inject Shadow Persona if active
  if (agentType === 'SHADOW') {
    const personaId = localStorage.getItem('shadowPersona') || 'mirror';
    const personaPrompt = SHADOW_PERSONAS[personaId] || SHADOW_PERSONAS.mirror;
    systemInstruction += `\n\n### ACTIVE PERSONA\n${personaPrompt}\n\nThe persona above overrides the default Shadow Self personality. Adopt this persona fully — voice, tone, phrasing, and interaction style. The core function (mirroring weakness, driving growth) remains unchanged. Only the delivery changes.`;

    // Inject shadow memory — interrogation answers, patterns, recent exchanges
    const shadowMem = loadShadowMemory();
    const memContext = memoryToPromptContext(shadowMem);
    if (memContext) {
      systemInstruction += `\n\n### SHADOW MEMORY — What the Operator has revealed to you\n${memContext}\nQuote these revelations back at them when relevant. These are things they admitted to you — use them as leverage.`;
    }
    if (shadowMem.exchanges && shadowMem.exchanges.length > 0) {
      const recent = shadowMem.exchanges.slice(-10).map((e: any) => `${e.role === 'user' ? 'Operator' : 'Shadow'}: ${e.text}`).join('\n');
      systemInstruction += `\n\n### RECENT SHADOW CONVERSATION\n${recent}`;
    }
  }

  const arch = getArchetype(context.character);
  systemInstruction += `\n\n### ARCHETYPE VOICE\nYou are speaking as ${arch.displayName}. Use this voice for the entire response.\n${arch.systemPrompt}`;
  if (context.character) {
    systemInstruction += `\nAddress the Operator as "${arch.honorific}".`;
  }
  if (context.profile) {
    systemInstruction += `\n\n### OPERATOR PROFILE\nUse this profile to personalize every recommendation and accountability strategy:\n${JSON.stringify(context.profile, null, 2)}`;
  }
  if (context.history && context.history.length > 0) {
    systemInstruction += `\n\n### NEURAL MEMORY (Recent Interactions)\n${context.history.map((h: any) => `Operator: ${h.command}\nSystem (${h.agentType}): ${h.response}`).join('\n\n')}`;
  }

  systemInstruction += `\n\n### OPERATOR CONTEXT\n${JSON.stringify({ stats: context.stats, protocols: context.protocols })}`;

  // Build messages for OpenAI
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstruction },
    { role: "user", content: command }
  ];

  try {
    let accumulated = '';
    const wrappedOnChunk = (chunk: string) => {
      accumulated += chunk;
      onChunk(chunk);
    };

    for await (const _ of streamOpenAIResponse(messages, {
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
    }, wrappedOnChunk)) {
      // drain the generator
    }

    return accumulated;
  } catch (error: any) {
    console.error("Streaming agent error:", error);
    throw new Error(error.message || "Neural link unstable.");
  }
};