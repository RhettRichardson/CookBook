function collectAssetUrls(): string[] {
  const urls = new Set<string>();
  const add = (value: string | null | undefined) => {
    if (!value) return;
    try {
      const url = new URL(value, window.location.href);
      if (url.origin === window.location.origin) urls.add(url.href);
    } catch {
      // Ignore malformed URLs.
    }
  };

  add(new URL(import.meta.env.BASE_URL, window.location.origin).href);
  document.querySelectorAll('script[src], link[href]').forEach((node) => {
    if (node instanceof HTMLScriptElement) add(node.src);
    if (node instanceof HTMLLinkElement) add(node.href);
  });
  return [...urls];
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  const base = import.meta.env.BASE_URL;
  const hadController = Boolean(navigator.serviceWorker.controller);

  if (hadController) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base, updateViaCache: 'none' })
      .then((registration) => {
        const warm = () => {
          const worker = registration.active ?? navigator.serviceWorker.controller;
          worker?.postMessage({ type: 'CACHE_URLS', urls: collectAssetUrls() });
        };
        if (registration.active) warm();
        else navigator.serviceWorker.addEventListener('controllerchange', warm, { once: true });
      })
      .catch(() => {
        // The cookbook still works online if the worker cannot register.
      });
  });
}
