"use client";

import { create } from "zustand";
import { demo as createDemoWorkspace } from "@/lib/api/auth";
import { createId } from "@/lib/utils";
import type { DocFormat, DocumentItem } from "@/types";

/** The backend deletes demo workspaces after 24 hours; the browser forgets them at the same time. */
export const DEMO_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const DEMO_MAX_UPLOADS = 3;
export const DEMO_MAX_FILE_BYTES = 5 * 1024 * 1024;

const STORAGE_KEY = "promptdox.demo-uploads";

/**
 * A temporary backend workspace that holds the visitor's demo uploads. It is
 * created on the first upload, kept only in this browser, and never shows the
 * visitor as signed in (Auth.js knows nothing about it).
 */
export interface DemoWorkspace {
  accessToken: string;
  /** Epoch milliseconds. */
  createdAt: number;
  expiresAt: number;
  /** Documents the visitor uploaded (the workspace's seeded samples are ignored). */
  uploadIds: string[];
}

interface DemoState {
  workspace: DemoWorkspace | null;
  /** True once localStorage has been read (it isn't available during prerendering). */
  hydrated: boolean;
  /** Files in flight, shown with progress until the API answers. */
  uploading: DocumentItem[];
  hydrate: () => void;
  /** Returns the workspace, creating it on first use. Concurrent callers share one request. */
  ensureWorkspace: () => Promise<DemoWorkspace>;
  addUpload: (id: string) => void;
  removeUpload: (id: string) => void;
  /** Forget the workspace (expired, or the backend no longer accepts its token). */
  reset: () => void;
  startUpload: (file: { name: string; size: number; format: DocFormat }) => string;
  progressUpload: (id: string, percent: number) => void;
  endUpload: (id: string) => void;
}

function read(): DemoWorkspace | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoWorkspace;
    if (!parsed.accessToken || Date.now() >= parsed.expiresAt) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function write(workspace: DemoWorkspace | null): void {
  try {
    if (workspace) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the uploads still work for this page view.
  }
}

let creating: Promise<DemoWorkspace> | null = null;

export const useDemoStore = create<DemoState>()((set, get) => {
  const save = (workspace: DemoWorkspace | null) => {
    write(workspace);
    set({ workspace });
  };

  return {
    workspace: null,
    hydrated: false,
    uploading: [],

    hydrate: () => {
      if (!get().hydrated) set({ workspace: read(), hydrated: true });
    },

    ensureWorkspace: () => {
      const current = get().workspace;
      if (current && Date.now() < current.expiresAt) return Promise.resolve(current);
      if (!creating) {
        creating = createDemoWorkspace()
          .then((session) => {
            const createdAt = Date.now();
            const workspace: DemoWorkspace = {
              accessToken: session.accessToken,
              createdAt,
              expiresAt: createdAt + DEMO_LIFETIME_MS,
              uploadIds: [],
            };
            save(workspace);
            return workspace;
          })
          .finally(() => {
            creating = null;
          });
      }
      return creating;
    },

    addUpload: (id) => {
      const workspace = get().workspace;
      if (workspace && !workspace.uploadIds.includes(id)) save({ ...workspace, uploadIds: [id, ...workspace.uploadIds] });
    },

    removeUpload: (id) => {
      const workspace = get().workspace;
      if (workspace) save({ ...workspace, uploadIds: workspace.uploadIds.filter((item) => item !== id) });
    },

    reset: () => save(null),

    startUpload: (file) => {
      const id = createId("upload");
      const item: DocumentItem = {
        id,
        name: file.name,
        format: file.format,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        status: "uploading",
        progress: 0,
        chunkCount: 0,
        pageCount: 0,
        summary: "Uploading. A summary will appear once indexing completes.",
        error: null,
      };
      set((state) => ({ uploading: [item, ...state.uploading] }));
      return id;
    },
    progressUpload: (id, percent) =>
      set((state) => ({ uploading: state.uploading.map((item) => (item.id === id ? { ...item, progress: percent } : item)) })),
    endUpload: (id) => set((state) => ({ uploading: state.uploading.filter((item) => item.id !== id) })),
  };
});
