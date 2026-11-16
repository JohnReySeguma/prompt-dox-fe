"use client";

import { create } from "zustand";
import { createId } from "@/lib/utils";
import type { DocFormat, DocumentItem } from "@/types";

export const SUPPORTED_FORMATS: DocFormat[] = ["pdf", "docx", "md", "txt"];
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export function detectFormat(name: string): DocFormat | null {
  const ext = name.split(".").pop()?.toLowerCase();
  return SUPPORTED_FORMATS.find((format) => format === ext) ?? null;
}

/**
 * Files in flight. They exist only in the browser (status `uploading`) until
 * the API answers 202 with the real document, which then joins the
 * server-backed list. Lives outside React so uploads survive route changes.
 */
interface UploadState {
  uploads: DocumentItem[];
  errors: string[];
  start: (file: { name: string; size: number; format: DocFormat }) => string;
  progress: (id: string, percent: number) => void;
  finish: (id: string) => void;
  fail: (id: string, message: string) => void;
  setErrors: (errors: string[]) => void;
}

export const useUploadStore = create<UploadState>()((set) => ({
  uploads: [],
  errors: [],
  start: (file) => {
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
    set((state) => ({ uploads: [item, ...state.uploads] }));
    return id;
  },
  progress: (id, percent) =>
    set((state) => ({ uploads: state.uploads.map((item) => (item.id === id ? { ...item, progress: percent } : item)) })),
  finish: (id) => set((state) => ({ uploads: state.uploads.filter((item) => item.id !== id) })),
  fail: (id, message) =>
    set((state) => ({ uploads: state.uploads.filter((item) => item.id !== id), errors: [...state.errors, message] })),
  setErrors: (errors) => set({ errors }),
}));
