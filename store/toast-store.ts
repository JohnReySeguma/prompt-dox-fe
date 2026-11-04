"use client";

import { create } from "zustand";
import { createId } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const TOAST_DURATION_MS = 6000;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  toast: (input) => {
    const id = createId("toast");
    // Keep at most three on screen; the newest replaces the oldest.
    set((state) => ({ toasts: [...state.toasts.slice(-2), { ...input, id }] }));
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Shorthand for components that only need to raise a toast. */
export function useToast() {
  return useToastStore((state) => state.toast);
}
