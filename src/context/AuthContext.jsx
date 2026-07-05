import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// 'cookie' => la sesión vive en la cookie HttpOnly; no se guarda el token en JS.
const COOKIE_MODE = import.meta.env.VITE_AUTH_MODE === 'cookie';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      // Valor corrupto en localStorage: limpiar y tratar como no autenticado
      // (evita que un JSON inválido tumbe toda la app en el mount raíz).
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  function login(data) {
    // En modo cookie NO persistimos el token en JS (anti-XSS): la sesión vive
    // en la cookie HttpOnly. En modo default se mantiene el token en localStorage.
    if (!COOKIE_MODE && data.token) {
      localStorage.setItem('token', data.token);
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function logout() {
    // Pide al backend que limpie las cookies (HttpOnly token + csrfToken).
    // Tolerante a fallos: aunque el endpoint falle, limpiamos el estado local.
    try {
      await api.logout();
    } catch {
      // Ignorar: la limpieza local debe ocurrir igualmente.
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
