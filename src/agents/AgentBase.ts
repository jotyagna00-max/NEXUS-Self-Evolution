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
   * Robust JSON extractor for LLM responses.
   *
   * Llama, Mistral, Gemini and most open-source models wrap JSON in
   * markdown code fences (```...```) — sometimes with leading prose,
   * trailing commentary, or even multiple JSON candidates in one response.
   * A naive `JSON.parse(content)` blows up on the first byte and silently
   * kills the routing decision in MANAGER.
   *
   * Strategy, in order:
   *   1. Trim and try parsing as-is.
   *   2. Strip a single leading ```json / ``` fence + matching closer.
   *   3. Grep for the FIRST balanced `{ ... }` or `[ ... ]` block in the
   *      string and try parsing that.
   *   4. Strip control chars and look for a fence again.
   *   5. Return `fallback` (or throw) if nothing parses cleanly.
   *
   * @example
   *   const plan = AgentBase.parseJson<Plan>(content, { steps: [] });
   */
  public static parseJson<T = unknown>(
    raw: string | null | undefined,
    fallback?: T,
  ): T {
    if (raw == null) {
      if (fallback !== undefined) return fallback;
      throw new Error("parseJson: input is null/undefined");
    }

    const text = String(raw).trim();

    // 1) Direct attempt.
    try {
      return JSON.parse(text) as T;
    } catch {
      /* fall through */
    }

    // 2) Strip a single ```json ... ``` (or ``` ... ```) fence.
    const fenced = text.match(/^```(?:json|JSON)?\s*([\s\S]*?)```\s*$/m);
    if (fenced) {
      try {
        return JSON.parse(fenced[1].trim()) as T;
      } catch {
        /* fall through */
      }
    }

    // 3) Find the first balanced object or array literal. Handles
    //    leading prose ("Here is the JSON:") and trailing extra text.
    const balanced = extractBalancedJson(text);
    if (balanced) {
      try {
        return JSON.parse(balanced) as T;
      } catch {
        /* fall through */
      }
    }

    // 4) Strip control chars and try fence pattern again as a last resort.
    const sanitized = text.replace(/[\x00-\x1F\x7F]/g, "");
    const refenced = sanitized.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
    if (refenced) {
      try {
        return JSON.parse(refenced[1].trim()) as T;
      } catch {
        /* give up */
      }
    }

    if (fallback !== undefined) return fallback;
    throw new Error("parseJson: could not extract valid JSON from LLM response");
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
   * @deprecated Not currently used by any subclass. May be removed in a future version.
   *
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

/**
 * Find the first balanced top-level `{...}` or `[...]` in the input.
 * Respects strings, escapes, and one level of nesting depth (sufficient
 * for typical LLM responses — agent prompts don't usually go deeper).
 *
 * Returns null if no balanced block is found.
 */
function extractBalancedJson(input: string): string | null {
  const firstBrace = input.search(/[\[{]/);
  if (firstBrace < 0) return null;

  const open = input[firstBrace];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = firstBrace; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === open) {
      depth += 1;
      continue;
    }
    if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        return input.slice(firstBrace, i + 1);
      }
    }
  }

  return null;
}
