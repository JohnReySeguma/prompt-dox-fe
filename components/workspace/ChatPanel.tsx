"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { LogoMark } from "@/components/branding/Logo";
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
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const node = event.currentTarget;
          stickToBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        }}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7"
        aria-live="polite"
      >
        {messages.length === 0 && !thinking ? (
          <div className="flex h-full flex-col items-start justify-end pb-4">
            <LogoMark size={36} />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">What do you want to know?</h2>
            <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">
              Answers come only from <span className="text-foreground">{doc.name}</span>, with a citation for every claim.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-7">
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
            {thinking && (
              <div className="flex items-center gap-3">
                <LogoMark size={26} />
                <TypingDots label={`Searching ${doc.chunkCount} passages`} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 pt-3 pb-4 sm:px-6">
        {messages.length < 3 && (
          <div className="mx-auto mb-3 flex max-w-2xl flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={busy}
                onClick={() => submit(suggestion)}
                className="rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary disabled:opacity-50"
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
          className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-border-strong bg-surface p-2 transition-shadow focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15"
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask a question
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={draft}
            placeholder="Ask about this document"
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
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-subtle-foreground focus-visible:outline-none"
          />
          <Button type="submit" size="icon" disabled={busy || !draft.trim()} aria-label="Send question">
            <ArrowUp />
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-subtle-foreground">
          Enter sends, Shift + Enter adds a line. Answers in this prototype are simulated.
        </p>
      </div>
    </div>
  );
}
