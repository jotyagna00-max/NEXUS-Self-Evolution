import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Send, SkipForward, RotateCcw, User, Wifi, WifiOff, Cpu, Trash2, ChevronDown } from 'lucide-react';
import { useGame } from '../GameContext';
import {
  SHADOW_QUESTIONS,
  ShadowTag,
} from '../services/shadowQuestions';
import { ShadowChatEntry } from '../utils/shadowMemory';
import { getNativeLLMStatus } from '../services/nativeLLMBridge';
import { isLLMReady, getLLMModeLabel } from '../services/openaiAgentService';
import ConfirmDialog from './ConfirmDialog';
import './ShadowChat.css';

const PERSONA_META: Record<string, { name: string; color: string; desc: string }> = {
  mirror:     { name: 'The Mirror',     color: '#94a3b8', desc: 'Cold, analytical, brutally honest' },
  mentor:     { name: 'The Mentor',     color: '#3b82f6', desc: 'Socratic guide, wise and patient' },
  rival:      { name: 'The Rival',      color: '#ef4444', desc: 'Competitive, relentless, sharp' },
  commander:  { name: 'The Commander',  color: '#f59e0b', desc: 'Direct orders, no tolerance for weakness' },
  confidant:  { name: 'The Confidant',  color: '#10b981', desc: 'Empathetic, trusted inner voice' },
  strategist: { name: 'The Strategist', color: '#a855f7', desc: 'Hyper-logical, pattern-seeking' },
};

