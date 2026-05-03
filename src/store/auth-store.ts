"use client";

import { create } from "zustand";
import type { AuthUser } from "@/lib/auth-types";

interface AccountLinkState {
  error: string;
  loading: boolean;
}

interface AuthStoreState {
  user: AuthUser | null;
  loading: boolean;
  accountLink: AccountLinkState | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setAccountLink: (accountLink: AccountLinkState | null) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  loading: true,
  accountLink: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setAccountLink: (accountLink) => set({ accountLink }),
}));
