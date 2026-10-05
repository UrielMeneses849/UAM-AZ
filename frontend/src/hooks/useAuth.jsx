import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, supabase } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setReady(true);
        return;
      }
      authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function login(username, password) {
    const result = await authApi.login(username, password);
    setUser(result.user);
    return result.user;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
