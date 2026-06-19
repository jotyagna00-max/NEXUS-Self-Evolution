import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface Props {
  count?: number;
  color?: string;
  speed?: number;
}

const ParticleBackground: React.FC<Props> = ({ count = 30, color = 'rgba(16,185,129,0.4)', speed = 1 }) => {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 15 + Math.random() * 30 / speed,
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 20,
    })),
  [count, speed]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, p.drift, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(ParticleBackground);
