"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FormatBadge } from "@/components/dashboard/FormatBadge";
import { citationKey } from "@/components/workspace/CitedText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Citation, DocumentItem } from "@/types";

export interface ActiveCitation {
  citation: Citation;
  /** Increments on every click so re-selecting the same citation re-triggers the scroll and sweep. */
  nonce: number;
}

interface DocumentViewerProps {
  doc: DocumentItem;
  active: ActiveCitation | null;
  /** Paragraphs referenced by any answer in the conversation. */
  citedKeys: Set<string>;
}

const ZOOM_STEPS = [0.85, 1, 1.15, 1.3];

/** Highlighter that sweeps in on mount; remounted (via key) on every citation click. */
function SweepingMarker({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <span className={cn("marker", on ? "marker-on" : "marker-off")}>{children}</span>;
}

export function DocumentViewer({ doc, active, citedKeys }: DocumentViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const activeKey = active ? citationKey(active.citation) : null;

  // Bring the cited paragraph into view whenever a citation is clicked.
  useEffect(() => {
    if (!active) return;
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-para="${citationKey(active.citation)}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  // Track which page is in view for the toolbar.
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
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-3">
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
                  "grid size-7 place-items-center rounded-md text-[12px] tabular-nums transition-colors",
                  currentPage === page.number ? "bg-foreground font-medium text-white" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {page.number}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Zoom out" disabled={zoomIndex === 0} onClick={() => setZoomIndex((v) => v - 1)}>
            <Minus />
          </Button>
          <span className="w-11 text-center text-[12px] text-muted-foreground tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            onClick={() => setZoomIndex((v) => v + 1)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      {/* Pages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-[#e9ebef] px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-[680px] space-y-6" style={{ fontSize: `${zoom}rem` }}>
          {doc.pages.map((page) => (
            <article
              key={page.number}
              data-page={page.number}
              aria-label={`Page ${page.number}`}
              className="scroll-mt-4 rounded-[4px] bg-surface px-[2.6em] py-[2.4em] shadow-paper"
            >
              <header className="mb-[1.6em] flex items-baseline justify-between gap-4 text-[0.72em] text-subtle-foreground">
                <span className="truncate">{doc.name}</span>
                <span className="shrink-0 tabular-nums">
                  {page.number} / {doc.pages.length}
                </span>
              </header>
              <h2 className="font-serif text-[1.4em] leading-tight font-medium tracking-tight">{page.heading}</h2>
              <div className="mt-[1em] space-y-[1em] font-serif text-[1.02em] leading-[1.75] text-foreground/85">
                {page.paragraphs.map((text, index) => {
                  const key = `${page.number}-${index + 1}`;
                  const isActive = key === activeKey;
                  const isCited = citedKeys.has(key);
                  return (
                    <div key={key} data-para={key} className="group relative scroll-my-24">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-[0.3em] -left-[1.9em] hidden font-sans text-[0.62em] tabular-nums sm:block",
                          isActive ? "font-semibold text-foreground" : "text-transparent group-hover:text-subtle-foreground",
                        )}
                      >
                        ¶{index + 1}
                      </span>
                      <p className={cn(isActive && "text-foreground")}>
                        {isActive ? (
                          <SweepingMarker key={active?.nonce}>{text}</SweepingMarker>
                        ) : (
                          <span
                            className={cn(isCited && "underline decoration-marker-edge decoration-2 underline-offset-[5px]")}
                          >
                            {text}
                          </span>
                        )}
                      </p>
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
