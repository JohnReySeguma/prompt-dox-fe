"use client";

import { motion } from "framer-motion";
import { BrainCircuit, MessagesSquare, ScanSearch, Upload, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";

const STEPS: Array<{ icon: LucideIcon; title: string; body: string; detail: string }> = [
  {
    icon: Upload,
    title: "Upload",
    body: "Drag in any PDF, DOCX, Markdown or TXT file, or a whole folder at once.",
    detail: "parse · OCR · structure",
  },
  {
    icon: BrainCircuit,
    title: "Vectorize",
    body: "We chunk semantically and embed each passage into your tenant-isolated index.",
    detail: "chunk · embed · index",
  },
  {
    icon: MessagesSquare,
    title: "Query",
    body: "Ask in natural language. Hybrid retrieval finds the best passages and the answer streams back.",
    detail: "retrieve · rerank · stream",
  },
  {
    icon: ScanSearch,
    title: "Trace Source",
    body: "Click any citation to jump to the highlighted paragraph inside the original document.",
    detail: "cite · highlight · verify",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 px-4 py-24">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-96 -translate-y-1/2 bg-violet-600/8 blur-[120px]" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title="From upload to verified answer in four steps"
          description="No prompt engineering, no pipelines to maintain. PromptDox handles the retrieval stack so you can focus on the questions."
        />

        <ol className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
          {/* Connector line (desktop) */}
          <div aria-hidden className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px lg:block">
            <div className="h-full w-full bg-white/8" />
            <motion.div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-cyan-400 via-sky-400 to-violet-500 shadow-[0_0_12px] shadow-cyan-400/60"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </div>
          {/* Connector line (mobile) */}
          <div aria-hidden className="absolute top-0 bottom-0 left-7 w-px bg-linear-to-b from-cyan-400/60 to-violet-500/60 lg:hidden" />

          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.25 + index * 0.25 }}
              className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center"
            >
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-background ring-1 ring-white/12">
                <span className="absolute inset-0 rounded-2xl bg-linear-to-br from-cyan-400/20 to-violet-500/25" />
                <step.icon className="relative size-6 text-cyan-200" aria-hidden />
                <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-linear-to-r from-cyan-400 to-violet-500 font-mono text-[10px] font-bold text-white">
                  {index + 1}
                </span>
              </span>
              <div className="lg:mt-6">
                <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                <p className="mt-3 font-mono text-[11px] tracking-wide text-cyan-300/80">{step.detail}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
