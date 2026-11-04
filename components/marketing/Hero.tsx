"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoPreview } from "@/components/marketing/DemoPreview";

const STATS = [
  { value: "< 300ms", label: "median retrieval" },
  { value: "100%", label: "answers with sources" },
  { value: "4 formats", label: "PDF · DOCX · MD · TXT" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:pt-40">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute top-40 -right-40 h-[420px] w-[520px] rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Link
            href="/features"
            className="glass group mx-auto inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex items-center gap-1 rounded-full bg-linear-to-r from-cyan-400/90 to-violet-500/90 px-2 py-0.5 font-medium text-white">
              <Sparkles className="size-3" aria-hidden /> New
            </span>
            Paragraph-level source tracing is here
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>

          <h1 className="mt-7 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Turn Massive Documents into <span className="text-gradient">Real-Time Answers</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            Upload contracts, reports and specs. Ask questions in plain language. Every answer streams back in
            seconds, with a citation that takes you straight to the paragraph it came from.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/sign-up">
                Start for free <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/workspace/q3-financial-report">
                <PlayCircle /> Open live demo
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/80">No credit card required · 10 documents free forever</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div aria-hidden className="absolute -inset-x-10 -inset-y-6 -z-10 rounded-[2rem] bg-linear-to-r from-cyan-500/15 via-transparent to-violet-600/20 blur-2xl" />
          <DemoPreview />
        </motion.div>

        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight">{stat.value}</dd>
              <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
