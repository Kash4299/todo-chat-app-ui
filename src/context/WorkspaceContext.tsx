"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { BackendWorkspace } from "@/lib/backend-api";

interface WorkspaceContextValue {
  workspace: BackendWorkspace | null;
  setWorkspace: (workspace: BackendWorkspace) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const STORAGE_KEY = "kashflow_active_workspace";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<BackendWorkspace | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWorkspaceState(JSON.parse(stored) as BackendWorkspace);
    } catch {}
  }, []);

  const setWorkspace = (w: BackendWorkspace) => {
    setWorkspaceState(w);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(w)); } catch {}
  };

  const clearWorkspace = () => {
    setWorkspaceState(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace, clearWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
