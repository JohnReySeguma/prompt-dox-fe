"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FileQuestion, FileText, MessagesSquare, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { citationKey } from "@/components/workspace/CitedText";
import { DocumentViewer, type ActiveCitation } from "@/components/workspace/DocumentViewer";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn, formatBytes } from "@/lib/utils";
import type { Citation } from "@/types";

type MobileTab = "document" | "chat";

export function WorkspaceView({ docId }: { docId: string }) {
  const doc = useWorkspaceStore((state) => state.documents.find((item) => item.id === docId));
  const chats = useWorkspaceStore((state) => state.chats[docId]);
  const clearChat = useWorkspaceStore((state) => state.clearChat);
  const resumeIndexing = useWorkspaceStore((state) => state.resumeIndexing);

  const [active, setActive] = useState<ActiveCitation | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const nonce = useRef(0);

  useEffect(() => {
    resumeIndexing();
  }, [resumeIndexing]);

  const citedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const message of chats ?? []) {
      if (message.role === "assistant" && !message.streaming) {
        message.citations.forEach((citation) => keys.add(citationKey(citation)));
      }
    }
    return keys;
  }, [chats]);

  const onCite = (citation: Citation) => {
    nonce.current += 1;
    setActive({ citation, nonce: nonce.current });
    setMobileTab("document");
  };

  if (!doc) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <FileQuestion className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold">Document not found</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          It may have been deleted, or it only existed in a previous session. Mock data resets on a full page reload.
        </p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/dashboard">
            <ArrowLeft /> Back to documents
          </Link>
        </Button>
      </div>
    );
  }

  const ready = doc.status === "ready";
  const activeKey = active ? citationKey(active.citation) : null;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col lg:h-dvh">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/6 px-4 py-3 sm:px-6">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to documents">
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base" title={doc.name}>
            {doc.name}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {doc.pages.length} pages · {formatBytes(doc.sizeBytes)}
            {ready && ` · ${doc.chunkCount} chunks`}
          </p>
        </div>
        <StatusBadge doc={doc} />
        {ready && (chats?.length ?? 0) > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearChat(doc.id);
              setActive(null);
            }}
            className="hidden sm:inline-flex"
          >
            <RotateCcw /> New chat
          </Button>
        )}
      </header>

      {/* Mobile tab switcher */}
      <div className="flex gap-1 border-b border-white/6 p-2 lg:hidden" role="tablist" aria-label="Workspace panes">
        {(
          [
            { id: "document", label: "Document", icon: FileText },
            { id: "chat", label: "Chat", icon: MessagesSquare },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm transition-colors",
              mobileTab === tab.id ? "bg-white/8 text-foreground" : "text-muted-foreground",
            )}
          >
            <tab.icon className="size-4" aria-hidden /> {tab.label}
          </button>
        ))}
      </div>

      {/* Split panes */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section
          aria-label="Document viewer"
          className={cn("min-h-0 border-white/6 lg:block lg:border-r", mobileTab === "document" ? "block" : "hidden")}
        >
          <DocumentViewer doc={doc} active={active} citedKeys={citedKeys} />
        </section>
        <section aria-label="Chat" className={cn("min-h-0 lg:block", mobileTab === "chat" ? "block" : "hidden")}>
          {ready ? (
            <ChatPanel doc={doc} activeKey={activeKey} onCite={onCite} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="bg-shimmer size-12 animate-shimmer rounded-2xl ring-1 ring-cyan-400/30" />
              <h2 className="mt-4 font-semibold">Preparing your document</h2>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                We&apos;re chunking and embedding the content. Chat unlocks automatically when indexing finishes.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
