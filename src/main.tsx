/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { syncNativeLLMStatus } from './services/nativeLLMBridge.ts';

// Auto-detect Electron native LLM (node-llama-cpp) on startup.
// When running in the packaged Electron EXE, this configures the local
// LLM endpoint to point at http://localhost:3000/v1 — the OpenAI-compatible
// server that the main process exposes. If the model isn't downloaded yet,
// nothing happens (no error) and the user can download it via Profile.
syncNativeLLMStatus();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
 </StrictMode>,
);
