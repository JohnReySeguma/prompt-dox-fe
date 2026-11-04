"use client";

import { Fragment } from "react";
import { FileText } from "lucide-react";
import type { Citation } from "@/types";
import { cn } from "@/lib/utils";

export function citationKey(citation: Citation): string {
  return `${citation.page}-${citation.paragraph}`;
}

interface CitationBadgeProps {
  citation: Citation;
  active?: boolean;
  onClick?: (citation: Citation) => void;
  className?: string;
}

export function CitationBadge({ citation, active = false, onClick, className }: CitationBadgeProps) {
  const label = `Page ${citation.page}, Para ${citation.paragraph}`;
  return (
    <button
      type="button"
      onClick={() => onClick?.(citation)}
      aria-pressed={active}
      aria-label={`Show source: ${label}`}
      className={cn(
        "mx-0.5 inline-flex translate-y-[-1px] items-center gap-1 rounded-md border px-1.5 py-px align-middle font-mono text-[10.5px] font-medium leading-4 transition-all",
        active
          ? "border-cyan-300/70 bg-cyan-400/25 text-cyan-50 shadow-[0_0_14px_-2px] shadow-cyan-400/70"
          : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:border-cyan-300/60 hover:bg-cyan-400/20",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      <FileText className="size-3" aria-hidden />
      {label}
    </button>
  );
}

interface CitedTextProps {
  text: string;
  citations: Citation[];
  activeKey?: string | null;
  onCite?: (citation: Citation) => void;
}

/**
 * Renders text containing `[n]` markers, swapping each marker for a citation badge.
 * A partially streamed marker at the end (e.g. `[` or `[2`) is hidden until complete.
 */
export function CitedText({ text, citations, activeKey, onCite }: CitedTextProps) {
  const safe = text.replace(/\[\d*$/, "");
  const parts = safe.split(/(\[\d+\])/g);

  return (
    <>
      {parts.map((part, index) => {
        const match = /^\[(\d+)\]$/.exec(part);
        if (!match) return <Fragment key={index}>{part}</Fragment>;
        const citation = citations[Number(match[1]) - 1];
        if (!citation) return null;
        return (
          <CitationBadge
            key={index}
            citation={citation}
            active={activeKey === citationKey(citation)}
            onClick={onCite}
          />
        );
      })}
    </>
  );
}
