/**
 * Bridge between the Electron main process (node-llama-cpp) and the renderer.
 * Auto-discovers the native LLM endpoint and configures localStorage so that
 * the existing local-LLM path in openaiAgentService.ts picks it up.
 */

const LLM_KEY = {
  enabled: 'LOCAL_LLM_ENABLED',
  baseURL: 'LOCAL_LLM_BASE_URL',
  model: 'LOCAL_LLM_MODEL',
};

let _checked = false;

/** Call once at app startup to sync native LLM status into localStorage. */
export async function syncNativeLLMStatus(): Promise<void> {
  if (typeof window === 'undefined') return;
  const api = (window as any).electronAPI;
  if (!api?.getLLMStatus) return;
  if (_checked) return;
  _checked = true;

  try {
    const status = await api.getLLMStatus();
    if (status.ready) {
      localStorage.setItem(LLM_KEY.enabled, 'true');
      localStorage.setItem(LLM_KEY.baseURL, 'http://localhost:3000/v1');
      localStorage.setItem(LLM_KEY.model, status.modelFile || '');
    }
  } catch {}
}

/** Check whether the native LLM is available and ready. */
export async function getNativeLLMStatus(): Promise<{
  ready: boolean;
  initializing: boolean;
  downloading: boolean;
  downloadProgress: number;
  modelExists: boolean;
  modelSize: number;
  error: string | null;
  modelFile: string;
} | null> {
  const api = (window as any).electronAPI;
  if (!api?.getLLMStatus) return null;
  try {
    return await api.getLLMStatus();
  } catch {
    return null;
  }
}

/** Start downloading the model file. */
export async function downloadNativeLLM(): Promise<{ success: boolean; error?: string }> {
  const api = (window as any).electronAPI;
  if (!api?.downloadLLM) return { success: false, error: 'Not in Electron' };
  try {
    return await api.downloadLLM();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/** Initialize the loaded model. */
export async function initializeNativeLLM(): Promise<{ success: boolean; error?: string }> {
  const api = (window as any).electronAPI;
  if (!api?.initializeLLM) return { success: false, error: 'Not in Electron' };
  try {
    return await api.initializeLLM();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/** Register a progress callback for model download. */
export function onNativeLLMDownloadProgress(cb: (pct: number) => void): () => void {
  const api = (window as any).electronAPI;
  if (!api?.onLLMDownloadProgress) return () => {};
  api.onLLMDownloadProgress(cb);
  return () => {}; // cleanup
}

/** Register a callback for when the native LLM status changes (e.g. ready after init). */
export function onNativeLLMStatusChange(cb: (status: any) => void): () => void {
  const api = (window as any).electronAPI;
  if (!api?.onLLMStatusChange) return () => {};
  api.onLLMStatusChange(cb);
  return () => {};
}
