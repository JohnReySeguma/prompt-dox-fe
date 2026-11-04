"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, X } from "lucide-react";
import { useToastStore } from "@/store/toast-store";

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-lift"
          >
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-0.5 text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
