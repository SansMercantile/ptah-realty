import { useState, useEffect, useRef } from 'react';

/**
 * Drop-in replacement for useState that survives a page reload (F5) by
 * mirroring the value to sessionStorage under `key`.
 *
 * sessionStorage (not localStorage) is deliberate: it persists across a
 * reload within the same tab, which is exactly "stay where I was when the
 * user hits refresh", but clears when the tab actually closes -- it won't
 * leave someone stuck on a stale modal/tab days later in a fresh session.
 *
 * Added 2026-09-xx: previously activeNavTab, every modal-open flag, and
 * the CRM's own currentView all reset to their hardcoded defaults on every
 * mount, so F5 always dumped the user back on the cadastre map / CRM
 * dashboard no matter where they'd navigated to.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = `ptah_nav_${key}`;

  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      // Malformed JSON from a previous version's shape, or sessionStorage
      // unavailable (private browsing, quota) -- fall back quietly rather
      // than crash the app over restored nav state.
      return defaultValue;
    }
  });

  // Avoid writing the default value back on first mount when nothing was
  // stored yet -- harmless either way, but keeps sessionStorage from
  // filling up with untouched keys on every fresh session.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (sessionStorage.getItem(storageKey) === null) return;
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Quota exceeded or unavailable -- non-fatal, nav just won't persist.
    }
  }, [storageKey, state]);

  return [state, setState];
}
