import React from 'react';
import { motion } from 'motion/react';
import { Swords, Shield, Zap, Trophy, Skull, Activity } from 'lucide-react';
import { useGame } from '../GameContext';

const RaidBossMount: React.FC = () => {
  const { raidBoss } = useGame();

  if (!raidBoss) return null;

  const hpPercent = (raidBoss.currentHp / raidBoss.maxHp) * 100;
  const damageDealt = raidBoss.maxHp - raidBoss.currentHp;
  const progressPercent = (damageDealt / raidBoss.maxHp) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`hologram-card rounded-[32px] p-8 border overflow-hidden transition-all ${
        raidBoss.defeated ? 'border-emerald-500/40' : 'border-red-500/30'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${raidBoss.defeated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {raidBoss.defeated ? <Trophy size={28} /> : <Swords size={28} />}
          </div>
          <div>
            <span className="text-[8px] text-white/30 font-display uppercase tracking-[0.3em]">
              {raidBoss.defeated ? 'Eliminated' : 'Weekly Raid Boss'}
            </span>
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">
              {raidBoss.name}
            </h3>
          </div>
        </div>
        {!raidBoss.defeated && (
          <div className="flex items-center gap-2">
            <Skull size={16} className="text-red-400" />
            <span className="text-sm font-display font-black text-red-400">{raidBoss.currentHp}</span>
            <span className="text-[10px] text-white/30 font-mono">/ {raidBoss.maxHp}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-white/40 font-tech mb-6 leading-relaxed">
        {raidBoss.bossDescription}
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-[9px] mb-2">
          <span className="text-white/30 font-mono">HP</span>
          <span className={`font-mono ${raidBoss.defeated ? 'text-emerald-400' : 'text-red-400'}`}>
            {raidBoss.defeated ? 'DEFEATED' : `${raidBoss.currentHp} remaining`}
          </span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${raidBoss.defeated ? 100 : hpPercent}%` }}
            className={`h-full rounded-full transition-all ${
              raidBoss.defeated
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : hpPercent > 50
                ? 'bg-gradient-to-r from-red-500 to-orange-400'
                : hpPercent > 25
                ? 'bg-gradient-to-r from-orange-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-600 to-red-400'
            }`}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[9px] mb-2">
          <span className="text-white/30 font-mono">Damage Dealt</span>
          <span className="text-yellow-400 font-mono">{damageDealt} / {raidBoss.maxHp}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <Trophy size={14} className="text-yellow-400" />
          <span className="text-[10px] text-yellow-400 font-mono">+{raidBoss.rewardCredits} NC</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <Zap size={14} className="text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-mono">+{raidBoss.rewardExp} EXP</span>
        </div>
        {raidBoss.defeated && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl">
            <Trophy size={14} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-display uppercase tracking-wider">Defeated!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RaidBossMount;
