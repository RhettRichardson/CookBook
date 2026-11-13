import { useEffect, useState } from 'react';
import { readJson, writeJson } from '../lib/storage';

function loadChecks(key: string): string[] {
  const parsed = readJson(key);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === 'string');
}

export function useChecks(slug: string): {
  checked: string[];
  toggle: (id: string) => void;
  reset: () => void;
  isChecked: (id: string) => boolean;
} {
  const storageKey = `cookbook-checks:${slug}`;
  const [checked, setChecked] = useState<string[]>(() => loadChecks(storageKey));

  useEffect(() => {
    writeJson(storageKey, checked);
  }, [storageKey, checked]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      setChecked(loadChecks(storageKey));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const toggle = (id: string) => {
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const reset = () => setChecked([]);
  const isChecked = (id: string) => checked.includes(id);

  return { checked, toggle, reset, isChecked };
}
