import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../GameContext';
import {
  SHADOW_QUESTIONS,
  ShadowQuestion,
  ShadowTag,
} from '../services/shadowQuestions';
import { ShadowChatEntry, ShadowMemory as ShadowMemoryT } from '../utils/shadowMemory';
import './ShadowChat.css';

/**
 * ShadowChat – main UI for interacting with the Shadow agent.
 *
 * Behavior:
 *   1. 
 *   1. On first load, begins interrogation (if not yet completed).
 *   2. Shows one question at a time; user answers → advances index.
 *   3. Once interrogation completes → switches to free-form chat mode.
 *   4. Every turn (question answer or chat message) is persisted via
 *      appendShadowChat / recordShadowAnswer so the Shadow builds long-term memory.
 *   5. UI includes a badge that shows a one-line digest of what Shadow knows.
 */
export const ShadowChat: React.FC = () => {
  const {
    shadowMemory,
    startShadowInterrogation,
    setShadowInterrogationIndex,
    recordShadowAnswer,
    appendShadowChat,
    shadowMemoryDigest,
    resetShadowMemory,
    markShadowInterrogationComplete,
  } = useGame();

  // Local UI state
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(shadowMemory.interrogationCurrentIndex ?? 0);

  // Simple placeholder response generator - in reality this would call the Shadow agent backend
  const generateShadowResponse = useCallback((userInput: string, memory: ShadowMemoryT): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Simple pattern matching for demo purposes
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "State your purpose.";
    }
    if (lowerInput.includes('who are you') || lowerInput.includes('what are you')) {
      return "I am SHADOW. I know what you hide.";
    }
    if (lowerInput.includes('help') || lowerInput.includes('lost')) {
      return "The path forward is through discipline. State your weakness.";
    }
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return "Do not thank me. Prove your worth through action.";
    }
    if (memory.answers?.callsign && lowerInput.includes(memory.answers.callsign.toLowerCase())) {
      return `...you speak your designation. Continue.`;
    }
    
    // Default responses - pull from memory if available
    const aspirations = memory.answers?.identity_aspiration;
    if (aspirations) {
      return `You seek to ${aspirations.toLowerCase()}. Prove it.`;
    }
    
    const weakSpot = memory.answers?.weak_spot;
    if (weakSpot) {
      return `Your ${weakSpot.toLowerCase()} will be exploited. Strengthen it.`;
    }
    
    // Generic responses
    const responses = [
      "Continue.",
      "Explain further.",
      "Interesting.",
      "Your weakness is noted.",
      "State your objective.",
      "Persistence is observed.",
      "The system records this.",
      "Affirmation requires evidence.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  // ------------------------------------------------------------------------
  // Lifecycle – bootstrap interrogation on first visit
  // ------------------------------------------------------------------------
  useEffect(() => {
    // If interrogation never started and not complete → start it
    if (
      shadowMemory.interrogationStatus !== 'in_progress' &&
      shadowMemory.interrogationStatus !== 'complete'
    ) {
      startShadowInterrogation();
    }
  }, [shadowMemory.interrogationStatus, startShadowInterrogation]);

  // ------------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------------
  const currentQuestion = (() => {
    const idx = shadowMemory.interrogationCurrentIndex ?? 0;
    return idx < SHADOW_QUESTIONS.length ? SHADOW_QUESTIONS[idx] : null;
  })();

  const isInterrogationActive =
    shadowMemory.interrogationStatus === 'in_progress' && !!currentQuestion;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !inputValue.trim()) return;

    setIsSubmitting(true);
    const value = inputValue.trim();
    setInputValue('');

    try {
      if (isChatMode) {
        // -------- Chat mode --------
        // Append user message
        const userEntry: ShadowChatEntry = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'user',
          text: value,
          emotional: false, // TODO: simple sentiment detection
          timestamp: new Date().toISOString(),
        };
        appendShadowChat(shadowMemory, userEntry);

        // Generate Shadow response (placeholder until real agent integration)
        const shadowResponse = generateShadowResponse(value, shadowMemory);
        const shadowEntry: ShadowChatEntry = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'shadow',
          text: shadowResponse,
          emotional: shadowResponse.includes('*') || shadowResponse.includes('!') || shadowResponse.includes('?'), // crude emotional detection
          timestamp: new Date().toISOString(),
        };
        appendShadowChat(shadowMemory, shadowEntry);
      } else {
        // -------- Interrogation mode --------
        if (!currentQuestion) {
          setIsSubmitting(false);
          return;
        }

        // Record answer based on question type
        let answer: string | string[] | undefined = value;
        if (currentQuestion.kind === 'single' || currentQuestion.kind === 'multi') {
          // For MC questions, value should be the selected option's value
          answer = value; // Assume value is already the option value from UI
        }

        recordShadowAnswer(currentQuestion.tag as ShadowTag, answer);

        // Advance to next question
        const nextIndex = (shadowMemory.interrogationCurrentIndex ?? 0) + 1;
        if (nextIndex >= SHADOW_QUESTIONS.length) {
          // Interrogation complete
          const callsign =
            shadowMemory.answers?.callsign ?? 'Operator'; // fallback
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
    shadowMemory.interrogationCurrentIndex,
    recordShadowAnswer,
    setShadowInterrogationIndex,
    appendShadowChat,
    markShadowInterrogationComplete,
    generateShadowResponse,
  ]);

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------
  return (
    <div className="shadow-chat-container">
      <header className="shadow-chat-header">
        <h2>SHADOW</h2>
        <div className="shadow-memory-badge">{shadowMemoryDigest}</div>
        <button
          className="shadow-reset-btn"
          onClick={() => {
            if (window.confirm('Reset Shadow memory? This cannot be undone.')) {
              resetShadowMemory();
              window.location.reload();
            }
          }}
        >
          ⟲ Reset
        </button>
      </header>

      <main className="shadow-chat-main">
        {isChatMode ? (
          <div className="shadow-chat-messages">
            {/* Render conversation history */}
            {shadowMemory.exchanges.map((entry) => (
              <div
                key={entry.id}
                className={`shadow-message shadow-message--${entry.role}${
                  entry.emotional ? ' shadow-message--emotional' : ''
                }`}
              >
                <div className="shadow-message-content">{entry.text}</div>
                <div className="shadow-message-time">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="shadow-interrogation-prompt">
            <p className="shadow-framing">{currentQuestion?.framing}</p>
            <p className="shadow-prompt">{currentQuestion?.prompt}</p>
          </div>
        )}

        {!isChatMode && currentQuestion?.follow && (
          <p className="shadow-follow">{currentQuestion.follow}</p>
        )}
      </main>

      <form
        className="shadow-chat-footer"
        onSubmit={handleSubmit}
        onReset={() => setInputValue('')}
      >
        {isChatMode ? (
          <textarea
            className="shadow-input"
            placeholder="Type your message to Shadow..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={2}
            maxLength={500}
            disabled={isSubmitting}
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
                    {opt.hint && (
                      <span className="shadow-option-hint">({opt.hint})</span>
                    )}
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
                      // For simplicity, we store as comma-separated string
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
                    {opt.hint && (
                      <span className="shadow-option-hint">({opt.hint})</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          className={`shadow-submit-btn${isSubmitting ? ' shadow-submit-btn--loading' : ''}`}
          disabled={isSubmitting}
        >
          {isChatMode ? 'Send' : 'Submit Answer'}
        </button>
        {!isChatMode && (
          <button
            type="button"
            className="shadow-skip-btn"
            onClick={() => {
              // Skip current question → advance to next
              const nextIndex = (shadowMemory.interrogationCurrentIndex ?? 0) + 1;
              if (nextIndex >= SHADOW_QUESTIONS.length) {
                // Treat skip-all as complete with anonymous callsign
                markShadowInterrogationComplete(null);
                setIsChatMode(true);
              } else {
                setShadowInterrogationIndex(nextIndex);
              }
            }}
          >
            Skip Question
          </button>
        )}
        <button
          type="reset"
          className="shadow-clear-btn"
          disabled={isSubmitting}
        >
          Clear
        </button>
      </form>
    </div>
  );
};

export default ShadowChat;