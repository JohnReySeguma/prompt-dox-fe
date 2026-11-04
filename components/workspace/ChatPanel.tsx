"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, CornerDownLeft, Sparkles } from "lucide-react";
import { AssistantMessage, UserMessage } from "@/components/workspace/ChatMessageBubble";
import { TypingDots } from "@/components/workspace/TypingDots";
import { Button } from "@/components/ui/button";
import { getSuggestions } from "@/mock/knowledge";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { ChatMessage, Citation, DocumentItem } from "@/types";

const EMPTY: ChatMessage[] = [];

interface ChatPanelProps {
  doc: DocumentItem;
  activeKey: string | null;
  onCite: (citation: Citation) => void;
}

export function ChatPanel({ doc, activeKey, onCite }: ChatPanelProps) {
  const messages = useWorkspaceStore((state) => state.chats[doc.id] ?? EMPTY);
  const thinking = useWorkspaceStore((state) => Boolean(state.thinking[doc.id]));
  const sendMessage = useWorkspaceStore((state) => state.sendMessage);
  const completeMessage = useWorkspaceStore((state) => state.completeMessage);

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const streaming = messages.some((message) => message.streaming);
  const busy = thinking || streaming;
  const suggestions = getSuggestions(doc.id);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (node && stickToBottom.current) node.scrollTop = node.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, thinking, scrollToBottom]);

  const submit = (text: string) => {
    if (!text.trim() || busy) return;
    stickToBottom.current = true;
    sendMessage(doc.id, text);
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "";
  };

  const onStreamEnd = useCallback((id: string) => completeMessage(doc.id, id), [completeMessage, doc.id]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const node = event.currentTarget;
          stickToBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        }}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6"
        aria-live="polite"
      >
        {messages.length === 0 && !thinking ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-linear-to-br from-cyan-400/20 to-violet-500/25 ring-1 ring-white/10">
              <Sparkles className="size-5 text-cyan-200" aria-hidden />
            </span>
            <h2 className="mt-4 font-semibold">Ask anything about this document</h2>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Answers are grounded in <span className="text-foreground">{doc.name}</span> and cite the exact paragraph.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage
                  key={message.id}
                  message={message}
                  doc={doc}
                  activeKey={activeKey}
                  onCite={onCite}
                  onStreamEnd={onStreamEnd}
                  onProgress={scrollToBottom}
                />
              ),
            )}
            <AnimatePresence>
              {thinking && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Bot className="size-4 text-cyan-200" aria-hidden />
                  </span>
                  <div className="rounded-2xl rounded-tl-md bg-white/4 px-4 py-3 ring-1 ring-white/6">
                    <TypingDots label={`Searching ${doc.chunkCount} chunks`} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="border-t border-white/6 p-3 sm:p-4">
        {messages.length < 3 && (
          <div className="mx-auto mb-3 flex max-w-2xl flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={busy}
                onClick={() => submit(suggestion)}
                className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-cyan-400/40 hover:text-cyan-100 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
          className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl bg-white/4 p-2 ring-1 ring-white/10 transition-shadow focus-within:ring-cyan-400/40 focus-within:shadow-[0_0_30px_-10px] focus-within:shadow-cyan-400/50"
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask a question
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={draft}
            placeholder="Ask a question about this document…"
            onChange={(event) => {
              setDraft(event.target.value);
              const node = event.target;
              node.style.height = "auto";
              node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit(draft);
              }
            }}
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:outline-none"
          />
          <Button type="submit" size="icon" disabled={busy || !draft.trim()} aria-label="Send question">
            <ArrowUp />
          </Button>
        </form>
        <p className="mx-auto mt-2 flex max-w-2xl items-center gap-1 text-[11px] text-muted-foreground/70">
          <CornerDownLeft className="size-3" aria-hidden /> Enter to send · Shift + Enter for a new line · Responses are simulated
        </p>
      </div>
    </div>
  );
}
