import OpenAI from "openai";

const LOCAL_LLM_DEFAULT_BASE = "http://localhost:1234/v1";

type LLMMode = 'custom' | 'native' | 'local' | 'none';

function getLLMMode(): LLMMode {
  const customKey = localStorage.getItem("CUSTOM_LLM_API_KEY");
  const customEnabled = localStorage.getItem("CUSTOM_LLM_ENABLED") === "true";
  if (customKey && customEnabled) return 'custom';

  const localEnabled = localStorage.getItem("LOCAL_LLM_ENABLED") === "true";
  if (!localEnabled) return 'none';

  const baseURL = localStorage.getItem("LOCAL_LLM_BASE_URL") || "";
  if (!!(window as any).electronAPI && baseURL.includes('localhost:3000')) return 'native';
  return 'local';
}

function getLocalLLMConfig() {
  const enabled = localStorage.getItem("LOCAL_LLM_ENABLED") === "true";
  const baseURL = localStorage.getItem("LOCAL_LLM_BASE_URL") || LOCAL_LLM_DEFAULT_BASE;
  const model = localStorage.getItem("LOCAL_LLM_MODEL") || "";
  return { enabled, baseURL, model };
}

function getCustomLLMConfig() {
  const enabled = localStorage.getItem("CUSTOM_LLM_ENABLED") === "true";
  const apiKey = localStorage.getItem("CUSTOM_LLM_API_KEY") || "";
  const baseURL = localStorage.getItem("CUSTOM_LLM_BASE_URL") || "https://api.openai.com/v1";
  const model = localStorage.getItem("CUSTOM_LLM_MODEL") || "gpt-4o-mini";
  return { enabled, apiKey, baseURL, model };
}

function isNativeLLM(): boolean {
  return getLLMMode() === 'native';
}

function getClient(): { client: OpenAI; model: string; isNative: boolean } {
  const mode = getLLMMode();

  if (mode === 'custom') {
    const cfg = getCustomLLMConfig();
    return {
      client: new OpenAI({
        baseURL: cfg.baseURL,
        apiKey: cfg.apiKey,
        dangerouslyAllowBrowser: true,
        timeout: 60000,
        maxRetries: 1,
      }),
      model: cfg.model,
      isNative: false,
    };
  }

  const local = getLocalLLMConfig();
  return {
    client: new OpenAI({
      baseURL: local.baseURL,
      apiKey: "lm-studio",
      dangerouslyAllowBrowser: true,
      timeout: 180000,
      maxRetries: 0,
    }),
    model: local.model || "",
    isNative: mode === 'native',
  };
}

function parseApiError(err: any): Error {
  const msg = err?.message || err?.statusText || String(err);
  if (msg.includes('clipboard') || msg.includes('image input')) {
    return new Error("The AI model only supports text. Please send text messages only.");
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR_CONNECTION_REFUSED')) {
    if (getLLMMode() === 'native') {
      return new Error("Cannot connect to the native AI engine. Go to Profile → Local AI Engine and click Activate Model.");
    }
    return new Error("Cannot connect to the AI server. Check your configuration in Profile.");
  }
  if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('api key')) {
    return new Error("Invalid API key. Check your Custom LLM settings in Profile.");
  }
  if (msg.includes('404') || msg.includes('model')) {
    return new Error("Model not found. Check the model name in your Custom LLM settings.");
  }
  if (msg.includes('429') || msg.includes('rate limit')) {
    return new Error("Rate limit reached. Wait a moment and try again.");
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return new Error("The AI model took too long. Try a shorter message.");
  }
  if (msg.includes('503')) {
    return new Error("AI engine not ready. Activate the model in Profile → Local AI Engine.");
  }
  return new Error(`AI error: ${msg}`);
}

export function isLLMReady(): boolean {
  return getLLMMode() !== 'none';
}

export function getLLMModeLabel(): string {
  const mode = getLLMMode();
  switch (mode) {
    case 'custom': return 'Custom API';
    case 'native': return 'Local Model';
    case 'local': return 'External LLM';
    default: return 'None';
  }
}

export async function generateOpenAIResponse(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  } = {}
) {
  const mode = getLLMMode();
  if (mode === 'none') {
    throw new Error("No AI engine configured. Go to Profile → Custom LLM to add your API key, or activate the Local AI Engine.");
  }

  const { client, model, isNative } = getClient();
  const maxTokens = isNative ? 256 : (options.max_tokens ?? 1024);

  try {
    const completion = await client.chat.completions.create({
      model: model || "",
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.95,
      max_tokens: maxTokens,
      stream: false,
    });
    const choice = completion.choices[0];
    if (choice?.message?.content) {
      return { content: choice.message.content, reasoning: null };
    }
    throw new Error("No response content returned from the AI.");
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
  const mode = getLLMMode();
  if (mode === 'none') {
    throw new Error("No AI engine configured. Go to Profile → Custom LLM to add your API key, or activate the Local AI Engine.");
  }

  const { client, model, isNative } = getClient();
  const maxTokens = isNative ? 256 : (options.max_tokens ?? 1024);

  try {
    if (isNative) {
      const completion = await client.chat.completions.create({
        model: model || "",
        messages,
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.95,
        max_tokens: maxTokens,
        stream: false,
      });
      const content = completion.choices[0]?.message?.content ?? "";
      if (content) {
        onChunk?.(content);
        yield content;
      }
      return;
    }

    const stream = await client.chat.completions.create({
      model: model || "",
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.95,
      max_tokens: maxTokens,
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
