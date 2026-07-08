import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Themed confirmation dialog — replaces window.confirm() throughout NEXUS.
 *
 * Usage:
 *   const [show, setShow] = useState(false);
 *   <ConfirmDialog open={show} onConfirm={handleAction} onCancel={() => setShow(false)}
 *     title="Delete Protocol?" description="This cannot be undone." variant="danger" />
 */

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual variant — 'danger' shows red accents, 'warning' amber, 'default' emerald. */
  variant?: 'danger' | 'warning' | 'default';
}

const variantStyles = {
  danger: {
    iconBg: 'bg-red-500/10 border-red-500/30',
    iconText: 'text-red-400',
    confirmBtn: 'bg-red-500 hover:bg-red-400 text-white',
    ring: 'shadow-[0_0_80px_rgba(239,68,68,0.08)]',
  },
  warning: {
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    iconText: 'text-amber-400',
    confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-black',
    ring: 'shadow-[0_0_80px_rgba(245,158,11,0.08)]',
  },
  default: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconText: 'text-emerald-400',
    confirmBtn: 'bg-emerald-500 hover:bg-emerald-400 text-black',
    ring: 'shadow-[0_0_80px_rgba(16,185,129,0.08)]',
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}) => {
  const style = variantStyles[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`glass rounded-[32px] border border-white/10 w-full max-w-sm p-8 relative ${style.ring}`}
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl ${style.iconBg} border flex items-center justify-center mb-6`}>
              <AlertTriangle size={28} className={style.iconText} />
            </div>

            {/* Content */}
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-white/40 font-tech leading-relaxed mb-8">
                {description}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/50 hover:text-white font-display text-xs uppercase tracking-widest transition-all"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => { onConfirm(); }}
                className={`flex-1 py-3 px-4 rounded-xl font-display text-xs uppercase tracking-widest transition-all active:scale-95 ${style.confirmBtn}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
