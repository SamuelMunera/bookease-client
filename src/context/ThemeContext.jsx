import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // CORE-06: only reflect the theme on the DOM here. We must NOT persist to
    // localStorage on mount, otherwise the prefers-color-scheme listener below
    // (guarded by `!localStorage.getItem('theme')`) would be permanently dead
    // for users who never chose a theme manually. Persistence happens only in
    // toggleTheme, i.e. on an explicit user choice.
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => setTheme(t => {
    const next = t === 'dark' ? 'light' : 'dark';
    // CORE-06: persist only on explicit user choice so system-theme sync keeps
    // working until the user actively picks a theme.
    localStorage.setItem('theme', next);
    return next;
  });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
