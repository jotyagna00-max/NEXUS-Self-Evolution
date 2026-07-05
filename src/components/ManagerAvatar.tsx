import React from 'react';
import { Tooltip } from './Tooltip';
import { getArchetype } from '../services/archetypes';

interface ManagerAvatarProps {
  archetypeId: string | null | undefined;
  size?: 'sm' | 'md';
}

/**
 * Renders the active Manager archetype as a small chip. Designed to sit in the
 * app header next to the operator identity, surfacing whose voice is in charge.
 */
const ManagerAvatar: React.FC<ManagerAvatarProps> = ({ archetypeId, size = 'md' }) => {
  const archetype = getArchetype(archetypeId);
  const Icon = archetype.icon;
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  const iconSize = size === 'sm' ? 18 : 22;

  return (
    <Tooltip content={`${archetype.displayName} · ${archetype.shortLabel}`}>
      <div className="flex items-center gap-3">
        <div className={`flex flex-col text-right`}>
          <span className="text-[8px] text-white/40 uppercase tracking-[0.3em] font-display">Manager</span>
          <span className={`text-sm font-display font-black uppercase tracking-tight ${archetype.colorClass}`}>
            {archetype.voiceName}
          </span>
        </div>
        <div className={`${dim} rounded-xl ${archetype.bgClass} border flex items-center justify-center relative overflow-hidden group/avatar transition-all`}>
          <div className="absolute inset-0 bg-white/5 group-hover/avatar:bg-white/10 transition-colors" />
          <Icon size={iconSize} className={`${archetype.colorClass} relative z-10`} />
        </div>
      </div>
    </Tooltip>
  );
};

export default ManagerAvatar;