function safeTime(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ShadowChat: React.FC = () => {
  const {
    shadowMemory,
    stats,
    startShadowInterrogation,
    setShadowInterrogationIndex,
    recordShadowAnswer,
    appendShadowChat,
    shadowMemoryDigest,
    resetShadowMemory,
    markShadowInterrogationComplete,
    streamCommandToAgent,
  } = useGame();

  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [shadowPersona, setShadowPersona] = useState(() => localStorage.getItem('shadowPersona') || 'mirror');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [llmReady, setLlmReady] = useState(false);
  const [personaDropdown, setPersonaDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (
      shadowMemory.interrogationStatus !== 'in_progress' &&
      shadowMemory.interrogationStatus !== 'complete'
    ) {
      startShadowInterrogation();
    }
  }, [shadowMemory.interrogationStatus, startShadowInterrogation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [shadowMemory.exchanges, streamingText, isThinking]);

  useEffect(() => {
    const checkLlm = async () => {
      const ready = isLLMReady();
      setLlmReady(ready);
    };
    checkLlm();
    const interval = setInterval(checkLlm, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = (() => {
    const idx = shadowMemory.interrogationCurrentIndex ?? 0;
    return idx < SHADOW_QUESTIONS.length ? SHADOW_QUESTIONS[idx] : null;
  })();

  const isInterrogationActive =
    shadowMemory.interrogationStatus === 'in_progress' && !!currentQuestion;

  const persona = PERSONA_META[shadowPersona] || PERSONA_META.mirror;

  const handleSendChatMessage = useCallback(async (message: string) => {
    setIsThinking(true);
    setStreamingText('');

    const userEntry: ShadowChatEntry = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: message,
      emotional: false,
      timestamp: new Date().toISOString(),
    };
    appendShadowChat(userEntry);

    let fullResponse = '';

    try {
      await streamCommandToAgent(
        'SHADOW',
        message,
        (chunk: string) => {
          fullResponse += chunk;
          setStreamingText(fullResponse);
        }
      );

      const shadowEntry: ShadowChatEntry = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'shadow',
        text: fullResponse || '...',
        emotional: fullResponse.includes('!') || fullResponse.includes('?'),
        timestamp: new Date().toISOString(),
      };
      appendShadowChat(shadowEntry);
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown error';
      const fallbackEntry: ShadowChatEntry = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'shadow',
        text: `Error: ${errorMsg}`,
        emotional: false,
        timestamp: new Date().toISOString(),
      };
      appendShadowChat(fallbackEntry);
    } finally {
      setIsThinking(false);
      setStreamingText('');
    }
  }, [appendShadowChat, streamCommandToAgent, llmReady]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim()) return;

    setIsSubmitting(true);
    const value = inputValue.trim();
    setInputValue('');

    try {
      if (isChatMode) {
        await handleSendChatMessage(value);
      } else {
        if (!currentQuestion) {
          setIsSubmitting(false);
          return;
        }

        recordShadowAnswer(currentQuestion.tag as ShadowTag, value);

        const nextIndex = (shadowMemory.interrogationCurrentIndex ?? 0) + 1;
        if (nextIndex >= SHADOW_QUESTIONS.length) {
          const callsign = shadowMemory.answers?.callsign ?? 'Operator';
          markShadowInterrogationComplete(callsign);
          setIsChatMode(true);
        } else {
          setShadowInterrogationIndex(nextIndex);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    inputValue,
    isSubmitting,
    isChatMode,
    shadowMemory,
    currentQuestion,
    recordShadowAnswer,
    setShadowInterrogationIndex,
    markShadowInterrogationComplete,
    handleSendChatMessage,
  ]);

  const handleSkip = () => {
    const nextIndex = (shadowMemory.interrogationCurrentIndex ?? 0) + 1;
    if (nextIndex >= SHADOW_QUESTIONS.length) {
      markShadowInterrogationComplete(null);
      setIsChatMode(true);
    } else {
      setShadowInterrogationIndex(nextIndex);
    }
  };

  return (
    <div className="shadow-chat-container">
      {/* ── Header ── */}
      <header className="shadow-chat-header">
        <div className="shadow-header-left">
          <div className="shadow-avatar-circle" style={{ borderColor: persona.color + '40', background: persona.color + '0d' }}>
            <Skull size={18} style={{ color: persona.color }} />
          </div>
          <div className="shadow-header-info">
            <h2 className="shadow-title">
              Shadow <span style={{ color: persona.color }}>Interface</span>
            </h2>
            <div className="shadow-subtitle-row">
              <span className="shadow-persona-name" style={{ color: persona.color }}>{persona.name}</span>
              <span className="shadow-dot-sep">·</span>
              <span className="shadow-subtitle">{persona.desc}</span>
            </div>
          </div>
        </div>

        <div className="shadow-header-right">
          {/* LLM Connection Status */}
          <div className={`shadow-llm-status ${llmReady ? 'connected' : 'disconnected'}`}>
            {llmReady ? <Wifi size={11} /> : <WifiOff size={11} />}
            <span>{llmReady ? getLLMModeLabel() : 'No AI'}</span>
          </div>

          {/* Persona selector dropdown */}
          <div className="shadow-persona-dropdown-wrapper">
            <button
              className="shadow-persona-trigger"
              onClick={() => setPersonaDropdown(!personaDropdown)}
              style={{ borderColor: persona.color + '30' }}
            >
              <span className="shadow-persona-dot" style={{ background: persona.color }} />
              <span>{persona.name}</span>
              <ChevronDown size={10} className={personaDropdown ? 'rotated' : ''} />
            </button>
            <AnimatePresence>
              {personaDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="shadow-persona-menu"
                >
                  {Object.entries(PERSONA_META).map(([id, p]) => (
                    <button
                      key={id}
                      className={`shadow-persona-option ${shadowPersona === id ? 'active' : ''}`}
                      onClick={() => {
                        setShadowPersona(id);
                        localStorage.setItem('shadowPersona', id);
                        setPersonaDropdown(false);
                      }}
                    >
                      <span className="shadow-persona-dot" style={{ background: p.color }} />
                      <div>
                        <span className="shadow-persona-opt-name">{p.name}</span>
                        <span className="shadow-persona-opt-desc">{p.desc}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset */}
          <button
            className="shadow-icon-btn"
            onClick={() => setShowResetConfirm(true)}
            title="Reset Shadow Memory"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </header>

      {/* ── Memory bar ── */}
      {shadowMemoryDigest && (
        <div className="shadow-memory-bar">
          <Cpu size={9} className="text-white/20" />
          <span>{shadowMemoryDigest}</span>
        </div>
      )}

      {/* ── Main chat area ── */}
      <main className="shadow-chat-main">
        {!isChatMode ? (
          <div className="shadow-interrogation-phase">
            <div className="shadow-interrogation-card">
              <div className="shadow-interrogation-progress">
                {SHADOW_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`shadow-progress-dot ${
                      i < (shadowMemory.interrogationCurrentIndex ?? 0) ? 'done' :
                      i === (shadowMemory.interrogationCurrentIndex ?? 0) ? 'current' : ''
                    }`}
                  />
                ))}
              </div>
              {currentQuestion?.framing && (
                <p className="shadow-framing">{currentQuestion.framing}</p>
              )}
              <p className="shadow-prompt">{currentQuestion?.prompt}</p>
              {currentQuestion?.follow && (
                <p className="shadow-follow">{currentQuestion.follow}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="shadow-chat-messages">
            {shadowMemory.exchanges.length === 0 && !isThinking && (
              <div className="shadow-empty-state">
                <Skull size={32} style={{ color: persona.color + '60' }} />
                <p>The Shadow awaits your first message.</p>
                <span>Speak honestly. It already knows the difference.</span>
              </div>
            )}
            {shadowMemory.exchanges.map((entry) => {
              const isUser = entry.role === 'user';
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`shadow-msg ${isUser ? 'shadow-msg--user' : 'shadow-msg--shadow'}`}
                >
                  <div className="shadow-msg-avatar" style={isUser ? {} : { borderColor: persona.color + '30', background: persona.color + '0d' }}>
                    {isUser ? <User size={12} className="text-emerald-400" /> : <Skull size={12} style={{ color: persona.color }} />}
                  </div>
                  <div className="shadow-msg-body">
                    <div className="shadow-msg-text">{entry.text}</div>
                    {safeTime(entry.timestamp) && (
                      <div className="shadow-msg-time">{safeTime(entry.timestamp)}</div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Streaming / thinking indicator */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="shadow-msg shadow-msg--shadow"
                >
                  <div className="shadow-msg-avatar" style={{ borderColor: persona.color + '30', background: persona.color + '0d' }}>
                    <Skull size={12} style={{ color: persona.color }} />
                  </div>
                  <div className="shadow-msg-body">
                    {streamingText ? (
                      <div className="shadow-msg-text">{streamingText}<span className="shadow-cursor" /></div>
                    ) : (
                      <div className="shadow-typing">
                        <span className="shadow-typing-dot" style={{ animationDelay: '0s' }} />
                        <span className="shadow-typing-dot" style={{ animationDelay: '0.15s' }} />
                        <span className="shadow-typing-dot" style={{ animationDelay: '0.3s' }} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* ── Footer input ── */}
      <form className="shadow-chat-footer" onSubmit={handleSubmit} onReset={() => setInputValue('')}>
        {isChatMode ? (
          <div className="shadow-input-row">
            <textarea
              ref={inputRef}
              className="shadow-input"
              placeholder={llmReady ? "Address the Shadow..." : "No AI configured. Go to Profile → Custom LLM to add your API key..."}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              rows={1}
              maxLength={800}
              disabled={isSubmitting || isThinking}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <button
              type="submit"
              className="shadow-send-btn"
              disabled={isSubmitting || isThinking || !inputValue.trim()}
            >
              <Send size={14} />
            </button>
          </div>
        ) : (
          <>
            {currentQuestion?.kind === 'text' && (
              <input
                className="shadow-input shadow-input--text"
                type="text"
                placeholder={currentQuestion.placeholder}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isSubmitting}
                minLength={currentQuestion.minChars ?? 0}
              />
            )}
            {currentQuestion?.kind === 'single' && (
              <div className="shadow-options">
                {currentQuestion.options?.map(opt => (
                  <label key={opt.value} className="shadow-option-label">
                    <input type="radio" name="answer" value={opt.value}
                      checked={inputValue === opt.value}
                      onChange={e => setInputValue(e.target.value)} disabled={isSubmitting} />
                    <span>{opt.label}</span>
                    {opt.hint && <span className="shadow-option-hint">({opt.hint})</span>}
                  </label>
                ))}
              </div>
            )}
            {currentQuestion?.kind === 'multi' && (
              <div className="shadow-options">
                {currentQuestion.options?.map(opt => (
                  <label key={opt.value} className="shadow-option-label">
                    <input type="checkbox" value={opt.value}
                      checked={inputValue.split(',').includes(opt.value)}
                      onChange={e => {
                        const vals = new Set(inputValue.split(',').map(v => v.trim()));
                        if (e.target.checked) vals.add(opt.value);
                        else vals.delete(opt.value);
                        setInputValue(Array.from(vals).join(', '));
                      }}
                      disabled={isSubmitting} />
                    <span>{opt.label}</span>
                    {opt.hint && <span className="shadow-option-hint">({opt.hint})</span>}
                  </label>
                ))}
              </div>
            )}
            <div className="shadow-action-row">
              <button type="submit" className="shadow-submit-btn" disabled={isSubmitting}>
                Submit Answer
              </button>
              <button type="button" className="shadow-skip-btn" onClick={handleSkip}>
                <SkipForward size={10} /> Skip
              </button>
            </div>
          </>
        )}
      </form>

      <ConfirmDialog
        open={showResetConfirm}
        onConfirm={() => { resetShadowMemory(); window.location.reload(); }}
        onCancel={() => setShowResetConfirm(false)}
        title="Reset Shadow Memory?"
        description="This will erase all Shadow conversation history and interrogation progress. This cannot be undone."
        confirmLabel="Reset Memory"
        variant="danger"
      />
    </div>
  );
};

export default ShadowChat;
