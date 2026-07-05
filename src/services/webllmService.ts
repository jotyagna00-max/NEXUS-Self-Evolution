import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

let engine: MLCEngine | null = null;
let loadingPromise: Promise<MLCEngine> | null = null;

export interface WebLLMProgress {
  progress: number;
  text: string;
}

type ProgressCallback = (progress: WebLLMProgress) => void;

export async function getWebLLMEngine(
  onProgress?: ProgressCallback
): Promise<MLCEngine> {
  if (engine) {
    onProgress?.({ progress: 100, text: "Model ready" });
    return engine;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      onProgress?.({ progress: 0, text: "Initializing AI model..." });

      engine = await CreateMLCEngine(
        "Phi-4-mini-instruct-q4f16_1-MLC",
        {
          initProgressCallback: (progress) => {
            onProgress?.({
              progress: Math.round(progress.progress * 100),
              text: progress.text,
            });
          },
        }
      );

      onProgress?.({ progress: 100, text: "AI model ready" });
      return engine;
    } catch (error) {
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

export async function generateWebLLMResponse(
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<string> {
  const engine = await getWebLLMEngine();

  const reply = await engine.chat.completions.create({
    messages: messages as any,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1024,
  });

  return reply.choices[0].message.content || "";
}

export async function streamWebLLMResponse(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void,
  options: {
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<string> {
  const engine = await getWebLLMEngine();
  let fullResponse = "";

  const stream = await engine.chat.completions.create({
    messages: messages as any,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta.content || "";
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }

  return fullResponse;
}

export function isWebGPUSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function preloadModel(
  onProgress?: ProgressCallback
): Promise<void> {
  if (isWebGPUSupported()) {
    await getWebLLMEngine(onProgress);
  }
}
