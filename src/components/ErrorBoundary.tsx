import React from 'react';

interface EBProps { children: React.ReactNode; }
interface EBState { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends React.Component<EBProps, EBState> {
  state: EBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
          <p className="text-red-400 text-5xl mb-4">SYSTEM FAULT</p>
          <p className="text-gray-400 text-lg mb-2">A critical error occurred.</p>
          <p className="text-gray-600 text-sm max-w-md mb-6">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-900/40 text-red-300 border border-red-800 rounded hover:bg-red-900/60"
          >
            Reload NEXUS
          </button>
        </div>
      );
    }
    return (this as unknown as React.Component<EBProps, EBState>).props.children;
  }
}
