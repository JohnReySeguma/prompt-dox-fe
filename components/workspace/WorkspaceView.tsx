"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FileQuestion, LoaderCircle, RotateCcw } from "lucide-react";
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
        <FileQuestion className="size-9 text-subtle-foreground" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold">This document isn&apos;t in your library</h1>
        <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">
          It may have been deleted. Sample data also resets when you reload the page.
        </p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/dashboard">Back to documents</Link>
        </Button>
      </div>
    );
  }

  const ready = doc.status === "ready";
  const activeKey = active ? citationKey(active.citation) : null;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col lg:h-dvh">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-5">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to documents">
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold" title={doc.name}>
            {doc.name}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {doc.pages.length} pages, {formatBytes(doc.sizeBytes)}
            {ready && `, ${doc.chunkCount} passages indexed`}
          </p>
        </div>
        {!ready && <StatusBadge doc={doc} />}
        {ready && (chats?.length ?? 0) > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearChat(doc.id);
              setActive(null);
            }}
          >
            <RotateCcw /> <span className="hidden sm:inline">New conversation</span>
          </Button>
        )}
      </header>

      {/* Mobile pane switcher */}
      <div className="flex border-b border-border bg-surface lg:hidden" role="tablist" aria-label="Workspace panes">
        {(
          [
            { id: "document", label: "Document" },
            { id: "chat", label: "Conversation" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors",
              mobileTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section
          aria-label="Document"
          className={cn("min-h-0 border-border lg:block lg:border-r", mobileTab === "document" ? "block" : "hidden")}
        >
          <DocumentViewer doc={doc} active={active} citedKeys={citedKeys} />
        </section>
        <section aria-label="Conversation" className={cn("min-h-0 lg:block", mobileTab === "chat" ? "block" : "hidden")}>
          {ready ? (
            <ChatPanel doc={doc} activeKey={activeKey} onCite={onCite} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-surface px-6 text-center">
              <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden />
              <h2 className="mt-4 font-semibold">Indexing this document</h2>
              <p className="mt-1 max-w-xs text-[15px] text-muted-foreground">
                You can read it now. Questions open up as soon as indexing finishes, usually within a minute.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
