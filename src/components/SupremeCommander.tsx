import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Terminal, X, Volume2, Cpu, Zap, Shield, Activity, Network, Brain, Dumbbell, Award, Monitor, Sparkles } from 'lucide-react';
import { useGame } from '../GameContext';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';

const Waveform = () => (
  <div className="flex items-center justify-center gap-1 h-12">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          height: [4, Math.random() * 40 + 10, 4],
          opacity: [0.2, 1, 0.2]
        }}
        transition={{ 
          duration: 0.5 + Math.random(), 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full"
      />
    ))}
  </div>
);

const AGENT_INDICATORS = [
  { name: 'MANAGER', icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { name: 'SAGE', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'TITAN', icon: Dumbbell, color: 'text-red-400', bg: 'bg-red-500/10' },
  { name: 'MOTIVATOR', icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { name: 'STATS', icon: Monitor, color: 'text-green-400', bg: 'bg-green-500/10' },
];

const SupremeCommander: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { stats } = useGame();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Web Speech API setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = useRef<any>(null);

  useEffect(() => {
    const initOrchestrator = async () => {
      const orch = new AgentOrchestrator();
      await orch.initialize();
      setOrchestrator(orch);
    };
    initOrchestrator();
  }, []);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(text);
        
        if (event.results[0].isFinal) {
          handleVoiceCommand(text);
        }
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setResponse("Neural link denied. Microphone access required.");
        } else {
          setResponse(`Neural link error: ${event.error}`);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const handleVoiceCommand = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResponse('');
    setActiveAgents([]);
    
    let fullResponse = '';
    let spokenText = '';
    const sentenceEndRegex = /[.!?]\s/;

    try {
      // Determine which agents should be active based on command
      const agents: string[] = ['MANAGER'];
      if (text.toLowerCase().includes('strength') || text.toLowerCase().includes('workout')) {
        agents.push('TITAN');
      }
      if (text.toLowerCase().includes('focus') || text.toLowerCase().includes('mind')) {
        agents.push('SAGE');
      }
      if (text.toLowerCase().includes('motivate') || text.toLowerCase().includes('encourage')) {
        agents.push('MOTIVATOR');
      }
      if (text.toLowerCase().includes('stats') || text.toLowerCase().includes('progress')) {
        agents.push('STATS');
      }
      
      setActiveAgents(agents);

      if (orchestrator) {
        const context = {
          stats,
          profile: {},
          quests: [],
          enhancedQuests: [],
          tasks: [],
        };

        fullResponse = await orchestrator.processUserMessage(text, context);
      } else {
        fullResponse = "Neural orchestrator not initialized. Please wait...";
      }

      setResponse(fullResponse);

      // Speak the response
      const utterance = new SpeechSynthesisUtterance(fullResponse);
      utterance.pitch = 0.9;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (error: any) {
      const errorMsg = error.message || "Neural link unstable. Command synchronization failed.";
      setResponse(errorMsg);
      const errorUtterance = new SpeechSynthesisUtterance(errorMsg);
      window.speechSynthesis.speak(errorUtterance);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognition.current) {
      setResponse("Neural link hardware not detected. (Speech recognition not supported in this browser)");
      return;
    }

    if (isListening) {
      try {
        recognition.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    } else {
      setTranscript('');
      setResponse('');
      setActiveAgents([]);
      try {
        recognition.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
        setIsListening(false);
        setResponse("Neural link initialization failed. Please try again.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 pointer-events-none" />

      <button
        onClick={onClose}
        className="absolute top-10 right-10 p-4 glass border border-white/10 rounded-full text-white/40 hover:text-white transition-all z-50 hover:bg-white/5"
      >
        <X size={32} />
      </button>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Left Panel - Neural Stats */}
        <div className="lg:col-span-3 space-y-8 hidden lg:block">
          <div className="glass-emerald p-8 rounded-[40px] border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-8">
              <Cpu className="text-emerald-400" size={24} />
              <h3 className="font-display text-sm uppercase tracking-[0.3em] text-emerald-400">Neural Core</h3>
            </div>
            <div className="space-y-6">
              {Object.entries(stats || {}).slice(0, 4).map(([key, val]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40">
                    <span>{key}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400/50" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Agents */}
          <div className="glass p-8 rounded-[40px] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <Network className="text-blue-400" size={24} />
              <h3 className="font-display text-sm uppercase tracking-[0.3em] text-blue-400">Active Agents</h3>
            </div>
            <div className="space-y-3">
              {AGENT_INDICATORS.map((agent) => {
                const isActive = activeAgents.includes(agent.name);
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.name}
                    animate={{ opacity: isActive ? 1 : 0.4 }}
                    className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${isActive ? agent.bg + ' border border-current' : 'bg-white/5 border border-white/10'}`}
                  >
                    <Icon size={16} className={agent.color} />
                    <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">{agent.name}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse" />}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Panel - Voice Interface */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-12">
          <div className="relative w-full">
            <div className={`absolute inset-0 rounded-full blur-[40px] transition-all duration-500 ${
              isListening ? 'bg-red-500/40' : isProcessing ? 'bg-blue-500/40' : 'bg-emerald-500/20'
            }`} />
            
            <button
              onClick={toggleListening}
              className={`w-full max-w-xs mx-auto flex flex-col items-center justify-center aspect-square rounded-full glass border-4 transition-all duration-500 arc-pulse relative z-10 ${
                isListening ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 
                isProcessing ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.4)]' : 
                'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:border-emerald-500'
              }`}
            >
              {isListening ? (
                <MicOff size={80} className="text-red-500" />
              ) : (
                <Mic size={80} className="text-emerald-400" />
              )}
              <span className={`text-[12px] font-display uppercase tracking-[0.4em] mt-6 ${
                isListening ? 'text-red-400' : 'text-emerald-500/50'
              }`}>
                {isListening ? 'LISTENING' : 'TAP TO SPEAK'}
              </span>
            </button>
          </div>

          <div className="text-center space-y-4 w-full">
            <div className="h-12">
              <AnimatePresence>
                {transcript && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white/80 font-tech italic text-lg leading-relaxed px-6"
                  >
                    "{transcript}"
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {isProcessing && <Waveform />}
          </div>
        </div>

        {/* Right Panel - Response Display */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="flex-1 glass rounded-[40px] border border-white/10 flex flex-col overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-yellow-400" />
                <span className="font-display text-[10px] uppercase tracking-[0.3em] text-white">Processing</span>
              </div>
              <Activity size={18} className={`${isProcessing ? 'text-emerald-500 animate-pulse' : 'text-white/20'}`} />
            </div>

            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 font-mono text-xs custom-scrollbar">
              {isProcessing && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-3 text-blue-400"
                >
                  <Terminal size={14} />
                  <span>Accessing Neural Network...</span>
                </motion.div>
              )}

              {response && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 glass-emerald rounded-2xl border border-emerald-500/30 text-emerald-100 text-sm leading-relaxed"
                >
                  <div className="flex items-center gap-2 mb-4 text-emerald-400/70">
                    <Volume2 size={16} />
                    <span className="text-[10px] uppercase tracking-widest">NEXUS Response</span>
                  </div>
                  {response}
                </motion.div>
              )}

              {!response && !isProcessing && (
                <div className="flex flex-col items-center justify-center h-full text-center text-white/30">
                  <Terminal size={32} className="mb-4 opacity-20" />
                  <p className="text-[10px] uppercase tracking-widest">Awaiting voice command</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SupremeCommander;
