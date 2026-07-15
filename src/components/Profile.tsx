import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Target, Dumbbell, Brain, Shield, Activity, Zap, TrendingUp, Save, ChevronRight, Edit3, Sword, Eye, Clock, Flame, Trophy, Swords, Star, X, Globe, Languages, Settings, Bell, Plus, Minus, CheckCircle2, AlertTriangle, Download, Upload } from 'lucide-react';
import { exportJsonFull, importJsonFull } from '../utils/exporters';
import { isSoundEnabled, setSoundEnabled } from '../utils/sounds';
// secureStorage imports removed — no longer using NVIDIA API key
import { useGame } from '../GameContext';
import { HunterRank } from '../types';
import { ARCHETYPES, ARCHETYPE_ORDER, getArchetype } from '../services/archetypes';
import { useT } from '../i18n/useT';
import { loadAutoQuestConfig, saveAutoQuestConfig, AutoQuestConfig } from '../agents/strategicQuestService';
import { getNativeLLMStatus, downloadNativeLLM, initializeNativeLLM, redownloadNativeLLM, onNativeLLMDownloadProgress, onNativeLLMStatusChange } from '../services/nativeLLMBridge';

const rankColor = (rank: string) => {
  const colors: Record<string, string> = { 'E': 'text-gray-400', 'D': 'text-green-400', 'C': 'text-blue-400', 'B': 'text-purple-400', 'A': 'text-yellow-400', 'S': 'text-red-400', 'SS': 'text-pink-400', 'SSS': 'text-amber-400' };
  return colors[rank] || 'text-white';
};

const rankGlow = (rank: string) => {
  const glows: Record<string, string> = { 'E': 'shadow-[0_0_15px_rgba(156,163,175,0.2)]', 'D': 'shadow-[0_0_15px_rgba(34,197,94,0.2)]', 'C': 'shadow-[0_0_15px_rgba(59,130,246,0.2)]', 'B': 'shadow-[0_0_15px_rgba(168,85,247,0.2)]', 'A': 'shadow-[0_0_15px_rgba(234,179,8,0.2)]', 'S': 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', 'SS': 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', 'SSS': 'shadow-[0_0_25px_rgba(251,191,36,0.4)]' };
  return glows[rank] || '';
};

const statIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  strength: Dumbbell, intelligence: Brain, agility: Zap, vitality: Shield, willpower: Flame, social: Activity,
};

