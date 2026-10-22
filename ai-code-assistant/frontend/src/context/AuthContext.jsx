import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginUser, signupUser, TOKEN_KEY } from '../services/api.js';

const USER_KEY = 'codesage_user';
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const startSession = useCallback(({ user: nextUser, token }) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      if (token) localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable: keep the session in memory only */
    }
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(async (credentials) => startSession(await loginUser(credentials)), [startSession]);
  const signup = useCallback(async (details) => startSession(await signupUser(details)), [startSession]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, signup, logout }), [user, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
