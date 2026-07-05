/**
 * Re-export of AgentBase.parseJson so any caller — services, hooks, UI
 * handlers, anything that needs to defensively parse an LLM response — can
 * use it without instantiating an Agent class.
 *
 * Always prefer this over `JSON.parse` for content that came back from an
 * LLM. Meta Llama 3.1 (and most open-source models) wrap responses in
 * ```json ... ``` fences, sometimes with leading prose or trailing noise.
 * `JSON.parse` will throw on the first byte of fence syntax; this helper
 * peels the fence off and falls back to the supplied default.
 *
 * @example
 *   const raw = await llm.complete(...);
 *   const plan = parseJson<Plan>(raw, { steps: [] });
 */
import { AgentBase } from "../agents/AgentBase";

export function parseJson<T = unknown>(
  raw: string | null | undefined,
  fallback?: T,
): T {
  return AgentBase.parseJson<T>(raw, fallback);
}

export default parseJson;
