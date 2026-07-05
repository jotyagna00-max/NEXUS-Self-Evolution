import OpenAI from "openai";
import {
  generateWebLLMResponse,
  streamWebLLMResponse,
  isWebGPUSupported,
} from "./webllmService";

/** Default LM Studio endpoint — no key required. */
const LOCAL_LLM_DEFAULT_BASE = "http://localhost:1234/v1";
const LOCAL_LLM_DEFAULT_MODEL = "";

function getLocalLLMConfig() {
  const enabled = localStorage.getItem("LOCAL_LLM_ENABLED") === "true";
  const baseURL = localStorage.getItem("LOCAL_LLM_BASE_URL") || LOCAL_LLM_DEFAULT_BASE;
  const model = localStorage.getItem("LOCAL_LLM_MODEL") || LOCAL_LLM_DEFAULT_MODEL;
  return { enabled, baseURL, model };
}

function getClient(): OpenAI {
  const apiKey = localStorage.getItem('NVIDIA_API_KEY');
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY not set. Configure it in Neural Settings.");
  }
  return new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

function getLocalClient(baseURL: string): OpenAI {
  return new OpenAI({
    baseURL,
    apiKey: "lm-studio", // LM Studio ignores the key, but the SDK requires one
    dangerouslyAllowBrowser: true,
  });
}

function parseApiError(err: any): Error {
  const msg = err?.message || err?.statusText || String(err);
  if (msg.includes('clipboard') || msg.includes('image input')) {
    return new Error("The AI model only supports text. Please send text messages only (no images or file attachments).");
  }
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('Unauthorized')) {
    return new Error("API key is invalid or expired. Please update your NVIDIA API key in Neural Settings.");
  }
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('Too Many Requests')) {
    return new Error("Too many requests. Please wait a moment before sending another message.");
  }
  return new Error(`AI service error: ${msg}`);
}

export async function generateOpenAIResponse(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  } = {}
) {
  const {
    temperature = 0.7,
    top_p = 0.95,
    max_tokens = 4096,
  } = options;

  const local = getLocalLLMConfig();

  // PRIORITY 1: Local LLM (LM Studio / Ollama) — zero cost, zero latency
  if (local.enabled) {
    try {
      const model = local.model || undefined;
      const completion = await getLocalClient(local.baseURL).chat.completions.create({
        model: model ?? "",
        messages,
        temperature,
        top_p,
        max_tokens,
        stream: false,
      });
      const choice = completion.choices[0];
      if (choice?.message?.content) {
        return { content: choice.message.content, reasoning: null };
      }
    } catch (localErr: any) {
      console.warn("Local LLM failed, falling back:", localErr);
    }
  }

  // PRIORITY 2: WebLLM (zero cost, on-device)
  if (isWebGPUSupported()) {
    try {
      const content = await generateWebLLMResponse(
        messages as Array<{ role: string; content: string }>,
        { temperature, max_tokens: Math.min(max_tokens, 1024) }
      );
      return { content, reasoning: null };
    } catch (webllmError) {
      console.warn("WebLLM failed, falling back to NVIDIA API:", webllmError);
    }
  }

  // PRIORITY 3: NVIDIA API
  try {
    const completion = await getClient().chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages,
      temperature,
      top_p,
      max_tokens,
      stream: false,
    });

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error("No completion choice returned.");
    }

    return {
      content: choice.message.content ?? "",
      reasoning: null,
    };
  } catch (err: any) {
    throw parseApiError(err);
  }
}

export async function* streamOpenAIResponse(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  } = {},
  onChunk?: (content: string) => void,
): AsyncGenerator<string, void, unknown> {
  const {
    temperature = 0.7,
    top_p = 0.95,
    max_tokens = 4096,
  } = options;

  const local = getLocalLLMConfig();

  // PRIORITY 1: Local LLM
  if (local.enabled) {
    try {
      const model = local.model || undefined;
      const stream = await getLocalClient(local.baseURL).chat.completions.create({
        model: model ?? "",
        messages,
        temperature,
        top_p,
        max_tokens,
        stream: true,
      });

      let full = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          full += delta;
          onChunk?.(delta);
          yield delta;
        }
      }
      return;
    } catch (localErr: any) {
      console.warn("Local LLM streaming failed, falling back:", localErr);
    }
  }

  // PRIORITY 2: WebLLM
  if (isWebGPUSupported()) {
    try {
      const fullResponse = await streamWebLLMResponse(
        messages as Array<{ role: string; content: string }>,
        (chunk) => onChunk?.(chunk),
        { temperature, max_tokens: Math.min(max_tokens, 1024) }
      );

      yield fullResponse;
      return;
    } catch (webllmError) {
      console.warn("WebLLM streaming failed, falling back to NVIDIA API:", webllmError);
    }
  }

  // PRIORITY 3: NVIDIA API
  try {
    const stream = await getClient().chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages,
      temperature,
      top_p,
      max_tokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (!choice) continue;

      const delta = choice.delta;
      if (delta.content) {
        onChunk?.(delta.content);
        yield delta.content;
      }
    }
  } catch (err: any) {
    throw parseApiError(err);
  }
}
