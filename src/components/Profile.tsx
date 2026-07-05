import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Target, Dumbbell, Brain, Shield, Activity, Zap, TrendingUp, Save, ChevronRight, Edit3, Sword, Eye, Clock, Flame, Trophy, Swords, Star, X, Globe, Languages, Settings, Bell, Plus, Minus, Key, ExternalLink, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useGame } from '../GameContext';
import { HunterRank } from '../types';
import { ARCHETYPES, ARCHETYPE_ORDER, getArchetype } from '../services/archetypes';
import { useT } from '../i18n/useT';
import { loadAutoQuestConfig, saveAutoQuestConfig, AutoQuestConfig } from '../agents/strategicQuestService';
import { getNativeLLMStatus, downloadNativeLLM, initializeNativeLLM, onNativeLLMDownloadProgress, onNativeLLMStatusChange } from '../services/nativeLLMBridge';

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

/**
 * Neural Settings — runtime management for the NVIDIA API key.
 *
 * The key never leaves the browser. It's stored in `localStorage` under
 * `NVIDIA_API_KEY` and read on-demand by `openaiAgentService`. Rotate
 * the key any time by pasting a new one and clicking Save.
 *
 * Why not env-var-baked? Vite inlines `VITE_*` into the production
 * bundle. That would mean every Operator shares the same quota and the
 * same bill, and the key would be readable in the built JS. Putting
 * the key in localStorage at runtime keeps the app genuinely local-first.
 */
const NeuralSettingsPanel: React.FC = () => {
  const [storedKey, setStoredKey] = useState<string>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('NVIDIA_API_KEY') || '' : '',
  );
  const [draft, setDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const hasKey = !!storedKey;
  const masked = hasKey
    ? `${storedKey.slice(0, 7)}…${storedKey.slice(-4)}`
    : '';

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    localStorage.setItem('NVIDIA_API_KEY', trimmed);
    setStoredKey(trimmed);
    setDraft('');
    setSavedAt(Date.now());
  };

  const clear = () => {
    localStorage.removeItem('NVIDIA_API_KEY');
    setStoredKey('');
    setDraft('');
    setSavedAt(null);
  };

  return (
    <div className="glass rounded-[32px] p-8 border border-white/10 mt-6" data-testid="neural-settings">
      <div className="flex items-center gap-3 mb-4">
        <Key size={18} className="text-blue-400" />
        <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">
          Neural Settings
       </span>
        <div className="h-px flex-1 bg-white/5" />
        {hasKey ? (
          <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={10} /> Linked
         </span>
        ) : (
          <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
            <AlertTriangle size={10} /> No Key
         </span>
        )}
     </div>

      <p className="text-[10px] font-tech text-white/40 mb-5 leading-relaxed">
        NEXUS routes every chat through Meta Llama 3.1 8B via NVIDIA's hosted
        endpoint. Your key is stored only in this browser — never sent to a
        NEXUS server. Rotate or remove it at any time.
     </p>

      {/* Status row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">
            Current Key
         </div>
          <div className="font-mono text-sm text-white/80 truncate">
            {hasKey ? (showKey ? storedKey : masked) : (
              <span className="text-white/30">— not configured —</span>
            )}
         </div>
          {hasKey && (
            <button
              type="button"
              onClick={() => setShowKey(s => !s)}
              className="mt-2 text-[8px] font-display uppercase tracking-wider text-white/30 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              {showKey ? <><EyeOff size={10} /> Hide</> : <>Show full key</>}
           </button>
          )}
       </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">
            Get a Key
         </div>
          <a
            href="https://build.nvidia.com/settings/api-keys"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[10px] font-tech text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
          >
            build.nvidia.com/settings/api-keys
            <ExternalLink size={10} />
         </a>
          <div className="text-[8px] text-white/30 mt-2 leading-relaxed">
            Sign in → "Get API Key" → copy the <code className="text-emerald-300">nvapi-…</code> token
         </div>
       </div>
     </div>

      {/* Input row */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type={showKey ? 'text' : 'password'}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); }}
          placeholder="nvapi-… (paste your key here)"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
        <button
          type="button"
          onClick={save}
          disabled={!draft.trim()}
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-black font-display font-bold uppercase tracking-wider text-[10px] transition-all disabled:cursor-not-allowed"
        >
          Save Key
       </button>
        {hasKey && (
          <button
            type="button"
            onClick={clear}
            className="px-5 py-3 rounded-2xl bg-white/5 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-display font-bold uppercase tracking-wider text-[10px] transition-all"
          >
            Remove
         </button>
        )}
     </div>

      {savedAt && (
        <div className="mt-3 text-[9px] font-mono text-emerald-400">
          ✓ Saved at {new Date(savedAt).toLocaleTimeString()}. Next agent call will use the new key.
       </div>
      )}
   </div>
  );
};

