import React from 'react';
import { motion } from 'motion/react';

/**
 * Loading skeleton for tab content — replaces generic spinners with a
 * themed shimmer effect that matches the NEXUS glass aesthetic.
 *
 * Renders a set of pulsing placeholder blocks that hint at the layout
 * the user is about to see, reducing perceived load time.
 */

const shimmerBlock = (width: string, height: string, delay: number = 0) => (
  <motion.div
    initial={{ opacity: 0.3 }}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeInOut' }}
    className={`bg-white/[0.04] rounded-2xl border border-white/5`}
    style={{ width, height }}
  />
);

const TabSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in">
      {/* Header block */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-8">
        {shimmerBlock('96px', '96px')}
        <div className="space-y-3">
          {shimmerBlock('200px', '12px')}
          {shimmerBlock('280px', '36px')}
          {shimmerBlock('120px', '10px', 0.2)}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {shimmerBlock('100%', '280px')}
        {shimmerBlock('100%', '280px', 0.3)}
        {shimmerBlock('100%', '200px', 0.1)}
        {shimmerBlock('100%', '200px', 0.4)}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {shimmerBlock('100%', '80px', 0.2)}
        {shimmerBlock('100%', '80px', 0.3)}
        {shimmerBlock('100%', '80px', 0.4)}
      </div>
    </div>
  );
};

export default TabSkeleton;
