"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  siteId: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceContextValue {
  workspaceId: string | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  setWorkspaceId: (id: string) => void;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaceId: null,
  workspace: null,
  workspaces: [],
  setWorkspaceId: () => {},
  isLoading: true,
  refresh: async () => {},
});

const STORAGE_KEY = "proofkit_workspace_id";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (!res.ok) return;
      const data = await res.json() as { workspaces: Workspace[] };
      setWorkspaces(data.workspaces);

      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const validId = stored && data.workspaces.find((w) => w.id === stored) ? stored : null;
      const defaultId = validId ?? data.workspaces[0]?.id ?? null;
      setWorkspaceIdState(defaultId);
    } catch {
      // ignore fetch errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  const setWorkspaceId = useCallback((id: string) => {
    setWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const workspace = workspaces.find((w) => w.id === workspaceId) ?? null;

  return (
    <WorkspaceContext.Provider value={{ workspaceId, workspace, workspaces, setWorkspaceId, isLoading, refresh: fetchWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  return useContext(WorkspaceContext);
}
