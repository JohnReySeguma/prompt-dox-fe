"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/branding/Logo";
import { CitedText } from "@/components/workspace/CitedText";
import { TypingDots } from "@/components/workspace/TypingDots";
import { useTypewriter } from "@/hooks/use-typewriter";
import { HERO_DOC as DOC, HERO_SCRIPT as SCRIPT } from "@/content/hero-sample";
import { cn } from "@/lib/utils";
import type { Citation } from "@/types";

type Phase = "asking" | "thinking" | "streaming" | "marked";

function StreamingAnswer({ content, citations, onDone }: { content: string; citations: Citation[]; onDone: () => void }) {
  const { text, done } = useTypewriter(content, { interval: 20, onDone });
  return (
    <p className="text-[14px] leading-relaxed text-foreground">
      <CitedText text={text} citations={citations} />
      {!done && <span aria-hidden className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-blink bg-primary" />}
    </p>
  );
}

/**
 * The hero's one orchestrated moment: a question lands in the margin of a real
 * report page, the answer streams in, and a highlighter sweeps over the
 * sentences it came from.
 */
export function HeroDocument() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("asking");

  useEffect(() => {
    const delays: Partial<Record<Phase, number>> = { asking: 900, thinking: 1000, marked: 5200 };
    const delay = delays[phase];
    if (delay === undefined) return;
    const timer = setTimeout(() => {
      if (phase === "asking") setPhase("thinking");
      else if (phase === "thinking") setPhase("streaming");
      else {
        setStep((value) => (value + 1) % SCRIPT.length);
        setPhase("asking");
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [phase]);

  const current = SCRIPT[step];
  const pageNumber = current.answer.citations[0].page;
  const page = DOC.pages[pageNumber - 1];
  const cited = new Set(current.answer.citations.filter((c) => c.page === pageNumber).map((c) => c.paragraph));

  return (
    <div className="relative pt-6 pb-4 lg:pt-10 lg:pb-24 lg:pl-10">
      {/* The rest of the report, stacked underneath */}
      <div aria-hidden className="absolute top-14 right-[-14px] bottom-10 left-14 hidden rounded-[6px] border border-border bg-surface lg:block" />
      <div aria-hidden className="absolute top-12 right-[-7px] bottom-12 left-12 hidden rounded-[6px] border border-border bg-surface lg:block" />

      <article
        aria-label="Example report page"
        className="relative rounded-[6px] border border-border bg-surface px-7 pt-6 pb-9 shadow-paper sm:px-10 lg:min-h-[440px]"
      >
        <header className="flex items-baseline justify-between gap-4 border-b border-border pb-3 text-xs text-muted-foreground">
          <span className="truncate">{DOC.name}</span>
          <span className="shrink-0 tabular-nums">
            Page {pageNumber} of {DOC.pages.length}
          </span>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={pageNumber} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <h3 className="mt-6 font-serif text-[22px] font-medium tracking-tight">{page.heading}</h3>
            <div className="mt-4 space-y-4 font-serif text-[15.5px] leading-[1.7] text-foreground/80">
              {page.paragraphs.map((paragraph, index) => (
                <p key={index}>
                  <span className={cn(cited.has(index + 1) && "marker text-foreground", cited.has(index + 1) && (phase === "marked" ? "marker-on" : "marker-off"))}>
                    {paragraph}
                  </span>
                </p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </article>

      {/* Question, pinned in the margin */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`q-${step}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-4 w-fit max-w-[300px] rounded-2xl rounded-bl-[4px] bg-primary px-4 py-2.5 text-[14px] text-white shadow-lift lg:absolute lg:top-0 lg:left-0 lg:mt-0"
        >
          {current.question}
        </motion.p>
      </AnimatePresence>

      {/* Answer card, overlapping the page edge */}
      <div className="relative mt-3 rounded-xl border border-border bg-surface p-4 shadow-lift lg:absolute lg:right-[-28px] lg:bottom-0 lg:mt-0 lg:w-[400px]">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <LogoMark size={18} />
          PromptDox
        </div>
        <div className="min-h-[72px]">
          {phase === "asking" || phase === "thinking" ? (
            <TypingDots label={phase === "asking" ? "Reading the question" : `Searching ${DOC.chunkCount} passages`} />
          ) : (
            <StreamingAnswer
              key={step}
              content={current.answer.content}
              citations={current.answer.citations}
              onDone={() => setPhase("marked")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
