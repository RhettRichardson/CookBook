import { useEffect, useState } from 'react';

export function useWakeLock(enabled: boolean): {
  supported: boolean;
  active: boolean;
  failed: boolean;
} {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [lockActive, setLockActive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || !supported) return;

    let cancelled = false;
    let sentinel: WakeLockSentinel | null = null;

    const acquire = async () => {
      try {
        const next = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await next.release();
          return;
        }
        sentinel = next;
        setFailed(false);
        setLockActive(true);
        next.addEventListener('release', () => {
          if (!cancelled) setLockActive(false);
        });
      } catch {
        if (!cancelled) {
          setLockActive(false);
          setFailed(true);
        }
      }
    };

    void acquire();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      const current = sentinel;
      sentinel = null;
      if (current) void current.release().catch(() => undefined);
      setLockActive(false);
    };
  }, [enabled, supported]);

  return { supported, active: enabled && lockActive, failed: enabled && failed };
}
