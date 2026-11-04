"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, FileText, Lock, SendHorizontal } from "lucide-react";
import { MOCK_DOCUMENTS } from "@/mock/documents";
import { MOCK_KNOWLEDGE } from "@/mock/knowledge";
import { useTypewriter } from "@/hooks/use-typewriter";
import { CitedText } from "@/components/workspace/CitedText";
import { TypingDots } from "@/components/workspace/TypingDots";
import { cn } from "@/lib/utils";

const DOC = MOCK_DOCUMENTS[0];
const KNOWLEDGE = MOCK_KNOWLEDGE[DOC.id];
const SCRIPT = KNOWLEDGE.suggestions.map((question, index) => ({ question, answer: KNOWLEDGE.answers[index] }));

type Phase = "thinking" | "streaming" | "done";

function StreamingAnswer({ content, citations, onDone }: { content: string; citations: (typeof SCRIPT)[number]["answer"]["citations"]; onDone: () => void }) {
  const { text, done } = useTypewriter(content, { interval: 22, onDone });
  return (
    <p className="text-[13px] leading-relaxed text-foreground/90">
      <CitedText text={text} citations={citations} />
      {!done && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-blink bg-cyan-300" />}
    </p>
  );
}

/** Self-playing miniature of the workspace used in the landing-page hero. */
export function DemoPreview() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("thinking");

  useEffect(() => {
    if (phase === "thinking") {
      const timer = setTimeout(() => setPhase("streaming"), 1100);
      return () => clearTimeout(timer);
    }
    if (phase === "done") {
      const timer = setTimeout(() => {
        setStep((value) => (value + 1) % SCRIPT.length);
        setPhase("thinking");
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const current = SCRIPT[step];
  const focusPage = current.answer.citations[0].page;
  const page = DOC.pages[focusPage - 1];
  const highlighted = new Set(
    phase === "done" ? current.answer.citations.filter((c) => c.page === focusPage).map((c) => c.paragraph) : [],
  );

  return (
    <div className="gradient-border glass-strong relative overflow-hidden rounded-2xl shadow-2xl shadow-cyan-950/40">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          app.promptdox.ai/workspace/{DOC.id}
        </div>
      </div>

      <div className="grid min-h-[360px] sm:grid-cols-[1.05fr_1fr]">
        {/* Document pane */}
        <div className="hidden border-r border-white/6 bg-black/20 p-5 sm:block">
          <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5 text-red-300" aria-hidden />
              {DOC.name}
            </span>
            <span className="font-mono">
              p. {focusPage}/{DOC.pages.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={focusPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg bg-white/[0.035] p-4 ring-1 ring-white/6"
            >
              <h4 className="mb-3 text-xs font-semibold tracking-wide text-foreground/90">{page.heading}</h4>
              <div className="space-y-2.5">
                {page.paragraphs.map((paragraph, index) => {
                  const active = highlighted.has(index + 1);
                  return (
                    <p
                      key={index}
                      className={cn(
                        "relative rounded-md px-2 py-1.5 text-[11.5px] leading-relaxed text-muted-foreground transition-all duration-500",
                        active && "bg-cyan-400/12 text-cyan-50 ring-1 ring-cyan-300/40 shadow-[0_0_24px_-6px] shadow-cyan-400/50",
                      )}
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chat pane */}
        <div className="flex flex-col p-5">
          <div className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-linear-to-br from-cyan-500/80 to-violet-600/80 px-3.5 py-2 text-[13px] text-white">
                  {current.question}
                </div>
                <div className="flex gap-2.5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-white/6 ring-1 ring-white/10">
                    <Bot className="size-4 text-cyan-300" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white/4 px-3.5 py-2.5 ring-1 ring-white/6">
                    {phase === "thinking" ? (
                      <TypingDots label="Searching 214 chunks" />
                    ) : (
                      <StreamingAnswer
                        content={current.answer.content}
                        citations={current.answer.citations}
                        onDone={() => setPhase("done")}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/4 px-3 py-2 ring-1 ring-white/8">
            <span className="flex-1 truncate text-xs text-muted-foreground/70">Ask anything about this document…</span>
            <span className="grid size-7 place-items-center rounded-lg bg-linear-to-r from-cyan-400 to-violet-500">
              <SendHorizontal className="size-3.5 text-white" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
