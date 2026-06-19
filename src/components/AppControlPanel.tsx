import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Unlock, Smartphone, AlertTriangle } from 'lucide-react';
import { useGame } from '../GameContext';

const AppGovernorItem: React.FC<{ app: any, isLocked: boolean, onToggle: () => void }> = ({ app, isLocked, onToggle }) => (
  <motion.div 
    whileHover={{ scale: 1.05, rotateY: 5 }}
    style={{ perspective: 1000 }}
    className="hologram-card p-6 rounded-2xl overflow-hidden group"
  >
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-all rotate-12">
       <Smartphone size={120} />
    </div>
    
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
           {app.icon}
        </div>
        <div>
          <h4 className="text-white font-display font-bold tracking-tighter uppercase">{app.name}</h4>
          <span className="text-[9px] text-white/30 font-mono">STATUS: {isLocked ? 'BLOCKED_BY_AGENT' : 'ACCESS_GRANTED'}</span>
        </div>
      </div>
      {isLocked ? <Lock className="text-red-500/50" size={20} /> : <Unlock className="text-emerald-500/50" size={20} />}
    </div>

    <button 
      onClick={onToggle}
      className={`w-full py-3 transition-all rounded-xl font-display text-[10px] uppercase tracking-[0.2em] font-black border ${
        isLocked 
          ? 'bg-red-500/10 hover:bg-emerald-500 hover:text-black border-red-500/30 hover:border-emerald-500' 
          : 'bg-emerald-500/10 hover:bg-red-500 hover:text-white border-emerald-500/30 hover:border-red-500'
      }`}
    >
      {isLocked ? 'Bypass Restriction' : 'Reinstate Block'}
    </button>
  </motion.div>
);

const AppControlPanel: React.FC = () => {
  const { appPermissions, toggleAppPermission } = useGame();

  const apps = [
    { name: 'Instagram', icon: '📸' },
    { name: 'Twitter', icon: '🐦' },
    { name: 'TikTok', icon: '🎵' },
    { name: 'YouTube', icon: '📺' },
  ];

  const handleToggle = (appName: string) => {
    toggleAppPermission(appName);
  };

  return (
    <div className="bg-black/40 rounded-2xl border border-white/10 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-400" size={24} />
          <div>
            <h2 className="text-lg font-mono uppercase tracking-widest text-white">App Control Protocol</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-tighter">Agent-Managed Digital Discipline</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {apps.map((app) => {
          const isLocked = !appPermissions[app.name];
          return (
            <AppGovernorItem 
              key={app.name} 
              app={app} 
              isLocked={isLocked} 
              onToggle={() => handleToggle(app.name)} 
            />
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-start">
        <AlertTriangle className="text-yellow-400 shrink-0" size={16} />
        <p className="text-[10px] text-white/60 leading-relaxed">
          <span className="text-yellow-400 font-bold uppercase">System Note:</span> App control is simulated via the Nexus Agent. Granting permission allows the Monitoring Agent to track usage and enforce digital discipline.
        </p>
      </div>
    </div>
  );
};

export default AppControlPanel;
