"use client";

import { ChatView } from "@/components/workspace/ChatView";
import { useChat, type ChatPhase } from "@/hooks/use-chat";
import { useSettings, useSuggestions } from "@/lib/queries";
import type { ChatMessage, Citation, DocPage, DocumentItem } from "@/types";

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

/** Chat against the API: saved history plus the answer streaming in over SSE. */
export function ChatPanel({ doc, pages, messages, activeKey, onCite }: ChatPanelProps) {
  const chat = useChat(doc.id);
  const { data: suggestions } = useSuggestions(doc.id);
  const { data: settings } = useSettings();
  const streamAnswers = settings?.streamAnswers ?? true;

  const streamingAnswer = chat.pending.find((message) => message.role === "assistant");
  // With streaming turned off in settings, hold the answer back until it's saved.
  const visiblePending = streamAnswers ? chat.pending : chat.pending.filter((message) => message.role === "user");
  const showTyping = chat.busy && (!streamingAnswer || !streamAnswers);

  return (
    <ChatView
      docName={doc.name}
      pages={pages}
      conversation={[...messages, ...visiblePending]}
      busy={chat.busy}
      typingLabel={showTyping ? phaseLabel(chat.phase, doc) : null}
      error={chat.error}
      onDismissError={chat.dismissError}
      suggestions={suggestions}
      onSend={chat.send}
      onStop={chat.stop}
      activeKey={activeKey}
      onCite={onCite}
      footnote="Enter sends, Shift + Enter adds a line. Stopping an answer discards it and doesn't count toward your daily limit."
    />
  );
}
