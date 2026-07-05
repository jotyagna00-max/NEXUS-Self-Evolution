import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowUpCircle, Sparkles, Zap, X, AlertTriangle } from 'lucide-react';
import { useGame } from '../GameContext';

const ICONS: Record<string, React.ReactNode> = {
  achievement: <Trophy size={16} className="text-yellow-400" />,
  level_up: <ArrowUpCircle size={16} className="text-emerald-400" />,
  ascension_ready: <Sparkles size={16} className="text-purple-400" />,
  penalty: <AlertTriangle size={16} className="text-red-400" />,
};

const BG_CLASSES: Record<string, string> = {
  achievement: 'border-yellow-500/30 bg-yellow-500/5',
  level_up: 'border-emerald-500/30 bg-emerald-500/5',
  ascension_ready: 'border-purple-500/30 bg-purple-500/5',
  penalty: 'border-red-500/30 bg-red-500/5',
};

const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useGame();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.slice(-3).reverse().map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`pointer-events-auto rounded-2xl p-4 border ${BG_CLASSES[n.type] || 'border-white/10 bg-white/5'} backdrop-blur-lg`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{ICONS[n.type] || <Zap size={16} className="text-emerald-400" />}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-display font-bold text-white uppercase tracking-wider">{n.title}</p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5 line-clamp-2">{n.description}</p>
                {n.reward && (
                  <div className="flex gap-3 mt-2">
                    {n.reward.credits && <span className="text-[9px] font-mono text-yellow-400">+{n.reward.credits} NC</span>}
                    {n.reward.exp && <span className="text-[9px] font-mono text-emerald-400">+{n.reward.exp} EXP</span>}
                  </div>
                )}
              </div>
              <button onClick={() => dismissNotification(n.id)} className="text-white/20 hover:text-white/50 transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
