import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * NEXUS Cinematic Boot Sequence v2
 * 
 * Choreography (4.5s total — punchy, not drawn-out):
 * 0.0s — Void. Pure black. Tension.
 * 0.3s — A single ember ignites from center (scale 0→1 spring)
 * 0.6s — Ember pulses, emitting a shockwave ring
 * 1.0s — Glitch-reveal of "NEXUS" — each letter pops in with staggered spring
 * 1.8s — Horizontal circuit line bisects the screen (emerald trace)
 * 2.2s — "SELF-EVOLUTION SYSTEM" types in character-by-character
 * 2.8s — HUD ring constellation fades in around the core
 * 3.2s — Particles burst outward from center
 * 3.8s — Everything stabilizes — clean, still, powerful
 * 4.5s — Auto-dismiss (or tap to skip anytime)
 */

const NEXUS_LETTERS = ['N', 'E', 'X', 'U', 'S'];
const SUB_TEXT = 'SELF-EVOLUTION SYSTEM';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [skipReady, setSkipReady] = useState(false);

  // Allow tap-to-skip after 1s (prevents accidental tap during mount)
  useEffect(() => {
    const t = setTimeout(() => setSkipReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss at 4.5s
  useEffect(() => {
    const timer = setTimeout(onComplete, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    if (skipReady) onComplete();
  }, [skipReady, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden select-none"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      onClick={handleSkip}
      style={{ cursor: skipReady ? 'pointer' : 'default' }}
    >
      {/* ===== PHASE 0: Void tension — subtle vignette breathing ===== */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 1] }}
        transition={{ duration: 1.5, times: [0, 0.3, 1], ease: 'easeOut' }}
      />

      {/* ===== PHASE 1: Ember ignition ===== */}
      <motion.div
        className="absolute"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 20px #10b981, 0 0 60px rgba(16,185,129,0.5)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1, 2.5, 1.8],
          opacity: [0, 1, 0.8, 1],
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.2, 0.5, 1],
          ease: [0.23, 1, 0.32, 1],
        }}
      />

      {/* ===== PHASE 1b: Shockwave ring from ember ===== */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          border: '1px solid rgba(16,185,129,0.6)',
          boxShadow: '0 0 40px rgba(16,185,129,0.15), inset 0 0 40px rgba(16,185,129,0.05)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 2.5], opacity: [0.8, 0.4, 0] }}
        transition={{ delay: 0.5, duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
      />

      {/* Second shockwave — delayed, thinner */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          border: '1px solid rgba(16,185,129,0.3)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 3.5], opacity: [0.5, 0.2, 0] }}
        transition={{ delay: 0.7, duration: 1.8, ease: [0.23, 1, 0.32, 1] }}
      />

      {/* ===== PHASE 2: NEXUS letter-by-letter spring reveal ===== */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-[0.12em]">
          {NEXUS_LETTERS.map((letter, i) => (
            <motion.span
              key={i}
              className="font-display text-6xl sm:text-7xl md:text-8xl font-black text-white inline-block"
              style={{
                textShadow: '0 0 30px rgba(16,185,129,0.4), 0 0 80px rgba(16,185,129,0.15)',
              }}
              initial={{ opacity: 0, y: 30, scale: 0.5, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              transition={{
                delay: 1.0 + i * 0.08,
                duration: 0.6,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* ===== PHASE 2b: Circuit line bisector ===== */}
        <motion.div
          className="w-full h-px mt-4"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.8), rgba(16,185,129,0.4), transparent)',
            boxShadow: '0 0 15px rgba(16,185,129,0.3)',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0.6] }}
          transition={{
            delay: 1.8,
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1],
          }}
        />

        {/* ===== PHASE 3: Typewriter subtitle ===== */}
        <div className="mt-3 h-6 overflow-hidden">
          <motion.div
            className="font-display text-[10px] sm:text-xs uppercase tracking-[0.35em] text-emerald-400/70 whitespace-nowrap"
            style={{ fontVariant: 'small-caps' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.3 }}
          >
            {SUB_TEXT.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 2.2 + i * 0.03,
                  duration: 0.15,
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ===== PHASE 4: HUD ring constellation ===== */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 160 + i * 120,
            height: 160 + i * 120,
            border: `1px solid rgba(16,185,129,${0.12 - i * 0.03})`,
            borderTopColor: `rgba(16,185,129,${0.4 - i * 0.1})`,
            borderRightColor: 'transparent',
          }}
          initial={{ opacity: 0, rotate: i * 45 }}
          animate={{
            opacity: [0, 0.7, 0.4],
            rotate: [i * 45, i * 45 + 360],
          }}
          transition={{
            opacity: { delay: 2.8, duration: 0.8, ease: 'easeOut' },
            rotate: { delay: 2.8, duration: 20 + i * 8, repeat: Infinity, ease: 'linear' },
          }}
        />
      ))}

      {/* ===== PHASE 5: Particle burst from center ===== */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const distance = 120 + Math.random() * 200;
        const size = 1 + Math.random() * 2.5;
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: `rgba(16,185,129,${0.4 + Math.random() * 0.4})`,
              boxShadow: `0 0 ${size * 4}px rgba(16,185,129,0.3)`,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [0, 1, 0],
            }}
            transition={{
              delay: 3.2 + Math.random() * 0.3,
              duration: 1.0 + Math.random() * 0.5,
              ease: [0.23, 1, 0.32, 1],
            }}
          />
        );
      })}

      {/* ===== Ambient glow behind title ===== */}
      <motion.div
        className="absolute"
        style={{
          width: 500,
          height: 200,
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.0, duration: 1.5, ease: 'easeOut' }}
      />

      {/* ===== Scan line (single pass) ===== */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), rgba(16,185,129,0.6), rgba(16,185,129,0.4), transparent)',
          boxShadow: '0 0 20px rgba(16,185,129,0.2)',
        }}
        initial={{ top: '-2px', opacity: 0 }}
        animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
        transition={{ delay: 1.5, duration: 2.0, ease: 'linear' }}
      />

      {/* ===== Skip hint ===== */}
      <AnimatePresence>
        {skipReady && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <span className="font-display text-[8px] uppercase tracking-[0.5em] text-white/15">
              Tap to skip
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Powered by Mindraxus — subtle bottom ===== */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3.0, duration: 0.8 }}
      >
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-emerald-500/30" />
        <span className="font-display text-[7px] uppercase tracking-[0.4em] text-emerald-500/40">
          Mindraxus
        </span>
        <div className="w-10 h-px bg-gradient-to-l from-transparent to-emerald-500/30" />
      </motion.div>
    </motion.div>
  );
}
