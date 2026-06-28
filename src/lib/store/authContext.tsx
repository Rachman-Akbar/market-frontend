"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, UserRole } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  login: (role: UserRole, name?: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USERS: Record<UserRole, User> = {
  buyer: { id: "u1", name: "Budi Santoso", email: "buyer@demo.com", role: "buyer", avatar: "" },
  seller: { id: "u2", name: "Toko Demo", email: "seller@demo.com", role: "seller", avatar: "" },
  admin: { id: "u3", name: "Admin Panel", email: "admin@demo.com", role: "admin", avatar: "" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("auth_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user, mounted]);

  const login = (role: UserRole, name?: string) => {
    const u = { ...MOCK_USERS[role], ...(name ? { name } : {}) };
    setUser(u);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
