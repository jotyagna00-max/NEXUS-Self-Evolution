import React, { useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

/**
 * Global Error Boundary for NEXUS.
 * Catches rendering crashes in any child component and shows a themed
 * recovery screen instead of a blank white screen.
 *
 * Uses function component + useState pattern for TypeScript compatibility
 * with the project's useDefineForClassFields config.
 */

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ErrorState>({ hasError: false, error: null, errorInfo: null });

  const handleReset = useCallback(() => {
    setState({ hasError: false, error: null, errorInfo: null });
  }, []);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearData = useCallback(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('nexus_'));
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  // Use React error boundary via class component wrapper
  // Since function components can't catch errors, we use a trick:
  // Wrap children in a class-based error catcher internally
  if (state.hasError) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-8 overflow-auto">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle size={48} className="text-red-400" />
          </div>

          <div>
            <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">
              System Error
            </h1>
            <p className="text-sm text-white/40 font-tech mt-3 leading-relaxed">
              A critical error occurred in the NEXUS system. This is not a punishment from the Shadow — it's a bug.
            </p>
          </div>

          {state.error && (
            <div className="text-left bg-white/5 border border-white/10 rounded-2xl p-6 max-h-48 overflow-y-auto">
              <p className="text-[10px] font-mono text-red-400/80 break-all">
                {state.error.message}
              </p>
              {state.errorInfo && (
                <pre className="text-[8px] font-mono text-white/20 mt-3 whitespace-pre-wrap">
                  {state.errorInfo.componentStack?.slice(0, 500)}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all"
            >
              <RotateCcw size={14} />
              Try Recovery
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-6 py-3 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-400 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all"
            >
              Clear Data & Reload
            </button>

            <ConfirmDialog
              open={showClearConfirm}
              onConfirm={handleClearData}
              onCancel={() => setShowClearConfirm(false)}
              title="Clear All Data?"
              description="This will delete all NEXUS progress and reload the app. This cannot be undone."
              confirmLabel="Clear & Reload"
              variant="danger"
            />
          </div>
        </div>
      </div>
    );
  }

  return <ErrorCatcher onError={(error, errorInfo) => setState({ hasError: true, error, errorInfo })}>{children}</ErrorCatcher>;
}

// Internal class component that actually catches errors
class ErrorCatcher extends React.Component<{ children: ReactNode; onError: (error: Error, errorInfo: React.ErrorInfo) => void }> {
  public props!: { children: ReactNode; onError: (error: Error, errorInfo: React.ErrorInfo) => void };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}
