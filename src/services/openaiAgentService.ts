import OpenAI from "openai";

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

function parseApiError(err: any): Error {
  const msg = err?.message || err?.statusText || String(err);
  if (msg.includes('clipboard') || msg.includes('image input')) {
    return new Error("This model does not support image input. Please send text only.");
  }
  return new Error(msg);
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