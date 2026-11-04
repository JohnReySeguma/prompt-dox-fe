"use client";

import { Fragment } from "react";
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

/** A small highlighter-coloured tab that points at a page and paragraph. */
export function CitationBadge({ citation, active = false, onClick, className }: CitationBadgeProps) {
  const label = `Page ${citation.page}, Para ${citation.paragraph}`;
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      {...(onClick
        ? { type: "button" as const, onClick: () => onClick(citation), "aria-pressed": active, "aria-label": `Show source: ${label}` }
        : {})}
      className={cn(
        "mx-0.5 inline-flex translate-y-[-1px] items-center rounded-[5px] border px-1.5 align-middle text-[11px] leading-[18px] font-medium whitespace-nowrap text-foreground transition-colors",
        active ? "border-marker-edge bg-marker" : "border-marker-edge/60 bg-marker-soft",
        onClick && "cursor-pointer hover:bg-marker",
        className,
      )}
    >
      {label}
    </Comp>
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
          <CitationBadge key={index} citation={citation} active={activeKey === citationKey(citation)} onClick={onCite} />
        );
      })}
    </>
  );
}
