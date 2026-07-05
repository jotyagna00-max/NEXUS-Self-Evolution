import { useGame } from '../GameContext';
import { Language, t } from './strings';

/**
 * R-09 — `useT()` returns a translation function bound to the operator's
 * active language. Falls back to English when a key is missing.
 */
export function useT() {
  const { language } = useGame();
  return (key: string, vars?: Record<string, string | number>) => t(language as Language, key, vars);
}

export type { Language };