"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Quote } from "lucide-react";
import { FormatBadge } from "@/components/dashboard/FormatBadge";
import { citationKey } from "@/components/workspace/CitedText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Citation, DocumentItem } from "@/types";

export interface ActiveCitation {
  citation: Citation;
  /** Increments on every click so re-selecting the same citation re-triggers scroll + pulse. */
  nonce: number;
}

interface DocumentViewerProps {
  doc: DocumentItem;
  active: ActiveCitation | null;
  /** Paragraphs referenced by any answer in the conversation. */
  citedKeys: Set<string>;
}

const ZOOM_STEPS = [0.85, 1, 1.15, 1.3];

export function DocumentViewer({ doc, active, citedKeys }: DocumentViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const activeKey = active ? citationKey(active.citation) : null;

  // Scroll the cited paragraph into view whenever a citation is clicked.
  useEffect(() => {
    if (!active) return;
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-para="${citationKey(active.citation)}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  // Track which page is currently in view for the toolbar indicator.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrentPage(Number((visible.target as HTMLElement).dataset.page));
      },
      { root, threshold: [0.25, 0.5, 0.75] },
    );
    root.querySelectorAll("[data-page]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [doc.id]);

  const jumpToPage = (page: number) => {
    scrollRef.current?.querySelector(`[data-page="${page}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const zoom = ZOOM_STEPS[zoomIndex];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/6 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FormatBadge format={doc.format} />
          <div className="flex items-center gap-0.5" role="group" aria-label="Pages">
            {doc.pages.map((page) => (
              <button
                key={page.number}
                type="button"
                onClick={() => jumpToPage(page.number)}
                aria-label={`Go to page ${page.number}`}
                aria-current={currentPage === page.number ? "page" : undefined}
                className={cn(
                  "grid size-7 place-items-center rounded-md font-mono text-[11px] transition-colors",
                  currentPage === page.number ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5",
                )}
              >
                {page.number}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((value) => value - 1)}
          >
            <Minus />
          </Button>
          <span className="w-10 text-center font-mono text-[11px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            onClick={() => setZoomIndex((value) => value + 1)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      {/* Pages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-black/25 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-6" style={{ fontSize: `${zoom}rem` }}>
          {doc.pages.map((page) => (
            <article
              key={page.number}
              data-page={page.number}
              aria-label={`Page ${page.number}`}
              className="relative scroll-mt-4 rounded-xl bg-[oklch(0.2_0.015_275)] px-[2.2em] py-[2.4em] shadow-2xl shadow-black/40 ring-1 ring-white/8"
            >
              <header className="mb-[1.4em] flex items-baseline justify-between gap-4 border-b border-white/8 pb-[0.8em]">
                <h2 className="text-[1.05em] font-semibold tracking-tight">{page.heading}</h2>
                <span className="font-mono text-[0.7em] text-muted-foreground">
                  {page.number} / {doc.pages.length}
                </span>
              </header>
              <div className="space-y-[0.9em]">
                {page.paragraphs.map((text, index) => {
                  const key = `${page.number}-${index + 1}`;
                  const isActive = key === activeKey;
                  const isCited = citedKeys.has(key);
                  return (
                    <div key={key} data-para={key} className="group relative scroll-my-24">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-[0.35em] -left-[1.7em] hidden font-mono text-[0.62em] sm:block",
                          isActive ? "text-cyan-300" : "text-white/20 group-hover:text-white/40",
                        )}
                      >
                        ¶{index + 1}
                      </span>
                      <p
                        className={cn(
                          "relative rounded-lg px-[0.6em] py-[0.4em] text-[0.875em] leading-[1.75] transition-colors duration-500",
                          isActive
                            ? "text-cyan-50"
                            : isCited
                              ? "text-foreground/85 underline decoration-cyan-400/40 decoration-dotted underline-offset-4"
                              : "text-muted-foreground",
                        )}
                      >
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              key={active?.nonce}
                              aria-hidden
                              className="absolute inset-0 -z-0 rounded-lg bg-cyan-400/12 ring-1 ring-cyan-300/50"
                              initial={{ opacity: 0, scale: 0.98, boxShadow: "0 0 0px 0px rgba(34,211,238,0)" }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                boxShadow: [
                                  "0 0 0px 0px rgba(34,211,238,0)",
                                  "0 0 36px 2px rgba(34,211,238,0.45)",
                                  "0 0 18px -2px rgba(34,211,238,0.3)",
                                ],
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.9 }}
                            />
                          )}
                        </AnimatePresence>
                        <span className="relative">{text}</span>
                      </p>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-3 right-2 inline-flex items-center gap-1 rounded-full bg-linear-to-r from-cyan-400 to-violet-500 px-2 py-0.5 text-[10px] font-medium text-white shadow-lg"
                        >
                          <Quote className="size-2.5" aria-hidden /> Cited source
                        </motion.span>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
