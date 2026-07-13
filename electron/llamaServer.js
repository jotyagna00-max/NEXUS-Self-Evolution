import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow } from 'electron';

const MODEL_REPO = 'mradermacher/Qwen2.5-2B-Instruct-GGUF';
const MODEL_FILE = 'Qwen2.5-2B-Instruct.Q4_K_M.gguf';
const MODEL_DIR_NAME = 'llama-models';

function getModelsDir() {
  const userData = app?.getPath?.('userData');
  if (userData) {
    return path.join(userData, MODEL_DIR_NAME);
  }
  return path.join(process.cwd(), MODEL_DIR_NAME);
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

        const modelSize = fs.statSync(modelPath).size;
        if (modelSize < 100 * 1024 * 1024) {
          throw new Error(`Model file is too small (${(modelSize/1024/1024).toFixed(1)} MB). Download may be corrupted. Please re-download.`);
        }

        this.llama = await getLlama();
        this.model = await this.llama.loadModel({ modelPath });
        this.context = await this.model.createContext();
        this.ready = true;
        this.error = null;

        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('llm:status-change', this.getStatus());
        });
        return true;
      } catch (err) {
        this.error = err.message;
        this.ready = false;
        this.initializing = false;

        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('llm:status-change', this.getStatus());
        });
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
    const maxTokens = Math.min(options.max_tokens ?? 256, 512);

    const sequence = this.context.getSequence();
    try {
      const systemMsg = messages.find(m => m.role === 'system');
      const convMessages = messages.filter(m => m.role !== 'system');

      const session = new LlamaChatSession({
        contextSequence: sequence,
        systemPrompt: systemMsg?.content?.substring(0, 800) || undefined,
      });

      if (convMessages.length > 1) {
        const history = convMessages.slice(0, -1).map(m => ({
          type: m.role === 'user' ? 'user' : 'model',
          text: m.content?.substring(0, 500),
        }));
        session.setChatHistory(history);
      }

      const lastMsg = convMessages[convMessages.length - 1];
      const promptText = lastMsg?.role === 'user' ? lastMsg.content : '';

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
    } catch (err) {
      throw new Error(`Generation failed: ${err.message}`);
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
