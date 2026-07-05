import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

const MODEL_REPO = 'bartowski/Phi-4-mini-instruct-GGUF';
const MODEL_FILE = 'Phi-4-mini-instruct-Q4_K_M.gguf';
const MODEL_DIR_NAME = 'llama-models';

function getModelsDir() {
  if (app?.isPackaged && process.resourcesPath) {
    return path.join(process.resourcesPath, MODEL_DIR_NAME);
  }
  if (process.env.NODE_ENV === 'development' || !app?.isPackaged) {
    return path.join(process.cwd(), MODEL_DIR_NAME);
  }
  return path.join(app.getPath('userData') || process.cwd(), MODEL_DIR_NAME);
}

function getModelPath() {
  return path.join(getModelsDir(), MODEL_FILE);
}

let _instance = null;

export class NativeLLMServer {
  constructor() {
    this.model = null;
    this.llama = null;
    this.context = null;
    this.ready = false;
    this.initializing = false;
    this.initPromise = null;
    this.error = null;
    this.downloadProgress = 0;
    this.downloading = false;
  }

  static getInstance() {
    if (!_instance) _instance = new NativeLLMServer();
    return _instance;
  }

  modelExists() { return fs.existsSync(getModelPath()); }
  getModelSize() { try { return fs.statSync(getModelPath()).size; } catch { return 0; } }

  async downloadModel(onProgress) {
    this.downloading = true;
    this.downloadProgress = 0;
    this.error = null;

    const dir = getModelsDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const url = `https://huggingface.co/${MODEL_REPO}/resolve/main/${MODEL_FILE}`;
    const dest = getModelPath();

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      const total = parseInt(resp.headers.get('content-length') || '0', 10);
      const reader = resp.body.getReader();
      const writeStream = fs.createWriteStream(dest);
      let downloaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writeStream.write(Buffer.from(value));
        downloaded += value.length;
        if (total > 0) {
          const pct = Math.round((downloaded / total) * 100);
          this.downloadProgress = pct;
          onProgress?.(pct);
        }
      }

      await new Promise((resolve, reject) => {
        writeStream.end();
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      this.downloading = false;
      this.downloadProgress = 100;
      return true;
    } catch (err) {
      this.downloading = false;
      this.error = err.message;
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      throw err;
    }
  }

  async initialize() {
    if (this.ready) return true;
    if (this.initializing) return this.initPromise;
    this.initializing = true;

    this.initPromise = (async () => {
      try {
        const modelPath = getModelPath();
        if (!fs.existsSync(modelPath)) {
          throw new Error(`Model not found at ${modelPath}. Download first.`);
        }

        this.llama = await getLlama();
        this.model = await this.llama.loadModel({ modelPath });
        this.context = await this.model.createContext();
        this.ready = true;
        this.error = null;
        return true;
      } catch (err) {
        this.error = err.message;
        this.ready = false;
        throw err;
      } finally {
        this.initializing = false;
      }
    })();

    return this.initPromise;
  }

  async chatCompletion(messages, options = {}) {
    if (!this.ready || !this.model) throw new Error('LLM not initialized');

    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.max_tokens ?? 4096;

    const sequence = this.context.getSequence();
    try {
      // Extract system prompt
      const systemMsg = messages.find(m => m.role === 'system');

      // Build full prompt from conversation history (exclude system from body)
      const convMessages = messages.filter(m => m.role !== 'system');
      let fullPrompt = '';
      for (let i = 0; i < convMessages.length; i++) {
        const m = convMessages[i];
        const role = m.role === 'user' ? 'User' : 'Assistant';
        fullPrompt += `${role}: ${m.content}\n\n`;
      }

      const session = new LlamaChatSession({
        contextSequence: sequence,
        systemPrompt: systemMsg?.content || undefined,
      });

      // Set conversation history from previous turns
      if (convMessages.length > 1) {
        const history = convMessages.slice(0, -1).map(m => ({
          type: m.role === 'user' ? 'user' : 'model',
          text: m.content,
        }));
        session.setChatHistory(history);
      }

      // The last user message is the prompt
      const lastMsg = convMessages[convMessages.length - 1];
      const promptText = lastMsg?.role === 'user' ? lastMsg.content : fullPrompt;

      const response = await session.prompt(promptText, {
        temperature,
        maxTokens,
      });

      return {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: MODEL_FILE,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: response },
          finish_reason: 'stop',
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    } finally {
      sequence.dispose();
    }
  }

  getStatus() {
    return {
      ready: this.ready,
      initializing: this.initializing,
      downloading: this.downloading,
      downloadProgress: this.downloadProgress,
      modelExists: this.modelExists(),
      modelSize: this.getModelSize(),
      error: this.error,
      modelFile: MODEL_FILE,
    };
  }
}
