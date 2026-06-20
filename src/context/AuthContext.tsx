"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { AuthUser } from "@/lib/auth-types";
import { useAuthStore } from "@/store/auth-store";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  updateProfile: (input: { display_name: string; avatar_url?: string; status_text?: string }) => Promise<void>;
  logout: () => void;
}

interface ApiError {
  error?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (res.ok) return res.json() as Promise<AuthUser>;
        throw new Error("unauthorized");
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [setLoading, setUser]);

  const updateProfile = async (input: { display_name: string; avatar_url?: string; status_text?: string }) => {
    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json().catch(() => ({}))) as AuthUser & ApiError;
    if (!response.ok) {
      throw new Error(payload.error || "Không thể cập nhật hồ sơ");
    }

    setUser(payload as AuthUser);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
      throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
