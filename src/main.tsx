import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (!localStorage.getItem('NVIDIA_API_KEY')) {
  localStorage.setItem('NVIDIA_API_KEY', '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');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
