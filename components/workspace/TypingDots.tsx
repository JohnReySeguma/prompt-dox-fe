"use client";

import { motion } from "framer-motion";

export function TypingDots({ label = "Thinking" }: { label?: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="size-1.5 rounded-full bg-cyan-300"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
          />
        ))}
      </span>
      {label}…
    </span>
  );
}
