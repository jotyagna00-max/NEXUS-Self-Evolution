import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

/**
 * Lightweight wrapper that shows a tooltip on hover. Keeps the bundle small
 * by avoiding a heavy tooltip library — NEXUS only needs a single-line label.
 */
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/90 border border-white/15 text-[9px] font-tech text-white/80 whitespace-nowrap shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export { Tooltip };
export default Tooltip;
