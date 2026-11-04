"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, Copy, ThumbsUp } from "lucide-react";
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
  return text.length > 110 ? `${text.slice(0, 110).trimEnd()}…` : text;
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-white/10">
        <Bot className="size-4 text-cyan-200" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md bg-white/4 px-4 py-3 text-sm leading-relaxed text-foreground/90 ring-1 ring-white/6">
          <CitedText text={text} citations={message.citations} activeKey={activeKey} onCite={onCite} />
          {!done && <span aria-hidden className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-blink bg-cyan-300" />}
        </div>

        {done && message.citations.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-2.5">
            <p className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground/80 uppercase">Sources</p>
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
                        "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                        isActive
                          ? "border-cyan-300/50 bg-cyan-400/10"
                          : "border-white/6 bg-white/2 hover:border-white/15 hover:bg-white/4",
                      )}
                    >
                      <span className="shrink-0 rounded-md bg-cyan-400/15 px-1.5 py-0.5 font-mono text-[10px] text-cyan-200">
                        p.{citation.page} ¶{citation.paragraph}
                      </span>
                      <span className="line-clamp-2 text-muted-foreground">{sourceSnippet(doc, citation)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        {done && (
          <div className="mt-1.5 flex gap-0.5">
            <button
              type="button"
              onClick={copy}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label={copied ? "Copied" : "Copy answer"}
            >
              {copied ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setLiked((value) => !value)}
              aria-pressed={liked}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Helpful answer"
            >
              <ThumbsUp className={cn("size-3.5", liked && "fill-cyan-300/30 text-cyan-300")} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-linear-to-br from-cyan-500/85 to-violet-600/85 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white shadow-lg shadow-cyan-950/30">
        {message.content}
      </p>
    </motion.div>
  );
}
