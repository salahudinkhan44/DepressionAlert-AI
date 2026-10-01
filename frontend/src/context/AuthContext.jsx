// Auth context — wraps api.js auth calls and holds the session.
// Phase 2: same interface, backed by real JWT endpoints (FR-2, SEC-4/7).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = api.getSession();
    if (session) setUser(session.user);
    setLoading(false);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isViewer: user?.role === 'Authorized Viewer',
    async login(email, password) {
      const { user: u } = await api.login(email, password);
      setUser(u);
      return u;
    },
    async register(payload) {
      const { user: u } = await api.register(payload);
      setUser(u);
      return u;
    },
    async logout() {
      await api.logout();
      setUser(null);
    },
    async refreshUser(u) { setUser(u); },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
