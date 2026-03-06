"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "@/services/authService";
import { getStoredToken } from "@/services/api";
import type { User, LoginPayload, RegisterPayload } from "@/types";

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // NOTE: UserSerializer doesn't expose is_staff.
  // To enable admin features, add is_staff to UserSerializer fields in the backend.
  // For now we expose the raw user so pages can check user?.is_staff if the backend adds it.
  isAdmin: boolean;
  login: (p: LoginPayload) => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authService.getProfile();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (getStoredToken()) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (p: LoginPayload) => {
    await authService.login(p);
    await refreshUser();
  };

  const register = async (p: RegisterPayload) => {
    await authService.register(p);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: !!(user as (User & { is_staff?: boolean }) | null)?.is_staff,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
