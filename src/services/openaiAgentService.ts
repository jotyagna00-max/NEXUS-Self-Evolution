import OpenAI from "openai";

const LOCAL_LLM_DEFAULT_BASE = "http://localhost:1234/v1";
const LOCAL_LLM_DEFAULT_MODEL = "";

function getLocalLLMConfig() {
  const enabled = localStorage.getItem("LOCAL_LLM_ENABLED") === "true";
  const baseURL = localStorage.getItem("LOCAL_LLM_BASE_URL") || LOCAL_LLM_DEFAULT_BASE;
  const model = localStorage.getItem("LOCAL_LLM_MODEL") || LOCAL_LLM_DEFAULT_MODEL;
  return { enabled, baseURL, model };
}

function isNativeLLM(): boolean {
  const baseURL = localStorage.getItem("LOCAL_LLM_BASE_URL") || "";
  return !!(window as any).electronAPI && baseURL.includes('localhost:3000');
}

function getLocalClient(baseURL: string): OpenAI {
  return new OpenAI({
    baseURL,
    apiKey: "lm-studio",
    dangerouslyAllowBrowser: true,
    timeout: 180000,
    maxRetries: 0,
  });
}

function parseApiError(err: any): Error {
  const msg = err?.message || err?.statusText || String(err);
  if (msg.includes('clipboard') || msg.includes('image input')) {
    return new Error("The AI model only supports text. Please send text messages only.");
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR_CONNECTION_REFUSED')) {
    return new Error("Cannot connect to the local AI engine. Make sure the model is activated in Profile → Local AI Engine.");
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return new Error("The AI model took too long to respond. The Qwen2.5-2B model runs on your CPU and may take 30-60 seconds for complex questions.");
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
  const native = isNativeLLM();
  const maxTokens = native ? 256 : (options.max_tokens ?? 4096);

  const local = getLocalLLMConfig();

  if (!local.enabled) {
    throw new Error("Local LLM is not enabled. Enable it in Profile → Local AI Engine.");
  }

  try {
    const model = local.model || undefined;
    const completion = await getLocalClient(local.baseURL).chat.completions.create({
      model: model ?? "",
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
  const native = isNativeLLM();
  const maxTokens = native ? 256 : (options.max_tokens ?? 4096);

  const local = getLocalLLMConfig();

  if (!local.enabled) {
    throw new Error("Local LLM is not enabled. Enable it in Profile → Local AI Engine.");
  }

  try {
    const model = local.model || undefined;

    if (native) {
      const completion = await getLocalClient(local.baseURL).chat.completions.create({
        model: model ?? "",
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

    const stream = await getLocalClient(local.baseURL).chat.completions.create({
      model: model ?? "",
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
