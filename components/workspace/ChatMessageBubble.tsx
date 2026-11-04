"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ThumbsUp } from "lucide-react";
import { LogoMark } from "@/components/branding/Logo";
import { CitedText, citationKey } from "@/components/workspace/CitedText";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";
import type { ChatMessage, Citation, DocumentItem } from "@/types";

interface AssistantMessageProps {
  message: ChatMessage;
  doc: DocumentItem;
  activeKey: string | null;
  onCite: (citation: Citation) => void;
  onStreamEnd: (messageId: string) => void;
  /** Called as streamed text grows, so the panel can keep the newest text in view. */
  onProgress: () => void;
}

function sourceSnippet(doc: DocumentItem, citation: Citation): string {
  const text = doc.pages[citation.page - 1]?.paragraphs[citation.paragraph - 1] ?? "";
  return text.length > 120 ? `${text.slice(0, 120).trimEnd()}…` : text;
}

function uniqueCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  return citations.filter((citation) => {
    const key = citationKey(citation);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function AssistantMessage({ message, doc, activeKey, onCite, onStreamEnd, onProgress }: AssistantMessageProps) {
  const { text, done } = useTypewriter(message.content, {
    enabled: Boolean(message.streaming),
    interval: 16,
    onDone: () => onStreamEnd(message.id),
  });
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    onProgress();
  }, [text, done, onProgress]);

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
                        {sourceSnippet(doc, citation)}
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
            <button
              type="button"
              onClick={() => setLiked((value) => !value)}
              aria-pressed={liked}
              className="rounded-md p-1.5 text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Mark answer as helpful"
            >
              <ThumbsUp className={cn("size-3.5", liked && "fill-primary/15 text-primary")} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-[4px] bg-primary px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-white">
        {message.content}
      </p>
    </div>
  );
}
