import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Send, SkipForward, RotateCcw } from 'lucide-react';
import { useGame } from '../GameContext';
import {
  SHADOW_QUESTIONS,
  ShadowTag,
} from '../services/shadowQuestions';
import { ShadowChatEntry } from '../utils/shadowMemory';
import './ShadowChat.css';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Bootstrap interrogation on first visit
  useEffect(() => {
    if (
      shadowMemory.interrogationStatus !== 'in_progress' &&
      shadowMemory.interrogationStatus !== 'complete'
    ) {
      startShadowInterrogation();
    }
  }, [shadowMemory.interrogationStatus, startShadowInterrogation]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [shadowMemory.exchanges, streamingText, isThinking]);

  const currentQuestion = (() => {
    const idx = shadowMemory.interrogationCurrentIndex ?? 0;
    return idx < SHADOW_QUESTIONS.length ? SHADOW_QUESTIONS[idx] : null;
  })();

  const isInterrogationActive =
    shadowMemory.interrogationStatus === 'in_progress' && !!currentQuestion;

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
    appendShadowChat(shadowMemory, userEntry);

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
        text: fullResponse,
        emotional: fullResponse.includes('!') || fullResponse.includes('?'),
        timestamp: new Date().toISOString(),
      };
      appendShadowChat(shadowMemory, shadowEntry);
    } catch {
      const fallbackEntry: ShadowChatEntry = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'shadow',
        text: '...the link is unstable. Try again.',
        emotional: false,
        timestamp: new Date().toISOString(),
      };
      appendShadowChat(shadowMemory, fallbackEntry);
    } finally {
      setIsThinking(false);
      setStreamingText('');
    }
  }, [shadowMemory, appendShadowChat, streamCommandToAgent]);

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
      {/* Header */}
      <header className="shadow-chat-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Skull size={16} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold uppercase tracking-[0.3em] text-white">
              Shadow <span className="text-red-400">Interface</span>
            </h2>
            <span className="text-[8px] font-tech text-white/30 uppercase tracking-[0.2em]">Dark Mirror Protocol</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Memory badge */}
          <div className="shadow-memory-badge">{shadowMemoryDigest}</div>
          {/* Reset button */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all text-[9px] font-tech uppercase tracking-wider"
            onClick={() => {
              if (window.confirm('Reset Shadow memory? This cannot be undone.')) {
                resetShadowMemory();
                window.location.reload();
              }
            }}
          >
            <RotateCcw size={10} />
            Reset
          </button>
        </div>
      </header>

      {/* Main chat area */}
      <main className="shadow-chat-main">
        {!isChatMode ? (
          /* Interrogation phase */
          <div className="shadow-interrogation-prompt">
            {currentQuestion?.framing && (
              <p className="text-[10px] font-tech text-white/20 italic mb-2 tracking-wider">
                {currentQuestion.framing}
              </p>
            )}
            <p className="shadow-prompt">{currentQuestion?.prompt}</p>
            {currentQuestion?.follow && (
              <p className="text-[9px] font-tech text-white/40 italic mt-3">
                {currentQuestion.follow}
              </p>
            )}
          </div>
        ) : (
          /* Chat mode */
          <div className="shadow-chat-messages">
            {shadowMemory.exchanges.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`shadow-message shadow-message--${entry.role}${entry.emotional ? ' shadow-message--emotional' : ''}`}
              >
                <div className="shadow-message-content">{entry.text}</div>
                <div className="shadow-message-time">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </motion.div>
            ))}

            {/* Streaming indicator */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="shadow-message shadow-message--shadow"
                >
                  {streamingText ? (
                    <div className="shadow-message-content">{streamingText}</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-tech text-white/40 uppercase tracking-[0.3em]">Shadow analyzing</span>
                      <div className="flex gap-1">
                        <span className="thinking-dot" style={{ animationDelay: '0s' }}>.</span>
                        <span className="thinking-dot" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="thinking-dot" style={{ animationDelay: '0.4s' }}>.</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Footer input */}
      <form className="shadow-chat-footer" onSubmit={handleSubmit} onReset={() => setInputValue('')}>
        {isChatMode ? (
          <textarea
            className="shadow-input"
            placeholder="Address the Shadow..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={2}
            maxLength={800}
            disabled={isSubmitting || isThinking}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
        ) : (
          <>
            {currentQuestion?.kind === 'text' && (
              <input
                className="shadow-input shadow-input--text"
                type="text"
                placeholder={currentQuestion.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isSubmitting}
                minLength={currentQuestion.minChars ?? 0}
              />
            )}
            {currentQuestion?.kind === 'single' && (
              <div className="shadow-options">
                {currentQuestion.options?.map((opt) => (
                  <label key={opt.value} className="shadow-option-label">
                    <input
                      type="radio"
                      name="answer"
                      value={opt.value}
                      checked={inputValue === opt.value}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <span>{opt.label}</span>
                    {opt.hint && <span className="shadow-option-hint">({opt.hint})</span>}
                  </label>
                ))}
              </div>
            )}
            {currentQuestion?.kind === 'multi' && (
              <div className="shadow-options">
                {currentQuestion.options?.map((opt) => (
                  <label key={opt.value} className="shadow-option-label">
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={inputValue.split(',').includes(opt.value)}
                      onChange={(e) => {
                        const vals = new Set(inputValue.split(',').map((v) => v.trim()));
                        if (e.target.checked) vals.add(opt.value);
                        else vals.delete(opt.value);
                        setInputValue(Array.from(vals).join(', '));
                      }}
                      disabled={isSubmitting}
                    />
                    <span>{opt.label}</span>
                    {opt.hint && <span className="shadow-option-hint">({opt.hint})</span>}
                  </label>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className={`shadow-submit-btn${isSubmitting || isThinking ? ' shadow-submit-btn--loading' : ''}`}
            disabled={isSubmitting || isThinking}
          >
            {isChatMode ? (
              <span className="flex items-center justify-center gap-2">
                <Send size={12} />
                Send
              </span>
            ) : (
              'Submit Answer'
            )}
          </button>
          {!isChatMode && (
            <button type="button" className="shadow-skip-btn" onClick={handleSkip}>
              <SkipForward size={10} />
              Skip
            </button>
          )}
          <button type="reset" className="shadow-clear-btn" disabled={isSubmitting || isThinking}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShadowChat;
