import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Sword,
  Activity,
  Shield,
  Terminal,
  User,
  ChevronRight,
  Zap,
  Brain,
  Dumbbell,
  Clock,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Monitor,
  Settings,
  Package,
  GitCommit,
  BookOpen,
  Award
} from 'lucide-react';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { useGame } from '../GameContext';

const AgentDashboard: React.FC = () => {
  const { stats, userProfile } = useGame();
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Array<{
    id: string;
    name: string;
    icon: any;
    color: string;
    status: string;
    task: string;
    details: string;
    lastActive: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initOrchestrator = async () => {
      try {
        const orch = new AgentOrchestrator();
        await orch.initialize();
        setOrchestrator(orch);
        // Initialize agent statuses
        initializeAgentStatuses();
      } catch (error) {
        console.error('Failed to initialize agent orchestrator:', error);
      } finally {
        setLoading(false);
      }
    };

    initOrchestrator();
  }, []);

  useEffect(() => {
    if (orchestrator) {
      // Update agent statuses periodically
      const interval = setInterval(() => {
        updateAgentStatuses();
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [orchestrator]);

  const initializeAgentStatuses = () => {
    const initialStatuses = [
      {
        id: 'manager',
        name: 'NEURAL MANAGER',
        icon: Sparkles,
        color: 'text-emerald-400',
        status: 'Online',
        task: 'System Orchestration',
        details: 'Coordinating all agent systems and processing operator requests',
        lastActive: 'Just now'
      },
      {
        id: 'sage',
        name: 'SAGE',
        icon: Brain,
        color: 'text-blue-400',
        status: 'Monitoring',
        task: 'Cognitive Enhancement',
        details: 'Analyzing operator\'s learning patterns and memory retention',
        lastActive: '2m ago'
      },
      {
        id: 'titan',
        name: 'TITAN',
        icon: Dumbbell,
        color: 'text-red-400',
        status: 'Active',
        task: 'Physical Optimization',
        details: 'Tracking strength training progress and recovery metrics',
        lastActive: '1m ago'
      },
      {
        id: 'chronos',
        name: 'CHRONOS',
        icon: Clock,
        color: 'text-yellow-400',
        status: 'Standby',
        task: 'Temporal Optimization',
        details: 'Optimizing operator\'s schedule and timing efficiency',
        lastActive: '3m ago'
      },
      {
        id: 'questGenerator',
        name: 'QUEST GENERATOR',
        icon: Activity,
        color: 'text-purple-400',
        status: 'Ready',
        task: 'Quest Generation',
        details: 'Creating personalized challenges based on operator progress',
        lastActive: '5m ago'
      },
      {
        id: 'notifier',
        name: 'NOTIFIER',
        icon: MessageCircle,
        color: 'text-pink-400',
        status: 'Online',
        task: 'Alert System',
        details: 'Managing notifications and reminders for operator',
        lastActive: 'Just now'
      },
      {
        id: 'motivator',
        name: 'MOTIVATOR',
        icon: Award,
        color: 'text-orange-400',
        status: 'Ready',
        task: 'Motivational Support',
        details: 'Providing encouragement and motivational messages',
        lastActive: '4m ago'
      },
      {
        id: 'statsMonitor',
        name: 'STATS MONITOR',
        icon: Monitor,
        color: 'text-green-400',
        status: 'Analyzing',
        task: 'Performance Analytics',
        details: 'Tracking and analyzing operator\'s stat progression',
        lastActive: '1m ago'
      },
      {
        id: 'hexaGraphUpdater',
        name: 'HEXA GRAPH',
        icon: Package,
        color: 'text-indigo-400',
        status: 'Updating',
        task: 'Visualization Engine',
        details: 'Updating the HexGraph visualization with latest stat data',
        lastActive: 'Just now'
      },
      {
        id: 'progressTracker',
        name: 'PROGRESS TRACKER',
        icon: GitCommit,
        color: 'text-gray-400',
        status: 'Tracking',
        task: 'Progress Analysis',
        details: 'Monitoring long-term progress and milestone achievement',
        lastActive: '2m ago'
      },
      {
        id: 'bookMastery',
        name: 'BOOK MASTERY',
        icon: BookOpen,
        color: 'text-amber-700',
        status: 'Ready',
        task: 'Knowledge Acquisition',
        details: 'Tracking reading progress and comprehension',
        lastActive: '3m ago'
      },
      {
        id: 'rewardPenalty',
        name: 'REWARD/PENALTY',
        icon: Settings,
        color: 'text-gray-500',
        status: 'Balancing',
        task: 'Incentive System',
        details: 'Managing reward and penalty calculations',
        lastActive: '1m ago'
      }
    ];

    setAgentStatuses(initialStatuses);
  };

  const updateAgentStatuses = () => {
    // In a real implementation, this would query each agent for its current status
    // For now, we'll just update timestamps and occasionally change statuses
    setAgentStatuses(prev => {
      return prev.map(agent => {
        // Randomly update status for demo purposes
        const statusOptions = ['Online', 'Active', 'Standby', 'Ready', 'Processing', 'Monitoring', 'Analyzing', 'Updating', 'Tracking'];
        const taskOptions = {
          manager: ['System Orchestration', 'Processing Requests', 'Coordinating Agents'],
          sage: ['Cognitive Enhancement', 'Memory Optimization', 'Learning Strategy'],
          titan: ['Physical Optimization', 'Strength Training', 'Recovery Monitoring'],
          chronos: ['Temporal Optimization', 'Schedule Management', 'Timing Analysis'],
          questGenerator: ['Quest Generation', 'Challenge Design', 'Progress Assessment'],
          notifier: ['Alert System', 'Notification Management', 'Reminder Service'],
          motivator: ['Motivational Support', 'Encouragement Delivery', 'Morale Boosting'],
          statsMonitor: ['Performance Analytics', 'Stat Tracking', 'Trend Analysis'],
          hexaGraphUpdater: ['Visualization Engine', 'HexGraph Updates', 'Stat Visualization'],
          progressTracker: ['Progress Analysis', 'Milestone Tracking', 'Long-term Monitoring'],
          bookMastery: ['Knowledge Acquisition', 'Reading Progress', 'Comprehension Tracking'],
          rewardPenalty: ['Incentive System', 'Reward Calculation', 'Penalty Management']
        };

        // 20% chance to update status
        if (Math.random() < 0.2) {
          return {
            ...agent,
            status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
            task: taskOptions[agent.id as keyof typeof taskOptions][Math.floor(Math.random() * 3)],
            lastActive: Math.random() < 0.5 ? 'Just now' : `${Math.floor(Math.random() * 5) + 1}m ago`
          };
        }

        // Always update lastActive time occasionally
        if (Math.random() < 0.1) {
          return {
            ...agent,
            lastActive: Math.random() < 0.7 ? 'Just now' : `${Math.floor(Math.random() * 5) + 1}m ago`
          };
        }

        return agent;
      });
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <div className="w-12 h-12 border-2 border-emerald-500 rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-mono text-white/40 uppercase">Initializing Neural Network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-black/60 rounded-[40px] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-display uppercase tracking-[0.3em] text-white">Agent Network Status</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-widest">All Systems Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentStatuses.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${agent.color}/20 ${agent.color} flex items-center justify-center`}>
                    <agent.icon size={16} />
                  </div>
                  <div className="flex flex-col">
                        <span className={`text-[8px] font-display uppercase tracking-[0.2em] ${agent.color}`}>{agent.name}</span>
                    <span className="text-[9px] font-mono text-white/40">{agent.task}</span>
                  </div>
                </div>
                <div className={`text-[8px] font-mono ${agent.color}/50`}>{agent.lastActive}</div>
              </div>

              <p className="text-[9px] text-white/60 leading-relaxed font-mono">{agent.details}</p>

              <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div                 className={`h-full bg-gradient-to-r from-transparent via-${agent.color.replace('text-', '')} to-transparent`}
                     style={{ width: '70%' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-black/60 rounded-[40px] border border-white/10">
        <h2 className="text-sm font-display uppercase tracking-[0.3em] text-white mb-4">System Overview</h2>
        <div className="grid grid-cols-2 gap-4 text-[9px] font-mono text-white/40">
          <div>
            <span className="font-display">Active Agents:</span>
            <span className="ml-2">{agentStatuses.filter(a => a.status === 'Active' || a.status === 'Online').length}/{agentStatuses.length}</span>
          </div>
          <div>
            <span className="font-display">System Load:</span>
            <span className="ml-2 text-emerald-400">Optimal</span>
          </div>
          <div>
            <span className="font-display">Neural Sync:</span>
            <span className="ml-2 text-emerald-400">98.4%</span>
          </div>
          <div>
            <span className="font-display">Response Time:</span>
            <span className="ml-2 text-emerald-400">12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;