import { createContext, useContext, useState, useEffect } from 'react';

const CountryContext = createContext({ country: 'CO', loading: false, setCountry: () => {} });

const SUPPORTED = ['CO', 'US'];
const CACHE_KEY  = 'bke_country_cache';
const MANUAL_KEY = 'bke_country_manual';
const TTL = 3_600_000; // 1 hora

function browserFallback() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (tz.includes('Bogota') || tz.includes('Barranquilla') || tz.includes('Lima') || tz.includes('Caracas')) return 'CO';
  const usTz = ['New_York','Los_Angeles','Chicago','Denver','Phoenix','Anchorage','Honolulu'];
  if (usTz.some(t => tz.includes(t))) return 'US';
  return 'CO';
}

function readStored() {
  // 1. Manual override persiste entre sesiones
  try {
    const manual = localStorage.getItem(MANUAL_KEY);
    if (manual && SUPPORTED.includes(manual)) return { value: manual, ready: true };
  } catch { /* safari private */ }

  // 2. Cache de sesión (1h)
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const { value, ts } = JSON.parse(raw);
      if (SUPPORTED.includes(value) && Date.now() - ts < TTL) return { value, ready: true };
    }
  } catch {}

  return { value: null, ready: false };
}

export function CountryProvider({ children }) {
  const stored = readStored();
  const [country, setCountryState] = useState(stored.value);
  const [loading, setLoading] = useState(!stored.ready);

  useEffect(() => {
    if (stored.ready) return; // ya tenemos un valor válido
    const BASE = import.meta.env.VITE_API_URL || '/api';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);

    fetch(`${BASE}/geo/country`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(({ country: c }) => {
        const detected = SUPPORTED.includes(c) ? c : browserFallback();
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value: detected, ts: Date.now() }));
        setCountryState(detected);
      })
      .catch(() => setCountryState(browserFallback()))
      .finally(() => { clearTimeout(timer); setLoading(false); });

    return () => { ctrl.abort(); clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setCountry(c) {
    localStorage.setItem(MANUAL_KEY, c);
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value: c, ts: Date.now() }));
    setCountryState(c);
  }

  return (
    <CountryContext.Provider value={{ country: country ?? 'CO', loading, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
