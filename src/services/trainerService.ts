import { generateAgentResponse, streamAgentResponse, AgentType } from './agentService';

export type TrainingDomain = 'fitness' | 'mental' | 'emotional' | 'habit' | 'nutrition' | 'recovery' | 'schedule' | 'general';

export interface TrainerContext {
  stats: any;
  protocols: any[];
  character: string | null;
  profile: any;
  history: any[];
}

// Smart router to determine which agent(s) to engage based on user input
export const routeToAgent = (userMessage: string): { primary: AgentType; secondary?: AgentType[] } => {
  const lowerMsg = userMessage.toLowerCase();

  // Fitness & Strength queries
  if (
    lowerMsg.includes('workout') || lowerMsg.includes('gym') || lowerMsg.includes('strength') ||
    lowerMsg.includes('muscle') || lowerMsg.includes('exercise') || lowerMsg.includes('training') ||
    lowerMsg.includes('lift') || lowerMsg.includes('cardio') || lowerMsg.includes('physical')
  ) {
    return { primary: 'TITAN', secondary: ['CHRONOS'] };
  }

  // Mental & Cognitive queries
  if (
    lowerMsg.includes('focus') || lowerMsg.includes('learn') || lowerMsg.includes('study') ||
    lowerMsg.includes('memory') || lowerMsg.includes('brain') || lowerMsg.includes('intelligence') ||
    lowerMsg.includes('read') || lowerMsg.includes('cognitive') || lowerMsg.includes('mental')
  ) {
    return { primary: 'SAGE', secondary: ['CHRONOS'] };
  }

  // Time & Schedule queries
  if (
    lowerMsg.includes('schedule') || lowerMsg.includes('time') || lowerMsg.includes('routine') ||
    lowerMsg.includes('daily') || lowerMsg.includes('plan') || lowerMsg.includes('organize') ||
    lowerMsg.includes('timing') || lowerMsg.includes('flow')
  ) {
    return { primary: 'CHRONOS', secondary: ['SAGE', 'TITAN'] };
  }

  // Nutrition & Recovery
  if (
    lowerMsg.includes('nutrition') || lowerMsg.includes('diet') || lowerMsg.includes('food') ||
    lowerMsg.includes('protein') || lowerMsg.includes('recovery') || lowerMsg.includes('sleep') ||
    lowerMsg.includes('energy')
  ) {
    return { primary: 'TITAN', secondary: ['SAGE'] };
  }

  // Emotional & Motivation queries
  if (
    lowerMsg.includes('motivation') || lowerMsg.includes('emotional') || lowerMsg.includes('stress') ||
    lowerMsg.includes('confidence') || lowerMsg.includes('fear') || lowerMsg.includes('anxiety') ||
    lowerMsg.includes('willpower') || lowerMsg.includes('discipline')
  ) {
    return { primary: 'MANAGER', secondary: ['SAGE', 'TITAN', 'CHRONOS'] };
  }

  // Default to MANAGER as orchestrator
  return { primary: 'MANAGER', secondary: ['SAGE', 'TITAN', 'CHRONOS'] };
};

