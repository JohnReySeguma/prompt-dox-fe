"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Does PromptDox train models on my documents?",
    a: "No. Your documents are only used to build your workspace's private index. They are never used to train foundation models or shared across tenants.",
  },
  {
    q: "How do citations work?",
    a: "Every passage we retrieve keeps a pointer to its page and paragraph. When an answer uses a passage, the citation badge links straight to that highlighted location in the viewer.",
  },
  {
    q: "What happens when I hit the Free plan limit?",
    a: "You can keep querying existing documents. To upload more than 10, delete an older document or upgrade to Pro.",
  },
  {
    q: "Can I deploy PromptDox in my own cloud?",
    a: "Enterprise customers can run PromptDox in a dedicated VPC or fully self-hosted on Kubernetes, with bring-your-own-key encryption.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 px-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Frequently asked questions</h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q} className="glass overflow-hidden rounded-2xl">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
                >
                  {item.q}
                  <Plus className={cn("size-4 shrink-0 text-cyan-300 transition-transform", isOpen && "rotate-45")} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
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
