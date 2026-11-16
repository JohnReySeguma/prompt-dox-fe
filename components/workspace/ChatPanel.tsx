"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, CircleAlert, Square, X } from "lucide-react";
import { LogoMark } from "@/components/branding/Logo";
import { AssistantMessage, UserMessage } from "@/components/workspace/ChatMessageBubble";
import { TypingDots } from "@/components/workspace/TypingDots";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat, type ChatPhase } from "@/hooks/use-chat";
import { useSettings, useSuggestions } from "@/lib/queries";
import type { ChatMessage, Citation, DocPage, DocumentItem } from "@/types";

const MAX_QUESTION = 2000;

interface ChatPanelProps {
  doc: DocumentItem;
  pages: DocPage[] | undefined;
  /** Saved history, oldest first. */
  messages: ChatMessage[];
  activeKey: string | null;
  onCite: (citation: Citation) => void;
}

function phaseLabel(phase: ChatPhase, doc: DocumentItem): string {
  if (phase.stage === "searching") {
    const passages = phase.passages ?? doc.chunkCount;
    return `Searching ${passages.toLocaleString("en-US")} passages`;
  }
  return "Writing the answer";
}

export function ChatPanel({ doc, pages, messages, activeKey, onCite }: ChatPanelProps) {
  const chat = useChat(doc.id);
  const { data: suggestions } = useSuggestions(doc.id);
  const { data: settings } = useSettings();
  const streamAnswers = settings?.streamAnswers ?? true;

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const streamingAnswer = chat.pending.find((message) => message.role === "assistant");
  // With streaming turned off in settings, hold the answer back until it's saved.
  const visiblePending = streamAnswers ? chat.pending : chat.pending.filter((message) => message.role === "user");
  const conversation = [...messages, ...visiblePending];
  const showTyping = chat.busy && (!streamingAnswer || !streamAnswers);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (node && stickToBottom.current) node.scrollTop = node.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.length, streamingAnswer?.content, chat.phase.stage, chat.error, scrollToBottom]);

  const submit = (text: string) => {
    const question = text.trim();
    if (!question || chat.busy) return;
    stickToBottom.current = true;
    chat.send(question.slice(0, MAX_QUESTION));
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "";
  };

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
        {conversation.length === 0 && !chat.busy ? (
          <div className="flex h-full flex-col items-start justify-end pb-4">
            <LogoMark size={36} />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">What do you want to know?</h2>
            <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">
              Answers come only from <span className="text-foreground">{doc.name}</span>, with a citation for every claim.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-7">
            {conversation.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AssistantMessage
                  key={message.id}
                  message={message}
                  pages={pages}
                  activeKey={activeKey}
                  onCite={onCite}
                />
              ),
            )}
            {showTyping && (
              <div className="flex items-center gap-3">
                <LogoMark size={26} />
                <TypingDots label={phaseLabel(chat.phase, doc)} />
              </div>
            )}
            {chat.error && (
              <div role="alert" className="flex items-start gap-3 rounded-lg border border-[#f1d9a8] bg-[#fdf6e7] p-3 text-sm text-[#6b4300]">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p className="flex-1">{chat.error}</p>
                <button type="button" onClick={chat.dismissError} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
                  <X className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 pt-3 pb-4 sm:px-6">
        {conversation.length < 3 && (
          <div className="mx-auto mb-3 flex max-w-2xl flex-wrap gap-1.5">
            {suggestions === undefined
              ? [0, 1, 2].map((index) => <Skeleton key={index} className="h-8 w-44 rounded-lg" />)
              : suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={chat.busy}
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
            maxLength={MAX_QUESTION}
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
          {chat.busy ? (
            <Button type="button" size="icon" variant="secondary" onClick={chat.stop} aria-label="Stop answering">
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send question">
              <ArrowUp />
            </Button>
          )}
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-subtle-foreground">
          Enter sends, Shift + Enter adds a line. Stopping an answer discards it and doesn&apos;t count toward your daily limit.
        </p>
      </div>
    </div>
  );
}