const LOCAL_LLM_STORAGE_KEYS = {
  enabled: 'LOCAL_LLM_ENABLED',
  baseURL: 'LOCAL_LLM_BASE_URL',
  model: 'LOCAL_LLM_MODEL',
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
    (async () => {
      const status = await getNativeLLMStatus();
      if (status) setNativeStatus(status);
    })();
    const cleanup = onNativeLLMDownloadProgress((pct) => {
      setNativeDlProgress(pct);
      setNativeStatus((prev: any) => prev ? { ...prev, downloading: true, downloadProgress: pct } : prev);
    });
    return cleanup;
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
      {/* Electron native LLM status */}
      {isElectron && (
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[7px] font-mono text-blue-400">E</div>
              <span className="text-[8px] font-display uppercase tracking-widest text-white/40">Bundled LLM</span>
            </div>
            {nativeStatus?.ready ? (
              <span className="text-[8px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={9} /> Ready
              </span>
            ) : nativeStatus?.downloading ? (
              <span className="text-[8px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                Downloading — {nativeDlProgress}%
              </span>
            ) : (
              <span className="text-[8px] font-display uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <AlertTriangle size={9} /> Not loaded
              </span>
            )}
          </div>
          {nativeStatus?.ready ? (
            <p className="text-[9px] font-tech text-white/40">
              Phi-4-mini loaded in-app. All AI calls route through the bundled model.
            </p>
          ) : nativeStatus?.downloading ? (
            <div>
              <p className="text-[9px] font-tech text-white/40 mb-2">
                Downloading Phi-4-mini model ({nativeDlProgress}%)
              </p>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${nativeDlProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-[9px] font-tech text-white/40 flex-1">
                {nativeStatus?.error ? `Error: ${nativeStatus.error}` : 'Download the Phi-4-mini model (~2.5 GB) to run fully offline.'}
              </p>
              <button
                type="button"
                onClick={handleNativeDownload}
                disabled={nativeStatus?.initializing}
                className="px-4 py-2 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 transition-all text-[8px] font-display uppercase tracking-wider"
              >
                {nativeStatus?.initializing ? 'Loading…' : 'Download Model'}
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-white/40">LL</div>
        <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">
          Local LLM
       </span>
        <div className="h-px flex-1 bg-white/5" />
        <div className="flex items-center gap-2">
          {enabled && <span className="text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10} /> Active</span>}
        </div>
        <button onClick={() => setEnabled(!enabled)} className={`w-12 h-6 rounded-full transition-all ${enabled ? 'bg-emerald-500/40' : 'bg-white/10'}`}>
          <div className={`w-5 h-5 rounded-full transition-all ${enabled ? 'bg-emerald-400 translate-x-6' : 'bg-white/30 translate-x-0.5'}`} />
        </button>
      </div>

      <p className="text-[10px] font-tech text-white/40 mb-5 leading-relaxed">
        Route all AI calls through a local LLM server (LM Studio, Ollama, etc.)
        that exposes an OpenAI-compatible API. When enabled, NEXUS tries your
        local endpoint first, then falls back to WebLLM → NVIDIA.
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
          <label className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1.5 block">Model (optional)</label>
          <input
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="phi-4, llama-3.2-3b, ..."
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={testConnection}
          disabled={testStatus === 'testing'}
          className="px-5 py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 transition-all text-[9px] font-display uppercase tracking-wider flex items-center gap-2"
        >
          {testStatus === 'testing' ? (
            <>Testing…</>
          ) : (
            <><Zap size={12} /> Test Connection</>
          )}
        </button>
        {testStatus === 'success' && (
          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={11} /> {testMsg}
          </span>
        )}
        {testStatus === 'error' && (
          <span className="text-[9px] font-mono text-red-400 flex items-center gap-1">
            <AlertTriangle size={11} /> {testMsg}
          </span>
        )}
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
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
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Operator Designation</label>
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
                <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Operator Profile</span>
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
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border ${archetype.bgClass} ${rankGlow(progression.rank)}`}>
              <ArchetypeIcon size={36} className={archetype.colorClass} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                {userProfile.name || 'Operator_Nexus'}
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level & Rank */}
        <div className="glass rounded-[32px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={18} className={rankColor(progression.rank)} />
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Rank & Level</span>
          </div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className={`text-5xl font-display font-black ${rankColor(progression.rank)}`}>{progression.rank}</span>
              <span className="text-lg font-mono text-white/40 ml-2">Rank</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-white">Lv.{progression.level}</span>
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
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Operator Stats</span>
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

      {/* Neural Settings — NVIDIA API key management */}
      <NeuralSettingsPanel />

      {/* Local LLM — LM Studio / Ollama */}
      <LocalLLMPanel />

      {/* R-09 — Language picker */}
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