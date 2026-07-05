/**
 * AgentConsole — direct line to the specialist agents.
 *
 * Lets the Operator pick from MANAGER / SAGE / TITAN / CHRONOS / SHADOW
 * and chat. Uses the existing `sendTrainerRequest` / `sendCommandToAgent`
 * from GameContext (which routes through AgentOrchestrator → specialist).
 *
 * Why agent tabs and not just one big chat? Because the agents have
 * different "personalities" and you want to talk to THEM directly —
 * SAGE for learning, TITAN for body, SHADOW for the truth you don't
 * want to hear. One fused voice hides that.
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Brain, Dumbbell, Clock, Cpu, Skull, Loader2, ChevronDown } from 'lucide-react';
import { useGame } from '../GameContext';

type AgentKey = 'MANAGER' | 'SAGE' | 'TITAN' | 'CHRONOS' | 'SHADOW';

interface AgentMeta {
  key: AgentKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  blurb: string;
  accent: string;
}

const AGENTS: AgentMeta[] = [
  { key: 'MANAGER', label: 'Manager', icon: Cpu, blurb: 'Supreme orchestrator. Coordinates all specialists.', accent: 'text-emerald-400' },
  { key: 'SAGE',    label: 'Sage',    icon: Brain, blurb: 'Intelligence, learning, books, mental strategies.', accent: 'text-blue-400' },
  { key: 'TITAN',   label: 'Titan',   icon: Dumbbell, blurb: 'Physical training, hypertrophy, recovery, fuel.', accent: 'text-red-400' },
  { key: 'CHRONOS', label: 'Chronos', icon: Clock, blurb: 'Time audits, scheduling, focus windows.', accent: 'text-purple-400' },
  { key: 'SHADOW',  label: 'Shadow',  icon: Skull, blurb: 'Your dark mirror. Antagonistic. Truth that hurts.', accent: 'text-red-500' },
];

interface ChatMsg {
  id: string;
  role: 'user' | 'agent';
  agent: AgentKey;
  text: string;
  pending?: boolean;
}

const AgentConsole: React.FC = () => {
  const {
    stats,
    userProfile,
    protocols,
    selectedCharacter,
    chatHistory,
    sendTrainerRequest,
    sendCommandToAgent,
  } = useGame();
  const [activeAgent, setActiveAgent] = useState<AgentKey>('SAGE');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    if (chatHistory && chatHistory.length > 0) {
      return chatHistory.slice(-10).flatMap((h: any, i: number) => {
        const out: ChatMsg[] = [];
        if (h.command) {
          out.push({ id: `pre_${i}_u`, role: 'user', agent: h.agentType, text: h.command });
        }
        if (h.response) {
          out.push({ id: `pre_${i}_a`, role: 'agent', agent: h.agentType, text: h.response });
        }
        return out;
      });
    }
    return [];
  });
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastChatHistoryLength = useRef(chatHistory?.length || 0);

  // Only append new messages when chatHistory grows (don't replace all messages)
  useEffect(() => {
    if (chatHistory && chatHistory.length > lastChatHistoryLength.current) {
      const newEntries = chatHistory.slice(lastChatHistoryLength.current);
      const newMessages: ChatMsg[] = newEntries.flatMap((h: any, i: number) => {
        const out: ChatMsg[] = [];
        const idx = lastChatHistoryLength.current + i;
        if (h.command) {
          out.push({ id: `pre_${idx}_u`, role: 'user', agent: h.agentType, text: h.command });
        }
        if (h.response) {
          out.push({ id: `pre_${idx}_a`, role: 'agent', agent: h.agentType, text: h.response });
        }
        return out;
      });
      setMessages(prev => [...prev, ...newMessages]);
      lastChatHistoryLength.current = chatHistory.length;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const id = `m_${Date.now()}`;
    setMessages(prev => [...prev, { id, role: 'user', agent: activeAgent, text }]);
    setInput('');
    setSending(true);
    setMessages(prev => [
      ...prev,
      { id: `${id}_r`, role: 'agent', agent: activeAgent, text: '', pending: true },
    ]);
    try {
      // Try the orchestrator route first (routed + coordinated).
      // Falls back to the direct agent endpoint if anything throws.
      try {
        const data = await sendTrainerRequest(text);
        setMessages(prev =>
          prev.map(m =>
            m.id === `${id}_r`
              ? {
                  ...m,
                  text: data.response,
                  agent: (data.agentUsed || activeAgent) as AgentKey,
                  pending: false,
                }
              : m,
          ),
        );
      } catch {
        const direct = await sendCommandToAgent(activeAgent, text);
        setMessages(prev =>
          prev.map(m =>
            m.id === `${id}_r` ? { ...m, text: direct.response, pending: false } : m,
          ),
        );
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === `${id}_r`
            ? { ...m, text: err?.message || 'Neural link unstable.', pending: false }
            : m,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const filtered = messages.filter(m => m.agent === activeAgent).slice(-20);
  const activeMeta = AGENTS.find(a => a.key === activeAgent)!;
  const ActiveIcon = activeMeta.icon;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Cpu size={22} className="text-emerald-400" />
            <div>
              <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 block">
                Neural Link
             </span>
              <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">
                Agent Console
             </h2>
           </div>
         </div>
          <span data-testid="active-agent-indicator" className="text-[9px] font-mono text-white/30">
            Active protocol: {selectedCharacter || 'Ayanokoji'}
         </span>
       </div>
        <p className="text-[10px] font-tech text-white/40 max-w-3xl">
          Speak directly with the specialist agents. Each has its own domain, tone, and
          memory. The Manager routes only when you're not sure who to ask.
       </p>
     </header>

      {/* Agent tabs */}
      <div className="glass rounded-[24px] border border-white/10 p-2 grid grid-cols-2 md:grid-cols-5 gap-2">
        {AGENTS.map(a => {
          const selected = activeAgent === a.key;
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              onClick={() => setActiveAgent(a.key)}
              data-agentkey={a.key}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left ${
                selected
                  ? `bg-emerald-500/10 border-emerald-500/40 ${a.accent}`
                  : 'bg-white/[0.02] border-transparent text-white/40 hover:text-white/70 hover:border-white/10'
              }`}
            >
              <Icon size={16} className={selected ? a.accent : ''} />
              <div className="min-w-0">
                <span className="block text-[10px] font-display uppercase tracking-wider">
                  {a.label}
               </span>
                <span className="block text-[8px] font-tech text-white/30 truncate">
                  {a.blurb}
               </span>
             </div>
           </button>
          );
        })}
     </div>

      {/* Chat surface */}
      <div className="glass rounded-[24px] border border-white/10 overflow-hidden flex flex-col h-[520px]">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ActiveIcon size={16} className={activeMeta.accent} />
            <span className="text-[10px] font-display uppercase tracking-wider text-white/70">
              {activeMeta.label} · Live Channel
           </span>
         </div>
          <span className="text-[8px] font-mono text-white/30">
            STATS {Object.keys(stats).length} · PROTOCOLS {protocols.length}
         </span>
       </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ActiveIcon size={42} className={activeMeta.accent} />
              <p className="text-[11px] font-tech text-white/40 mt-3 max-w-sm">
                The channel is open. Send a message to {activeMeta.label}.
                <br />
                <br />
                Example prompts:
                {activeAgent === 'SAGE' && (
                  <>
                    <br />• What should I read next
                  </>
                )}
                {activeAgent === 'TITAN' && (
                  <>
                    <br />• Can I train today or is it a recovery day
                  </>
                )}
                {activeAgent === 'CHRONOS' && (
                  <>
                    <br />• Audit how I spent my morning
                  </>
                )}
                {activeAgent === 'SHADOW' && (
                  <>
                    <br />• Tell me what I missed this week
                  </>
                )}
                {activeAgent === 'MANAGER' && (
                  <>
                    <br />• I'm overwhelmed — where do I start
                  </>
                )}
             </p>
           </div>
          )}
          <AnimatePresence initial={false}>
            {filtered.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl border ${
                    m.role === 'user'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-50'
                      : 'bg-white/[0.04] border-white/10 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-display uppercase tracking-widest text-white/40">
                      {m.role === 'user'
                        ? `Operator · ${userProfile.name || 'Operator'}`
                        : `${m.agent} · ${AGENTS.find(a => a.key === m.agent)?.label || 'Agent'}`}
                   </span>
                 </div>
                  <div className="text-[12px] font-tech leading-relaxed whitespace-pre-wrap">
                    {m.pending ? (
                      <span className="inline-flex items-center gap-1.5 text-white/40">
                        <Loader2 size={12} className="animate-spin" />
                        Synchronizing…
                     </span>
                    ) : (
                      m.text
                    )}
                 </div>
               </div>
             </motion.div>
            ))}
         </AnimatePresence>
       </div>

        <div className="border-t border-white/5 p-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={`Message ${activeMeta.label}…`}
            rows={1}
            className="flex-1 resize-none bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm font-tech text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40 max-h-32"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="h-12 w-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-black flex items-center justify-center transition-all disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
         </button>
       </div>
     </div>

      <details className="text-[10px] font-tech text-white/40">
        <summary className="cursor-pointer hover:text-white/70 flex items-center gap-1">
          <ChevronDown size={12} /> System prompt context this turn
       </summary>
        <pre className="mt-3 p-3 bg-black/40 border border-white/5 rounded-xl text-[9px] overflow-x-auto whitespace-pre-wrap">
{`OPERATOR: ${userProfile.name || 'Operator'} (${selectedCharacter || 'Ayanokoji'} archetype)
STATS: ${JSON.stringify(stats, null, 2)}
PROFILE: ${JSON.stringify(userProfile, null, 2).slice(0, 280)}…`}
       </pre>
     </details>
   </div>
  );
};

export default AgentConsole;
