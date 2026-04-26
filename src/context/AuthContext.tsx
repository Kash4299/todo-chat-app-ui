"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth-types";

interface AccountLinkState {
  error: string;
  loading: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  accountLink: AccountLinkState | null;
  confirmAccountLink: (password: string) => Promise<void>;
  cancelAccountLink: () => void;
  logout: () => void;
}

interface ApiError {
  error?: string;
  code?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function accountLinkMessage(status: number, error?: string) {
  if (status === 400) return "Phiên hết hạn, vui lòng đăng nhập lại";
  if (status === 409) return "Google account này đã được ghép với một tài khoản khác";
  if (status === 401 && error?.includes("Google login only")) {
    return "Tài khoản này chưa có mật khẩu";
  }
  if (status === 401) return "Mật khẩu không đúng";

  return error || "Không thể ghép tài khoản";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLink, setAccountLink] = useState<AccountLinkState | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(async (res) => {
        if (res.ok) return res.json() as Promise<AuthUser>;

        const payload = (await res.json().catch(() => ({}))) as ApiError;
        if (
          res.status === 409 &&
          payload.code === "ACCOUNT_LINK_REQUIRED"
        ) {
          setAccountLink({
            error: "",
            loading: false,
          });
        }

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
  }, []);

  const confirmAccountLink = async (password: string) => {
    if (!accountLink || accountLink.loading) return;

    setAccountLink({ ...accountLink, error: "", loading: true });

    try {
      const response = await fetch("/api/auth/link/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => ({}))) as
        | { user?: AuthUser }
        | ApiError;

      if (response.ok && "user" in payload && payload.user) {
        setUser(payload.user);
        setAccountLink(null);
        return;
      }

      setAccountLink({
        ...accountLink,
        error: accountLinkMessage(response.status, "error" in payload ? payload.error : undefined),
        loading: false,
      });
    } catch {
      setAccountLink({
        ...accountLink,
        error: "Không thể ghép tài khoản",
        loading: false,
      });
    }
  };

  const cancelAccountLink = () => {
    setAccountLink(null);
    window.location.href = "/auth/logout";
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/auth/logout";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accountLink,
        confirmAccountLink,
        cancelAccountLink,
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
