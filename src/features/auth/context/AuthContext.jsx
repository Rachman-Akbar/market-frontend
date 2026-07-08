import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredUser, createDemoUser, persistUser, readStoredUser } from "@/features/auth/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const login = (role = "buyer", name = "Guest User") => {
    const nextUser = persistUser(createDemoUser({ role, name }));
    setUser(nextUser);
  };

  const logout = () => {
    setUser(null);
    clearStoredUser();
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return context;
}