const StatBar: React.FC<{ label: string; value: number; color: string; icon: React.FC<{ size?: number; className?: string }> }> = ({ label, value, color, icon: Icon }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className={`text-${color}-400`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-display uppercase tracking-wider text-white/60">{label}</span>
        <span className={`text-[11px] font-mono font-bold text-${color}-400`}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full rounded-full bg-gradient-to-r from-${color}-500/60 to-${color}-400`}
        />
      </div>
    </div>
  </div>
);

const LOCAL_LLM_STORAGE_KEYS = {
  enabled: 'LOCAL_LLM_ENABLED',
  baseURL: 'LOCAL_LLM_BASE_URL',
  model: 'LOCAL_LLM_MODEL',
};

const CUSTOM_LLM_PRESETS = [
  { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'Groq', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { name: 'Together AI', baseURL: 'https://api.together.xyz/v1', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
  { name: 'OpenRouter', baseURL: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'Mistral', baseURL: 'https://api.mistral.ai/v1', model: 'mistral-small-latest' },
];

const CustomLLMPanel: React.FC = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('CUSTOM_LLM_ENABLED') === 'true');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('CUSTOM_LLM_API_KEY') || '');
  const [baseURL, setBaseURL] = useState(() => localStorage.getItem('CUSTOM_LLM_BASE_URL') || 'https://api.openai.com/v1');
  const [model, setModel] = useState(() => localStorage.getItem('CUSTOM_LLM_MODEL') || 'gpt-4o-mini');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const save = (key: string, value: string) => localStorage.setItem(key, value);

  const handleEnable = (v: boolean) => {
    setEnabled(v);
    save('CUSTOM_LLM_ENABLED', String(v));
    if (v) {
      save('LOCAL_LLM_ENABLED', 'false');
    }
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setTestMsg('');
    try {
      const resp = await fetch(baseURL.replace(/\/$/, '') + '/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) {
        setTestStatus('error');
        setTestMsg(resp.status === 401 ? 'Invalid API key' : `Server returned ${resp.status}`);
        return;
      }
      setTestStatus('success');
      setTestMsg('Connected successfully');
    } catch (err: any) {
      setTestStatus('error');
      setTestMsg(err?.name === 'AbortError' ? 'Connection timed out' : `Failed: ${err?.message || err}`);
    }
  };

  return (
    <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-white/40">AI+</div>
        <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Custom AI Engine</span>
        <div className="h-px flex-1 bg-white/5" />
        {enabled ? (
          <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10} /> Active</span>
        ) : (
          <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/30">Disabled</span>
        )}
      </div>

      <p className="text-[10px] font-tech text-white/40 mb-5 leading-relaxed">
        Connect your own AI API key (OpenAI, Groq, Together, OpenRouter, DeepSeek, Mistral). This is the most reliable way to power Shadow Chat and AI agents — no local model needed.
      </p>

      {/* Preset selector */}
      <div className="mb-5">
        <label className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-2 block">Quick Setup</label>
        <div className="flex flex-wrap gap-2">
          {CUSTOM_LLM_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => {
                setBaseURL(preset.baseURL);
                setModel(preset.model);
                save('CUSTOM_LLM_BASE_URL', preset.baseURL);
                save('CUSTOM_LLM_MODEL', preset.model);
              }}
              className={`px-3 py-2 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                baseURL === preset.baseURL
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="mb-4">
        <label className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1.5 block">API Key</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); save('CUSTOM_LLM_API_KEY', e.target.value); }}
            placeholder="sk-..."
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-[10px] font-mono"
          >
            {showKey ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      </div>

      {/* Base URL + Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1.5 block">Base URL</label>
          <input
            value={baseURL}
            onChange={e => { setBaseURL(e.target.value); save('CUSTOM_LLM_BASE_URL', e.target.value); }}
            placeholder="https://api.openai.com/v1"
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div>
          <label className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1.5 block">Model</label>
          <input
            value={model}
            onChange={e => { setModel(e.target.value); save('CUSTOM_LLM_MODEL', e.target.value); }}
            placeholder="gpt-4o-mini"
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Test + Enable */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={testConnection}
          disabled={testStatus === 'testing' || !apiKey}
          className="px-5 py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 transition-all text-[9px] font-display uppercase tracking-wider flex items-center gap-2"
        >
          {testStatus === 'testing' ? <>Testing...</> : <><Zap size={12} /> Test Connection</>}
        </button>
        {testStatus === 'success' && (
          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> {testMsg}</span>
        )}
        {testStatus === 'error' && (
          <span className="text-[9px] font-mono text-red-400 flex items-center gap-1"><AlertTriangle size={11} /> {testMsg}</span>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <span className="text-[10px] font-tech text-white/40">Enable Custom AI</span>
        <button
          onClick={() => handleEnable(!enabled)}
          disabled={!apiKey}
          className={`w-12 h-6 rounded-full transition-all disabled:opacity-30 ${enabled ? 'bg-emerald-500/40' : 'bg-white/10'}`}
        >
          <div className={`w-5 h-5 rounded-full transition-all ${enabled ? 'bg-emerald-400 translate-x-6' : 'bg-white/30 translate-x-0.5'}`} />
        </button>
        {enabled && (
          <span className="text-[8px] font-mono text-emerald-400/70 ml-auto">All AI calls route through this engine</span>
        )}
      </div>
    </div>
  );
};

const LocalLLMPanel: React.FC = () => {
  const [enabled, setEnabledState] = useState(() => localStorage.getItem(LOCAL_LLM_STORAGE_KEYS.enabled) === 'true');
  const [baseURL, setBaseURLState] = useState(() => localStorage.getItem(LOCAL_LLM_STORAGE_KEYS.baseURL) || 'http://localhost:1234/v1');
  const [model, setModelState] = useState(() => localStorage.getItem(LOCAL_LLM_STORAGE_KEYS.model) || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');
  const [nativeStatus, setNativeStatus] = useState<any>(null);
  const [nativeDlProgress, setNativeDlProgress] = useState(0);

  // Check Electron native LLM status on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const status = await getNativeLLMStatus();
      if (status && mounted) setNativeStatus(status);
    })();
    const cleanupProgress = onNativeLLMDownloadProgress((pct) => {
      if (!mounted) return;
      setNativeDlProgress(pct);
      setNativeStatus((prev: any) => prev ? { ...prev, downloading: true, downloadProgress: pct } : prev);
    });
    const cleanupStatus = onNativeLLMStatusChange((status) => {
      if (!mounted) return;
      setNativeStatus(status);
    });
    return () => { mounted = false; cleanupProgress(); cleanupStatus(); };
  }, []);

  const isElectron = typeof (window as any).electronAPI !== 'undefined';

  const handleNativeDownload = async () => {
    try {
      setNativeStatus((prev: any) => prev ? { ...prev, downloading: true } : prev);
      const result = await downloadNativeLLM();
      if (result.success) {
        // Model downloaded, now initialize
        const initResult = await initializeNativeLLM();
        if (initResult.success) {
          const updated = await getNativeLLMStatus();
          setNativeStatus(updated);
          if (updated?.ready) {
            // Auto-configure the local LLM endpoint
            localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.enabled, 'true');
            localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.baseURL, 'http://localhost:3000/v1');
            localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.model, updated.modelFile || '');
            setEnabledState(true);
            setBaseURLState('http://localhost:3000/v1');
            setModelState(updated.modelFile || '');
          }
        } else {
          setNativeStatus((prev: any) => prev ? { ...prev, error: initResult.error } : prev);
        }
      } else {
        setNativeStatus((prev: any) => prev ? { ...prev, error: result.error || 'Download failed' } : prev);
      }
    } catch (err: any) {
      setNativeStatus((prev: any) => prev ? { ...prev, error: err.message } : prev);
    }
  };

  const setEnabled = (v: boolean) => {
    setEnabledState(v);
    localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.enabled, String(v));
  };
  const setBaseURL = (v: string) => {
    setBaseURLState(v);
    localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.baseURL, v);
  };
  const setModel = (v: string) => {
    setModelState(v);
    localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.model, v);
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setTestMsg('');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const resp = await fetch(baseURL.replace(/\/$/, '') + '/models', {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) {
        setTestStatus('error');
        setTestMsg(`Server returned ${resp.status}`);
        return;
      }
      const data = await resp.json();
      const models: string[] = data?.data?.map((m: any) => m.id) ?? [];
      if (models.length === 0) {
        setTestStatus('error');
        setTestMsg('No models loaded in LM Studio');
        return;
      }
      const loaded = models.join(', ');
      setTestStatus('success');
      setTestMsg(`Connected — ${loaded}`);
      if (!model) setModel(models[0]);
    } catch (err: any) {
      setTestStatus('error');
      setTestMsg(err?.name === 'AbortError' ? 'Connection timed out' : `Failed: ${err?.message || err}`);
    }
  };

  return (
    <div className="glass rounded-[32px] p-8 border border-white/10 mt-6" data-testid="local-llm-settings">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-white/40">AI</div>
        <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">
          Local AI Engine
        </span>
        <div className="h-px flex-1 bg-white/5" />
        {nativeStatus?.ready ? (
          <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10} /> Connected</span>
        ) : nativeStatus?.downloading ? (
          <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">Installing — {nativeDlProgress}%</span>
        ) : (
          <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1"><AlertTriangle size={10} /> Not Installed</span>
        )}
      </div>

      {/* ─── INSTALL SECTION (only shows if model not downloaded) ─── */}
      {isElectron && !nativeStatus?.ready && !nativeStatus?.downloading && !nativeStatus?.modelExists && (
        <div className="mb-5 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Download size={22} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-display font-bold text-white mb-1">Install AI Model</h4>
              <p className="text-[11px] font-tech text-white/50 leading-relaxed mb-3">
                NEXUS needs a one-time download of the Qwen2.5-2B AI model (~1.5 GB) from HuggingFace.
                After installation, all AI features (Shadow Chat, agent responses) work fully offline — no cloud, no API keys.
              </p>
              <p className="text-[8px] font-mono text-white/20 mb-4">
                Model: Qwen2.5-2B-Instruct (Q4_K_M) · Source: huggingface.co/mradermacher · Stored locally in app data
              </p>
              {nativeStatus?.error && (
                <p className="text-[10px] font-mono text-red-400 mb-3">Error: {nativeStatus.error}</p>
              )}
              <button
                type="button"
                onClick={handleNativeDownload}
                disabled={nativeStatus?.initializing}
                className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white border border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-40 transition-all text-[10px] font-display font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                {nativeStatus?.initializing ? (
                  <><span className="animate-spin">...</span> Initializing...</>
                ) : (
                  <><Download size={14} /> Install AI Model (~1.5 GB)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODEL EXISTS BUT NOT READY (init failed or not started) ─── */}
      {isElectron && !nativeStatus?.ready && !nativeStatus?.downloading && nativeStatus?.modelExists && (
        <div className="mb-5 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-display font-bold text-white mb-1">
                {nativeStatus?.error ? 'AI Model Error' : 'AI Model Not Activated'}
              </h4>
              <p className="text-[11px] font-tech text-white/50 leading-relaxed mb-3">
                {nativeStatus?.error
                  ? `The model was downloaded but failed to load: ${nativeStatus.error}`
                  : 'The model file exists but hasn\'t been loaded into memory yet. Click below to activate it.'
                }
              </p>
              {nativeStatus?.error && (
                <p className="text-[9px] font-mono text-red-400/70 mb-3 break-all">{nativeStatus.error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const result = await initializeNativeLLM();
                    if (result.success) {
                      const updated = await getNativeLLMStatus();
                      setNativeStatus(updated);
                      if (updated?.ready) {
                        localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.enabled, 'true');
                        localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.baseURL, 'http://localhost:3000/v1');
                        localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.model, updated.modelFile || '');
                        setEnabledState(true);
                        setBaseURLState('http://localhost:3000/v1');
                        setModelState(updated.modelFile || '');
                      }
                    } else {
                      setNativeStatus((prev: any) => prev ? { ...prev, error: result.error } : prev);
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black border border-amber-500/50 transition-all text-[10px] font-display font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> Activate Model
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setNativeStatus((prev: any) => prev ? { ...prev, downloading: true, downloadProgress: 0 } : prev);
                    const result = await redownloadNativeLLM();
                    if (result.success && result.status?.ready) {
                      setNativeStatus(result.status);
                      localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.enabled, 'true');
                      localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.baseURL, 'http://localhost:3000/v1');
                      localStorage.setItem(LOCAL_LLM_STORAGE_KEYS.model, result.status.modelFile || '');
                      setEnabledState(true);
                      setBaseURLState('http://localhost:3000/v1');
                      setModelState(result.status.modelFile || '');
                    } else {
                      setNativeStatus(result.status || { error: result.error });
                    }
                  }}
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 transition-all text-[10px] font-display font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Re-download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── DOWNLOAD PROGRESS ─── */}
      {isElectron && nativeStatus?.downloading && (
        <div className="mb-5 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Download size={18} className="text-blue-400 animate-bounce" />
            <span className="text-sm font-display font-bold text-white">Downloading AI Model — {nativeDlProgress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all" style={{ width: `${nativeDlProgress}%` }} />
          </div>
          <p className="text-[9px] font-mono text-white/20 mt-2">~1.5 GB · Do not close the app during download</p>
        </div>
      )}

      {/* ─── READY STATE ─── */}
      {isElectron && nativeStatus?.ready && (
        <div className="mb-5 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-emerald-400">AI Model Active</h4>
            <p className="text-[10px] font-tech text-white/40">Qwen2.5-2B running on your CPU. All AI calls route through the bundled model. No internet required.</p>
          </div>
        </div>
      )}

      {/* ─── NON-ELECTRONON FALLBACK (web/dev mode — manual LM Studio config) ─── */}
      {!isElectron && (
        <>
          <p className="text-[10px] font-tech text-white/40 mb-5 leading-relaxed">
            Running in browser mode. Connect an external local LLM server (LM Studio, Ollama) that exposes an OpenAI-compatible API.
            In the desktop app, the model is bundled and auto-installed — no manual setup needed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1.5 block">Endpoint URL</label>
              <input
                value={baseURL}
                onChange={e => setBaseURL(e.target.value)}
                placeholder="http://localhost:1234/v1"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1.5 block">Model Name</label>
              <input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. qwen2.5-2b"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              className="px-5 py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 transition-all text-[9px] font-display uppercase tracking-wider flex items-center gap-2"
            >
              {testStatus === 'testing' ? <>Testing...</> : <><Zap size={12} /> Test Connection</>}
            </button>
            {testStatus === 'success' && (
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> {testMsg}</span>
            )}
            {testStatus === 'error' && (
              <span className="text-[9px] font-mono text-red-400 flex items-center gap-1"><AlertTriangle size={11} /> {testMsg}</span>
            )}
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <span className="text-[10px] font-tech text-white/40">Enable LLM routing</span>
            <button onClick={() => setEnabled(!enabled)} className={`w-12 h-6 rounded-full transition-all ${enabled ? 'bg-emerald-500/40' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 rounded-full transition-all ${enabled ? 'bg-emerald-400 translate-x-6' : 'bg-white/30 translate-x-0.5'}`} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Profile: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { userProfile, selectedCharacter, updateUserProfile, setCharacter, stats, progression, credits, protocols, consistency, language, setLanguage, reminderWindows, setReminderWindows } = useGame();
  const t = useT();
  const [showSetup, setShowSetup] = useState(false);

  // v1.4.0 — Auto-Quest config state
  const [autoQuestConfig, setAutoQuestConfig] = useState<AutoQuestConfig>(() => loadAutoQuestConfig());

  const [step, setStep] = useState(0);
  const [name, setName] = useState(userProfile.name || '');
  const [character, setLocalCharacter] = useState(selectedCharacter || 'Ayanokoji');
  const [goal, setGoal] = useState(userProfile.primaryGoal?.replace(/\s*\(Timeframe:.*\)$/, '') || '');
  const [timeframe, setTimeframe] = useState('');
  const [experience, setExperience] = useState(userProfile.fitnessExperience || 'intermediate');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(userProfile.secondaryGoals || []);
  const [barriers, setBarriers] = useState<string[]>(userProfile.barriers || []);

  const toggleSecondaryGoal = (g: string) => {
    setSecondaryGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleBarrier = (b: string) => {
    setBarriers(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const saveProfile = () => {
    updateUserProfile({
      name: name.trim() || 'Operator',
      primaryGoal: goal.trim() ? `${goal.trim()} (Timeframe: ${timeframe || 'Not set'})` : undefined,
      secondaryGoals,
      fitnessExperience: experience as any,
      barriers,
    });
    setCharacter(character);
    setStep(3);
  };

  const setupSteps = [
    {
      title: 'Identity', icon: User,
      content: (
        <div className="space-y-6">
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Your Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name or callsign..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Manager Archetype</label>
            <div className="grid grid-cols-2 gap-2">
              {ARCHETYPE_ORDER.map(id => {
                const a = ARCHETYPES[id];
                const Icon = a.icon;
                const selected = character === id;
                return (
                  <button key={id} onClick={() => setLocalCharacter(id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                      selected ? `${a.bgClass}` : 'bg-black/50 border-white/10 text-white/40 hover:border-white/30'
                    }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${selected ? a.bgClass : 'bg-white/5 border-white/10'}`}>
                      <Icon size={16} className={selected ? a.colorClass : 'text-white/40'} />
                    </div>
                    <div className="min-w-0">
                      <span className={`block text-[10px] font-display uppercase tracking-wider ${selected ? a.colorClass : 'text-white/70'}`}>
                        {a.shortLabel}
                      </span>
                      <span className="block text-[8px] font-tech text-white/40 truncate">{a.displayName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Experience', icon: Dumbbell,
      content: (
        <div>
          <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Fitness Level</label>
          <div className="flex gap-2">
            {[
              { id: 'beginner', label: 'Beginner' },
              { id: 'intermediate', label: 'Intermediate' },
              { id: 'advanced', label: 'Advanced' },
            ].map(e => (
              <button key={e.id} onClick={() => setExperience(e.id)}
                className={`flex-1 p-4 rounded-2xl text-center border text-[10px] font-display uppercase tracking-wider transition-all ${
                  experience === e.id ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/10 text-white/40 hover:border-white/30'
                }`}>
                {e.label}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Objectives', icon: Target,
      content: (
        <div className="space-y-5">
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Primary Mission</label>
            <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="Your main goal..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 resize-none h-16" />
          </div>
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Timeframe</label>
            <div className="flex gap-2">
              {['3 Months', '6 Months', '1 Year', '2+ Years'].map(t => (
                <button key={t} onClick={() => setTimeframe(t)}
                  className={`flex-1 py-2 rounded-2xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                    timeframe === t ? 'bg-emerald-500 border-emerald-500 text-black font-bold' : 'bg-black/50 border-white/10 text-white/40 hover:border-white/30'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Secondary Goals</label>
            <div className="flex flex-wrap gap-1.5">
              {['Build strength', 'Improve focus', 'Read more', 'Better sleep', 'Learn a skill', 'Social growth', 'Meditation', 'Running'].map(g => (
                <button key={g} onClick={() => toggleSecondaryGoal(g)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                    secondaryGoals.includes(g) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/10 text-white/30 hover:border-white/30'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Barriers', icon: Shield,
      content: (
        <div className="space-y-5">
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Key Obstacles</label>
            <div className="flex flex-wrap gap-1.5">
              {['Procrastination', 'Low energy', 'Time management', 'Motivation dips', 'Social pressure', 'Info overload', 'Sleep issues', 'Self-doubt'].map(b => (
                <button key={b} onClick={() => toggleBarrier(b)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                    barriers.includes(b) ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-black/50 border-white/10 text-white/30 hover:border-white/30'
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  if (showSetup) {
    const current = setupSteps[step];
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[32px] p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <User className="text-emerald-400" size={24} />
              </div>
              <div>
                <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Your Profile</span>
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Configure Profile</h2>
              </div>
            </div>
          <button onClick={() => setShowSetup(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
            <X size={18} />
          </button>
          </div>

          <div className="flex gap-2 mb-8">
            {setupSteps.map((s, i) => (
              <button key={s.title} onClick={() => setStep(i)}
                className={`flex items-center gap-2 flex-1 py-2.5 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                  step === i ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/5 text-white/20 hover:border-white/20'
                }`}>
                <s.icon size={12} />
                {s.title}
              </button>
            ))}
          </div>

          <div className="flex gap-1 mb-6">
            {setupSteps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-500/60' : 'bg-white/5'}`} />
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <current.icon size={14} className="text-emerald-400" />
              <span className="text-[10px] font-display uppercase tracking-widest text-white/40">{current.title}</span>
            </div>
            {current.content}
          </motion.div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all text-[10px] font-display uppercase tracking-widest">Back</button>
            )}
            {step < setupSteps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="flex-1 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-[10px] font-display uppercase tracking-widest flex items-center justify-center gap-2">
                Next <ChevronRight size={12} />
              </button>
            ) : (
              <button onClick={saveProfile}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 text-black font-display font-bold text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                <Save size={14} /> Save Profile
              </button>
            )}
          </div>

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
              <p className="text-[10px] text-emerald-400/60 font-mono">Profile saved successfully.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  const statEntries: { key: string; label: string; value: number; icon: React.FC<{ size?: number; className?: string }>; color: string }[] = [
    { key: 'strength', label: 'Strength', value: stats.strength, icon: statIcons.strength, color: 'red' },
    { key: 'intelligence', label: 'Intelligence', value: stats.intelligence, icon: statIcons.intelligence, color: 'blue' },
    { key: 'agility', label: 'Agility', value: stats.agility, icon: statIcons.agility, color: 'green' },
    { key: 'vitality', label: 'Vitality', value: stats.vitality, icon: statIcons.vitality, color: 'emerald' },
    { key: 'willpower', label: 'Willpower', value: stats.willpower, icon: statIcons.willpower, color: 'amber' },
    { key: 'social', label: 'Social', value: stats.social, icon: statIcons.social, color: 'purple' },
  ];

  const expPercent = Math.round((progression.exp / progression.expToNextLevel) * 100);
  const archetype = getArchetype(selectedCharacter);
  const ArchetypeIcon = archetype.icon;

  return (
    <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Identity Header */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border ${archetype.bgClass}`}>
              <ArchetypeIcon size={36} className={archetype.colorClass} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                {userProfile.name || 'Your Name'}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[9px] font-mono ${archetype.colorClass}/70`}>{archetype.shortLabel}</span>
                <span className="text-white/10">|</span>
                <span className="text-[9px] font-mono text-white/40">{userProfile.primaryGoal?.replace(/\s*\(Timeframe:.*\)$/, '') || 'No mission set'}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSetup(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
            <Edit3 size={14} />
            <span className="text-[8px] font-display uppercase tracking-wider">Edit</span>
          </button>
          {onClose && (
            <button onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all">
              <X size={14} />
              <span className="text-[8px] font-display uppercase tracking-wider">Close</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level */}
        <div className="glass rounded-[32px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={18} className="text-emerald-400" />
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Level</span>
          </div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-5xl font-display font-black text-white">Lv.{progression.level}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-white/30 font-mono">EXP to next rank</span>
              <span className="text-white/60 font-mono">{progression.exp} / {progression.expToNextLevel}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${expPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* NC Wallet */}
        <div className="glass rounded-[32px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Star size={18} className="text-yellow-400" />
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">NC Balance</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-mono font-black text-yellow-400">{credits.toLocaleString()}</span>
            <span className="text-lg font-mono text-white/40 mb-1">NC</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-white/30">
            <TrendingUp size={12} />
            <span>Total EXP earned: {progression.totalExpEarned}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Eye size={18} className="text-emerald-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Your Stats</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {statEntries.map(({ key, label, value, icon, color }) => (
            <StatBar key={key} label={label} value={value} color={color} icon={icon} />
          ))}
        </div>
      </div>

      {/* Account Details */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={18} className="text-emerald-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Account Details</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity size={14} className="text-emerald-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{protocols.length}</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Protocols</span>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame size={14} className="text-orange-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{consistency.score}%</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Consistency</span>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy size={14} className="text-yellow-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{progression.totalExpEarned}</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Total EXP</span>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target size={14} className="text-purple-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{consistency.longestRun}</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Best Run</span>
          </div>
        </div>
      </div>

      {/* v1.4.0 — Quest Auto-Generation Config */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={18} className="text-blue-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Quest Auto-Generation</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="space-y-5">
          {/* Feature toggles */}
          {([
            { key: 'protocolEnabled' as const, label: 'Protocol Quests', desc: 'Spawn themed daily quests when you activate a protocol' },
            { key: 'bookEnabled' as const, label: 'Book Quests', desc: 'Generate reading & comprehension quests when you start a book' },
            { key: 'habitEnabled' as const, label: 'Habit Quests', desc: 'Create micro-quests when you build/break habits' },
          ]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div>
                <span className="text-[10px] font-display uppercase tracking-wider text-white/70">{label}</span>
                <p className="text-[8px] font-tech text-white/30 mt-0.5">{desc}</p>
              </div>
              <button onClick={() => {
                const next = { ...autoQuestConfig, [key]: !autoQuestConfig[key] };
                setAutoQuestConfig(next);
                saveAutoQuestConfig(next);
              }} className={`w-12 h-6 rounded-full transition-all ${autoQuestConfig[key] ? 'bg-emerald-500/40' : 'bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full transition-all ${autoQuestConfig[key] ? 'bg-emerald-400 translate-x-6' : 'bg-white/30 translate-x-0.5'}`} />
              </button>
            </div>
          ))}

          {/* Quest count steppers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { key: 'questsPerProtocol' as const, label: 'Per Protocol', min: 1, max: 7 },
              { key: 'questsPerBook' as const, label: 'Per Book', min: 1, max: 5 },
              { key: 'questsPerHabit' as const, label: 'Per Habit', min: 1, max: 5 },
            ]).map(({ key, label, min, max }) => (
              <div key={key} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <span className="text-[8px] font-display uppercase tracking-wider text-white/40 block mb-2">{label}</span>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => {
                    const next = { ...autoQuestConfig, [key]: Math.max(min, autoQuestConfig[key] - 1) };
                    setAutoQuestConfig(next);
                    saveAutoQuestConfig(next);
                  }} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/30 flex items-center justify-center transition-all">
                    <Minus size={12} />
                  </button>
                  <span className="text-2xl font-mono font-bold text-white w-8 text-center">{autoQuestConfig[key]}</span>
                  <button onClick={() => {
                    const next = { ...autoQuestConfig, [key]: Math.min(max, autoQuestConfig[key] + 1) };
                    setAutoQuestConfig(next);
                    saveAutoQuestConfig(next);
                  }} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/30 flex items-center justify-center transition-all">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* v1.4.0 — Reminder Windows */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={18} className="text-amber-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Reminder Windows</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="space-y-4">
          {reminderWindows.map((w, i) => (
            <div key={w.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-display uppercase tracking-wider text-white/70">{w.label}</span>
                  {w.enabled && <span className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-display uppercase tracking-widest">Active</span>}
                </div>
                <button onClick={() => {
                  const next = [...reminderWindows];
                  next[i] = { ...next[i], enabled: !next[i].enabled };
                  setReminderWindows(next);
                }} className={`w-12 h-6 rounded-full transition-all ${w.enabled ? 'bg-emerald-500/40' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full transition-all ${w.enabled ? 'bg-emerald-400 translate-x-6' : 'bg-white/30 translate-x-0.5'}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[7px] font-display uppercase tracking-widest text-white/30 block mb-1">Start Hour</label>
                  <input type="range" min={4} max={22} value={w.startHour}
                    onChange={e => {
                      const next = [...reminderWindows];
                      next[i] = { ...next[i], startHour: parseInt(e.target.value) };
                      setReminderWindows(next);
                    }}
                    className="w-full accent-amber-400" />
                  <span className="text-[9px] font-mono text-white/50">{w.startHour}:00</span>
                </div>
                <div>
                  <label className="text-[7px] font-display uppercase tracking-widest text-white/30 block mb-1">End Hour</label>
                  <input type="range" min={5} max={23} value={w.endHour}
                    onChange={e => {
                      const next = [...reminderWindows];
                      next[i] = { ...next[i], endHour: parseInt(e.target.value) };
                      setReminderWindows(next);
                    }}
                    className="w-full accent-amber-400" />
                  <span className="text-[9px] font-mono text-white/50">{w.endHour}:00</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export / Import */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe size={18} className="text-cyan-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Data Backup</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <p className="text-[10px] font-tech text-white/40 mb-5 leading-relaxed">
          Export all your NEXUS data (stats, protocols, quests, habits, achievements, history) as a JSON file.
          Import to restore on a new device or after reinstall. All data stays on your machine.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => exportJsonFull()}
            className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-[9px] font-display uppercase tracking-widest"
          >
            <Download size={14} /> Export Backup
          </button>
          <label className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[9px] font-display uppercase tracking-widest cursor-pointer">
            <Upload size={14} /> Import Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                  const count = importJsonFull(text);
                  alert(`Restored ${count} data keys. NEXUS will reload.`);
                  window.location.reload();
                } catch (err: any) {
                  alert(`Import failed: ${err?.message || 'Invalid file'}`);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Custom LLM — User's own API key */}
      <CustomLLMPanel />

      {/* Local LLM — Standalone AI Engine */}
      <LocalLLMPanel />

      {/* Sound Settings */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={18} className="text-amber-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Sound Effects</span>
          <div className="h-px flex-1 bg-white/5" />
          <button
            onClick={() => { const next = !isSoundEnabled(); setSoundEnabled(next); window.location.reload(); }}
            className={`w-12 h-6 rounded-full transition-all ${isSoundEnabled() ? 'bg-emerald-500/40' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 rounded-full transition-all ${isSoundEnabled() ? 'bg-emerald-400 translate-x-6' : 'bg-white/30 translate-x-0.5'}`} />
          </button>
        </div>
        <p className="text-[10px] font-tech text-white/40 leading-relaxed">
          Subtle UI sounds for task completion, quest turn-in, level ups, achievements, and penalties. Generated with Web Audio API — no audio files needed.
        </p>
      </div>

      {/* Language picker */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Languages size={18} className="text-emerald-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Language</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="flex gap-2">
          {([
            { id: 'en' as const, label: 'English', flag: 'EN' },
            { id: 'ja' as const, label: '日本語', flag: 'JA' },
          ]).map(l => (
            <button key={l.id}
              onClick={() => setLanguage(l.id)}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                language === l.id ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-black/40 border-white/10 text-white/40 hover:border-white/30'
              }`}>
              <span className="text-[10px] font-display uppercase tracking-widest">{l.label}</span>
              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${language === l.id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/30'}`}>{l.flag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Setup wizard collapsed button */}
      {(!userProfile.name || !userProfile.primaryGoal) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-6 glass rounded-[32px] border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 size={18} className="text-emerald-400" />
              <span className="text-[10px] font-display uppercase tracking-wider text-white/60">Complete your profile setup</span>
            </div>
            <button onClick={() => setShowSetup(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-[9px] font-display uppercase tracking-wider">
              Start Setup <ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;