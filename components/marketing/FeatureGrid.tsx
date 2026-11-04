"use client";

import { motion } from "framer-motion";
import { Building2, FileSearch, Layers, Quote, ShieldCheck, Zap } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { FormatBadge } from "@/components/dashboard/FormatBadge";
import { cn } from "@/lib/utils";
import type { DocFormat } from "@/types";

const FORMATS: DocFormat[] = ["pdf", "docx", "md", "txt"];

function FormatsVisual() {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {FORMATS.map((format, index) => (
        <motion.div
          key={format}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 * index }}
        >
          <FormatBadge format={format} size="lg" />
        </motion.div>
      ))}
    </div>
  );
}

function CitationVisual() {
  return (
    <div className="mt-6 rounded-xl bg-black/25 p-4 text-[13px] leading-relaxed text-muted-foreground ring-1 ring-white/6">
      Net revenue retention reached <span className="text-foreground">128%</span>, a company record{" "}
      <span className="inline-flex items-center rounded-md border border-cyan-300/60 bg-cyan-400/20 px-1.5 font-mono text-[10.5px] text-cyan-50 shadow-[0_0_14px_-2px] shadow-cyan-400/70">
        Page 1, Para 3
      </span>
      <div className="mt-3 border-l-2 border-cyan-400/60 pl-3 text-xs text-cyan-100/80 italic">
        “Net revenue retention reached 128%, the highest in company history…”
      </div>
    </div>
  );
}

function SearchVisual() {
  const bars = [92, 78, 64, 41, 28];
  return (
    <div className="mt-6 space-y-2">
      {bars.map((score, index) => (
        <div key={score} className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="w-12">chunk {String(index + 1).padStart(2, "0")}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500"
              initial={{ width: 0 }}
              whileInView={{ width: `${score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
            />
          </div>
          <span className="w-8 text-right">.{score}</span>
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: Layers,
    title: "Multi-format ingestion",
    body: "Drop PDFs, Word docs, Markdown or plain text. Layout, headings and tables survive parsing intact.",
    visual: <FormatsVisual />,
    className: "lg:col-span-2",
  },
  {
    icon: Quote,
    title: "Zero-hallucination citations",
    body: "Answers are grounded only in your documents, and every claim links back to its exact page and paragraph.",
    visual: <CitationVisual />,
    className: "lg:row-span-2",
  },
  {
    icon: Zap,
    title: "Instant vector search",
    body: "Hybrid dense + keyword retrieval with re-ranking returns the right passages in milliseconds.",
    visual: <SearchVisual />,
    className: "",
  },
  {
    icon: FileSearch,
    title: "Streaming answers",
    body: "Responses stream token by token, so you start reading before the model finishes writing.",
    className: "",
  },
  {
    icon: Building2,
    title: "Multi-tenant by design",
    body: "Each workspace gets an isolated index and encryption keys. No cross-tenant retrieval, ever.",
    className: "",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    body: "SSO, audit logs, SOC 2 controls and bring-your-own-key encryption for regulated teams.",
    className: "lg:col-span-2",
  },
];

export function FeatureGrid({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {showHeading && (
          <SectionHeading
            eyebrow="Features"
            title={
              <>
                Built for documents that are <span className="text-gradient">too long to read</span>
              </>
            }
            description="Everything you need to go from a 300-page file to a trustworthy answer, without the copy-paste."
          />
        )}

        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", showHeading && "mt-14")}>
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={cn(
                "glass group relative overflow-hidden rounded-2xl p-6 transition-colors hover:border-white/15",
                feature.className,
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-cyan-400/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-white/10">
                <feature.icon className="size-5 text-cyan-200" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              {feature.visual}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
