"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Does PromptDox train models on my documents?",
    a: "No. Your documents are only used to build your workspace's private index. They are never used to train models or shared with other workspaces.",
  },
  {
    q: "How do citations work?",
    a: "Every passage keeps a pointer to its page and paragraph. When an answer uses a passage, its citation opens the document at that spot with the sentence highlighted.",
  },
  {
    q: "What happens when I reach the Free plan limit?",
    a: "You can keep asking questions about the documents you have. To add more than 10, delete one or upgrade to Pro.",
  },
  {
    q: "Can we run PromptDox in our own cloud?",
    a: "Yes, on the Enterprise plan. It runs in a dedicated VPC or fully self-hosted on Kubernetes, with your own encryption keys.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 px-5 pb-24 sm:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <h2 className="text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight font-semibold tracking-[-0.03em]">Common questions</h2>
        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-[16px] font-medium"
                >
                  {item.q}
                  <Plus className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-45")} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
