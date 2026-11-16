"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { LogoMark } from "@/components/branding/Logo";
import { CitedText, citationKey } from "@/components/workspace/CitedText";
import { sendFeedback } from "@/lib/api/chat";
import { cn } from "@/lib/utils";
import type { ChatMessage, Citation, DocPage } from "@/types";

interface AssistantMessageProps {
  message: ChatMessage;
  /** Loaded pages, used to quote the cited paragraph under "Sources". */
  pages: DocPage[] | undefined;
  activeKey: string | null;
  onCite: (citation: Citation) => void;
  /** Show thumbs up/down (sent to the API). */
  allowFeedback?: boolean;
}

function sourceSnippet(pages: DocPage[] | undefined, citation: Citation): string {
  const text = pages?.find((page) => page.number === citation.page)?.paragraphs[citation.paragraph - 1] ?? "";
  return text.length > 120 ? `${text.slice(0, 120).trimEnd()}…` : text;
}

function uniqueCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  // While streaming the array can be sparse; skip the holes.
  return citations.filter((citation) => {
    if (!citation) return false;
    const key = citationKey(citation);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Thumbs up/down, sent once per answer (`POST /v1/messages/{id}/feedback`). */
function Feedback({ messageId }: { messageId: string }) {
  const [given, setGiven] = useState<boolean | null>(null);
  const feedback = useMutation({
    mutationFn: (helpful: boolean) => sendFeedback(messageId, helpful),
    onMutate: (helpful) => setGiven(helpful),
    onError: () => setGiven(null),
  });

  if (given !== null) {
    return <span className="px-1.5 py-1 text-xs text-subtle-foreground">Thanks for the feedback</span>;
  }
  return (
    <>
      <button
        type="button"
        onClick={() => feedback.mutate(true)}
        className="rounded-md p-1.5 text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Helpful answer"
      >
        <ThumbsUp className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => feedback.mutate(false)}
        className="rounded-md p-1.5 text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Unhelpful answer"
      >
        <ThumbsDown className="size-3.5" />
      </button>
    </>
  );
}

export function AssistantMessage({ message, pages, activeKey, onCite, allowFeedback = true }: AssistantMessageProps) {
  const text = message.content;
  const done = !message.streaming;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content.replace(/\s?\[\d+\]/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); ignore in the prototype.
    }
  };

  return (
    <div className="flex gap-3">
      <LogoMark size={26} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-[1.7] text-foreground">
          <CitedText text={text} citations={message.citations} activeKey={activeKey} onCite={onCite} />
          {!done && <span aria-hidden className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-primary" />}
        </p>

        {done && message.citations.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Sources</p>
            <ul className="grid gap-1.5">
              {uniqueCitations(message.citations).map((citation) => {
                const key = citationKey(citation);
                const isActive = key === activeKey;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => onCite(citation)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                        isActive ? "border-marker-edge bg-marker-soft" : "border-border bg-surface hover:border-border-strong",
                      )}
                    >
                      <span className="w-[74px] shrink-0 pt-px text-[12px] font-medium text-foreground">
                        Page {citation.page}, ¶{citation.paragraph}
                      </span>
                      <span className="line-clamp-2 font-serif text-[13.5px] leading-snug text-muted-foreground">
                        {sourceSnippet(pages, citation)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {done && (
          <div className="mt-1.5 -ml-1.5 flex gap-0.5">
            <button
              type="button"
              onClick={copy}
              className="rounded-md p-1.5 text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={copied ? "Copied" : "Copy answer"}
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            </button>
            {allowFeedback && <Feedback messageId={message.id} />}
          </div>
        )}
      </div>
    </div>
  );
}

export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <p
        className={cn(
          "max-w-[85%] rounded-2xl rounded-br-[4px] bg-primary px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-white transition-opacity",
          message.pending && "opacity-80",
        )}
      >
        {message.content}
      </p>
    </div>
  );
}
