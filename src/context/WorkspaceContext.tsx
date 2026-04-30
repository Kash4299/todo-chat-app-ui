"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { BackendWorkspace } from "@/lib/backend-api";

interface WorkspaceContextValue {
  workspace: BackendWorkspace | null;
  setWorkspace: (workspace: BackendWorkspace) => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const STORAGE_KEY = "kashflow_active_workspace";
const STORAGE_EVENT = "kashflow_workspace_changed";

let cachedRawWorkspace: string | null = null;
let cachedWorkspace: BackendWorkspace | null = null;

function readWorkspaceFromStorage(): BackendWorkspace | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === cachedRawWorkspace) {
      return cachedWorkspace;
    }

    cachedRawWorkspace = stored;
    cachedWorkspace = stored ? (JSON.parse(stored) as BackendWorkspace) : null;
    return cachedWorkspace;
  } catch {
    cachedRawWorkspace = null;
    cachedWorkspace = null;
    return null;
  }
}

function subscribeWorkspace(onStoreChange: () => void) {
  const onStorage = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== STORAGE_KEY) {
      return;
    }
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, onStorage);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT, onStorage);
  };
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const workspace = useSyncExternalStore(
    subscribeWorkspace,
    readWorkspaceFromStorage,
    () => null,
  );

  const setWorkspace = (w: BackendWorkspace) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {}
  };

  const clearWorkspace = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {}
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
