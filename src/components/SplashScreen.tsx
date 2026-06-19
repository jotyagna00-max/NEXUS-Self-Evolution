import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 6300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* 1. Ambient Void & Organic Depth */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-[80vw] h-[80vw] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          }}
          initial={{ scale: 0.85 }}
          animate={{ scale: [0.85, 1.1, 1] }}
          transition={{
            duration: 5,
            ease: 'easeInOut',
            times: [0, 0.4, 1],
          }}
        />
      </motion.div>

      {/* 2. Synaptic Ripple & Breathing Eclipse */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Core Spark */}
        <motion.div
          className="w-40 h-40 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.8) 0%, rgba(16,185,129,0.2) 50%, transparent 70%)',
            boxShadow: '0 0 80px rgba(16,185,129,0.4)',
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Conic Eclipse Ring */}
        <motion.div
          className="absolute w-72 h-72 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.6) 15%, transparent 30%, rgba(16,185,129,0.3) 50%, transparent 65%, rgba(16,185,129,0.5) 80%, transparent 100%)',
            maskImage:
              'radial-gradient(circle, transparent 40%, black 41%, black 48%, transparent 49%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 40%, black 41%, black 48%, transparent 49%)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Harmonic Shockwaves */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-24 h-24 rounded-full border border-emerald-500/50"
            style={{ boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: [0, 3.5], opacity: [0.6, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 1.0,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* 3. Staggered Monolithic Typography */}
      <div className="relative z-10 flex flex-col items-center gap-0">
        {/* NEXUS */}
        <motion.h1
          className="font-display text-6xl font-black text-white"
          style={{ letterSpacing: '0.15em' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
            duration: 0.7,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          NEXUS
        </motion.h1>

        {/* EVOLUTION */}
        <motion.h2
          className="font-display text-3xl font-bold mt-2"
          style={{
            letterSpacing: '0.2em',
            background: 'linear-gradient(to bottom, #6ee7b7, #047857)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.4,
            duration: 0.7,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          EVOLUTION
        </motion.h2>

        {/* Powered by Mindraxus */}
        <motion.div
          className="flex items-center gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 2.8,
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <motion.div
            className="w-16 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(16,185,129,0.6), rgba(16,185,129,0.3))',
            }}
            animate={{ opacity: [1, 0.15] }}
            transition={{
              delay: 3.5,
              duration: 1.5,
              ease: 'easeOut',
            }}
          />
          <span
            className="font-display text-[9px] text-emerald-400/60 uppercase select-none"
            style={{ letterSpacing: '0.3em' }}
          >
            Powered by Mindraxus
          </span>
          <motion.div
            className="w-16 h-px"
            style={{
              background:
                'linear-gradient(to left, transparent, rgba(16,185,129,0.6), rgba(16,185,129,0.3))',
            }}
            animate={{ opacity: [1, 0.15] }}
            transition={{
              delay: 3.5,
              duration: 1.5,
              ease: 'easeOut',
            }}
          />
        </motion.div>
      </div>

      {/* 4. Sweeping Solar Flare */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'overlay' }}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          delay: 3.5,
          duration: 1.8,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 25%, rgba(255,255,255,0.15) 50%, rgba(16,185,129,0.3) 75%, transparent 100%)',
            transform: 'skewX(-25deg)',
            transformOrigin: 'center',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
