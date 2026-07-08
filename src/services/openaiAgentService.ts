import OpenAI from "openai";

/** Default LM Studio endpoint — no key required. */
const LOCAL_LLM_DEFAULT_BASE = "http://localhost:1234/v1";
const LOCAL_LLM_DEFAULT_MODEL = "";

function getLocalLLMConfig() {
  const enabled = localStorage.getItem("LOCAL_LLM_ENABLED") === "true";
  const baseURL = localStorage.getItem("LOCAL_LLM_BASE_URL") || LOCAL_LLM_DEFAULT_BASE;
  const model = localStorage.getItem("LOCAL_LLM_MODEL") || LOCAL_LLM_DEFAULT_MODEL;
  return { enabled, baseURL, model };
}

function getLocalClient(baseURL: string): OpenAI {
  return new OpenAI({
    baseURL,
    apiKey: "lm-studio", // LM Studio / Ollama ignore the key, but the SDK requires one
    dangerouslyAllowBrowser: true,
  });
}

function parseApiError(err: any): Error {
  const msg = err?.message || err?.statusText || String(err);
  if (msg.includes('clipboard') || msg.includes('image input')) {
    return new Error("The AI model only supports text. Please send text messages only (no images or file attachments).");
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR_CONNECTION_REFUSED')) {
    return new Error("Cannot connect to the local LLM server. Make sure LM Studio or Ollama is running and the endpoint URL is correct in Settings.");
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

  if (!local.enabled) {
    throw new Error("Local LLM is not enabled. Enable it in Settings and make sure your LLM server (LM Studio / Ollama) is running.");
  }

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
    throw new Error("No response content returned from the LLM.");
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

  if (!local.enabled) {
    throw new Error("Local LLM is not enabled. Enable it in Settings and make sure your LLM server (LM Studio / Ollama) is running.");
  }

  try {
    const model = local.model || undefined;
    const isNativeLLM = !!(window as any).electronAPI && local.baseURL.includes('localhost:3000');

    // Native Electron LLM doesn't support streaming — use non-streaming and yield all at once
    if (isNativeLLM) {
      const completion = await getLocalClient(local.baseURL).chat.completions.create({
        model: model ?? "",
        messages,
        temperature,
        top_p,
        max_tokens,
        stream: false,
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (content) {
        onChunk?.(content);
        yield content;
      }
      return;
    }

    // Regular streaming via OpenAI-compatible endpoint
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
  } catch (err: any) {
    throw parseApiError(err);
  }
}
