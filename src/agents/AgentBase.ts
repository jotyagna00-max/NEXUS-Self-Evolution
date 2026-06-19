import type OpenAI from "openai";
import { generateOpenAIResponse, streamOpenAIResponse } from "../services/openaiAgentService";

/**
 * Base class for all agents in the NEXUS agentic workflow.
 * Provides common methods for interacting with the OpenAI model.
 */
export abstract class AgentBase {
  protected agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
  }

  public getAgentName(): string {
    return this.agentName;
  }

  /**
   * Generate a response from the OpenAI model.
   * @param systemInstruction - The system instruction for the agent.
   * @param userMessage - The user's message or command.
   * @param context - Additional context (stats, profile, etc.) to include in the prompt.
   * @param options - Model options (temperature, etc.)
   * @returns The response content and reasoning.
   */
  public async generateResponse(
    systemInstruction: string,
    userMessage: string,
    context: Record<string, any> = {},
    options: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
    } = {}
  ): Promise<{ content: string }> {
    // Build the messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: userMessage },
    ];

    // If context is provided, we can add it as a system message or include in the user message.
    // For simplicity, we'll add a system message with context.
    if (Object.keys(context).length > 0) {
      messages.splice(1, 0, {
        role: "system",
        content: `CONTEXT:\n${JSON.stringify(context, null, 2)}`,
      });
    }

    return generateOpenAIResponse(messages, options);
  }

  /**
   * Stream a response from the OpenAI model.
   * @param systemInstruction - The system instruction for the agent.
   * @param userMessage - The user's message or command.
   * @param context - Additional context (stats, profile, etc.) to include in the prompt.
   * @param options - Model options.
   * @param onChunk - Callback for content chunks.
   * @param onReasoning - Callback for reasoning chunks.
   */
  protected async* streamResponse(
    systemInstruction: string,
    userMessage: string,
    context: Record<string, any> = {},
    options: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
    } = {},
    onChunk?: (content: string) => void,
  ): AsyncGenerator<string, void, unknown> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: userMessage },
    ];

    if (Object.keys(context).length > 0) {
      messages.splice(1, 0, {
        role: "system",
        content: `CONTEXT:\n${JSON.stringify(context, null, 2)}`,
      });
    }

    // We'll collect the full reasoning and content to return at the end? Or yield per chunk?
    // The user's example prints reasoning and content as they come.
    // We'll yield objects with the chunk of content and reasoning (if any) for each step.
    // However, the streamOpenAIResponse function returns a stream of chunks.
    // We'll adapt it to our needs.

    try {
      for await (const chunk of streamOpenAIResponse(messages, options, (c) => onChunk?.(c))) {
        yield chunk;
      }
    } catch (error) {
      console.error(`Error in ${this.agentName} stream:`, error);
      yield "Error generating response.";
    }
  }
}