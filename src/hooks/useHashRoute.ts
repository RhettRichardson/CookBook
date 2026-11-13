import { useEffect, useMemo, useState } from 'react';

export type AppRoute = { name: 'home' } | { name: 'recipe'; slug: string };

export function parseHash(hash: string): AppRoute {
  const path = hash.replace(/^#/, '');
  const match = /^\/recipe\/([^/?#]+)\/?$/.exec(path);
  if (!match?.[1]) return { name: 'home' };
  try {
    return { name: 'recipe', slug: decodeURIComponent(match[1]) };
  } catch {
    return { name: 'recipe', slug: match[1] };
  }
}

export function useHashRoute(): AppRoute {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return useMemo(() => parseHash(hash), [hash]);
}