// Generate unified trainer response coordinating multiple agents
export const generateTrainerResponse = async (
  userMessage: string,
  context: TrainerContext,
  apiKey?: string
) => {
  const routing = routeToAgent(userMessage);

  // Build a coordinated prompt that brings specialists together
  let coordinatedCommand = `
OPERATOR REQUEST: "${userMessage}"

COORDINATION DIRECTIVE:
You are facilitating a specialized consulting session. The primary handler for this domain is the ${routing.primary} agent.
${routing.secondary && routing.secondary.length > 0 ? `Consult with ${routing.secondary.join(' and ')} as needed to create a holistic plan.` : ''}

RESPONSE FORMAT:
1. **Primary Assessment** (from ${routing.primary}): Direct analysis of the request
2. **Supporting Insights** (from secondary specialists if needed): Cross-domain perspectives
3. **Actionable Plan**: Concrete steps the Operator can implement immediately
4. **Checkpoint**: How to measure progress

Ensure all recommendations respect the Operator's profile, barriers, and current stat levels.
  `;

  try {
    const response = await generateAgentResponse(
      routing.primary,
      coordinatedCommand,
      context
    );

    return {
      response: response.response,
      reasoning: response.reasoning || [],
      agentUsed: routing.primary,
      coordinatedWith: routing.secondary || [],
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    throw new Error(error.message || 'Trainer coordination failed.');
  }
};

// Stream trainer response for real-time feedback
export const streamTrainerResponse = async (
  userMessage: string,
  context: TrainerContext,
  onChunk: (text: string) => void,
  apiKey?: string
) => {
  const routing = routeToAgent(userMessage);

  let coordinatedCommand = `
OPERATOR REQUEST: "${userMessage}"

COORDINATION DIRECTIVE:
You are facilitating a specialized consulting session. The primary handler for this domain is the ${routing.primary} agent.
${routing.secondary && routing.secondary.length > 0 ? `Consult with ${routing.secondary.join(' and ')} as needed to create a holistic plan.` : ''}

RESPONSE FORMAT:
1. **Primary Assessment**: Direct analysis of the request
2. **Supporting Insights**: Cross-domain perspectives if needed
3. **Actionable Plan**: Concrete steps the Operator can implement immediately
4. **Checkpoint**: How to measure progress

Ensure all recommendations respect the Operator's profile, barriers, and current stat levels.
  `;

  try {
    const fullResponse = await streamAgentResponse(
      routing.primary,
      coordinatedCommand,
      context,
      onChunk
    );

    return {
      fullResponse: fullResponse || '',
      agentUsed: routing.primary,
      coordinatedWith: routing.secondary || []
    };
  } catch (error: any) {
    throw new Error(error.message || 'Trainer stream failed.');
  }
};

// Get a daily coaching prompt tailored to the operator's profile and stats
export const generateDailyCoachingPrompt = async (
  context: TrainerContext
) => {
  const dailyCommand = `
Generate a brief, personalized daily coaching message (2-3 sentences) for the Operator based on:
- Current stats: ${JSON.stringify(context.stats)}
- Profile barriers: ${context.profile?.barriers?.join(', ') || 'unknown'}
- Primary goal: ${context.profile?.primaryGoal || 'general self-improvement'}
- Emotional state: ${context.profile?.emotionalState || 'neutral'}

The message should:
1. Acknowledge one stat that needs attention today
2. Suggest one micro-action aligned with their goals
3. End with a motivational hook

Keep it short, actionable, and specific to them.
  `;

  try {
    const response = await generateAgentResponse(
      'MANAGER',
      dailyCommand,
      context
    );

    return response.response;
  } catch (error: any) {
    throw new Error(error.message || 'Daily coaching prompt generation failed.');
  }
};

// Get progress analysis across multiple domains
export const analyzeMultiDomainProgress = async (
  context: TrainerContext
) => {
  const analysisCommand = `
Analyze the Operator's progress across all improvement domains:

CURRENT STATS: ${JSON.stringify(context.stats)}
COMPLETED PROTOCOLS: ${context.protocols.length || 0}

Provide a brief report covering:
1. **Fitness** (TITAN domain): Strength, Vitality status and next priorities
2. **Mental** (SAGE domain): Intelligence, focus alignment with goals
3. **Discipline** (CHRONOS domain): Agility, willpower, schedule adherence
4. **Emotional** (MANAGER domain): Overall resilience, motivation trajectory
5. **Biggest Opportunity**: One domain where the Operator can make immediate impact

Format: Clear sections with actionable recommendations, not generic praise.
  `;

  try {
    const response = await generateAgentResponse(
      'MANAGER',
      analysisCommand,
      context
    );

    return response.response;
  } catch (error: any) {
    throw new Error(error.message || 'Progress analysis failed.');
  }
};
