"use client";

import { create } from "zustand";
import { buildPlaceholderPages, MOCK_DOCUMENTS } from "@/mock/documents";
import { findAnswer, INITIAL_CHATS } from "@/mock/knowledge";
import { MOCK_USER } from "@/mock/site";
import { createId } from "@/lib/utils";
import type { ChatMessage, DocFormat, DocumentItem } from "@/types";

export const SUPPORTED_FORMATS: DocFormat[] = ["pdf", "docx", "md", "txt"];
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export type UploadResult = { ok: true; id: string } | { ok: false; error: string };

interface WorkspaceState {
  documents: DocumentItem[];
  chats: Record<string, ChatMessage[]>;
  /** Doc ids currently waiting for the (simulated) model to start answering. */
  thinking: Record<string, boolean>;
  queriesToday: number;

  uploadFile: (file: { name: string; size: number }) => UploadResult;
  renameDocument: (id: string, name: string) => void;
  deleteDocument: (id: string) => void;
  /** Moves any document left in `indexing` to `ready` after a short delay. */
  resumeIndexing: () => void;
  sendMessage: (docId: string, question: string) => void;
  completeMessage: (docId: string, messageId: string) => void;
  clearChat: (docId: string) => void;
}

// Timers live outside React so simulations keep running across route changes.
const scheduled = new Set<string>();

function detectFormat(name: string): DocFormat | null {
  const ext = name.split(".").pop()?.toLowerCase();
  return SUPPORTED_FORMATS.find((format) => format === ext) ?? null;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => {
  const patchDoc = (id: string, patch: Partial<DocumentItem>) =>
    set((state) => ({
      documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)),
    }));

  const finishIndexing = (id: string, delay: number) => {
    if (scheduled.has(id)) return;
    scheduled.add(id);
    setTimeout(() => {
      scheduled.delete(id);
      const doc = get().documents.find((item) => item.id === id);
      if (!doc || doc.status !== "indexing") return;
      const chunks = doc.pages.reduce((total, page) => total + page.paragraphs.length, 0) * 6 + 12;
      patchDoc(id, { status: "ready", chunkCount: chunks });
    }, delay);
  };

  return {
    documents: MOCK_DOCUMENTS,
    chats: INITIAL_CHATS,
    thinking: {},
    queriesToday: MOCK_USER.queriesToday,

    uploadFile: (file) => {
      const format = detectFormat(file.name);
      if (!format) {
        return { ok: false, error: `“${file.name}” isn't supported. Use PDF, DOCX, MD or TXT.` };
      }
      if (file.size > MAX_FILE_BYTES) {
        return { ok: false, error: `“${file.name}” is larger than 50 MB.` };
      }
      if (get().documents.length >= MOCK_USER.documentLimit) {
        return { ok: false, error: "You've reached the 10-document limit on the Free plan." };
      }

      const id = createId("doc");
      const doc: DocumentItem = {
        id,
        name: file.name,
        format,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        status: "uploading",
        progress: 0,
        chunkCount: 0,
        summary: "Freshly uploaded. A summary will appear once indexing completes.",
        pages: buildPlaceholderPages(file.name),
      };
      set((state) => ({ documents: [doc, ...state.documents] }));

      let progress = 0;
      const timer = setInterval(() => {
        const current = get().documents.find((item) => item.id === id);
        if (!current) {
          clearInterval(timer);
          return;
        }
        progress = Math.min(100, progress + 6 + Math.random() * 14);
        if (progress >= 100) {
          clearInterval(timer);
          patchDoc(id, { progress: 100, status: "indexing" });
          finishIndexing(id, 2600 + Math.random() * 1600);
        } else {
          patchDoc(id, { progress });
        }
      }, 220);

      return { ok: true, id };
    },

    renameDocument: (id, name) => {
      const trimmed = name.trim();
      if (trimmed) patchDoc(id, { name: trimmed });
    },

    deleteDocument: (id) =>
      set((state) => {
        const chats = { ...state.chats };
        delete chats[id];
        return { documents: state.documents.filter((doc) => doc.id !== id), chats };
      }),

    resumeIndexing: () => {
      for (const doc of get().documents) {
        if (doc.status === "indexing") finishIndexing(doc.id, 6000);
      }
    },

    sendMessage: (docId, question) => {
      const text = question.trim();
      if (!text || get().thinking[docId]) return;

      const userMessage: ChatMessage = { id: createId("msg"), role: "user", content: text, citations: [] };
      set((state) => ({
        chats: { ...state.chats, [docId]: [...(state.chats[docId] ?? []), userMessage] },
        thinking: { ...state.thinking, [docId]: true },
        queriesToday: state.queriesToday + 1,
      }));

      // Simulated retrieval latency before the "model" starts streaming.
      setTimeout(() => {
        const answer = findAnswer(docId, text);
        const reply: ChatMessage = {
          id: createId("msg"),
          role: "assistant",
          content: answer.content,
          citations: answer.citations,
          streaming: true,
        };
        set((state) => ({
          chats: { ...state.chats, [docId]: [...(state.chats[docId] ?? []), reply] },
          thinking: { ...state.thinking, [docId]: false },
        }));
      }, 850 + Math.random() * 600);
    },

    completeMessage: (docId, messageId) =>
      set((state) => ({
        chats: {
          ...state.chats,
          [docId]: (state.chats[docId] ?? []).map((message) =>
            message.id === messageId ? { ...message, streaming: false } : message,
          ),
        },
      })),

    clearChat: (docId) => set((state) => ({ chats: { ...state.chats, [docId]: [] } })),
  };
});
