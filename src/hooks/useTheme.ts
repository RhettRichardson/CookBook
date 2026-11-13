import { useEffect, useState } from 'react';
import type { ThemeChoice } from '../types';
import { readString, writeString } from '../lib/storage';

const THEME_KEY = 'cookbook-theme';

function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === 'system' || value === 'light' || value === 'dark';
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return choice;
}

function applyTheme(choice: ThemeChoice): void {
  const resolved = resolveTheme(choice);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = choice;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#16120f' : '#c2512c');
}

export function useTheme(): {
  choice: ThemeChoice;
  resolved: 'light' | 'dark';
  setChoice: (choice: ThemeChoice) => void;
} {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => {
    const stored = readString(THEME_KEY);
    return isThemeChoice(stored) ? stored : 'system';
  });

  const [, setSystemTick] = useState(0);

  useEffect(() => {
    applyTheme(choice);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyTheme(choice);
      setSystemTick((tick) => tick + 1);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [choice]);

  const setChoice = (next: ThemeChoice) => {
    writeString(THEME_KEY, next);
    setChoiceState(next);
  };

  return { choice, resolved: resolveTheme(choice), setChoice };
}
