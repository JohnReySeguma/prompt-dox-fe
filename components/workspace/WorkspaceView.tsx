"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, CircleAlert, FileQuestion, LoaderCircle, RotateCcw, RotateCw } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { citationKey } from "@/components/workspace/CitedText";
import { DocumentViewer, type ActiveCitation } from "@/components/workspace/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clearMessages } from "@/lib/api/chat";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { queryKeys, useDocument, useMessages, usePages } from "@/lib/queries";
import { useToast } from "@/store/toast-store";
import { cn, formatBytes } from "@/lib/utils";
import type { ChatMessage, Citation } from "@/types";

type MobileTab = "document" | "chat";

export function WorkspaceSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label="Loading document">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-3">
        <Skeleton className="size-8" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="bg-[#e9ebef] px-8 py-6">
          <div className="mx-auto max-w-[680px] space-y-3 rounded-[4px] bg-surface p-10 shadow-paper">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <div className="hidden bg-surface lg:block" />
      </div>
    </div>
  );
}

function CenteredState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      {icon}
      <h1 className="mt-4 text-xl font-semibold">{title}</h1>
      <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">{body}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

const NO_MESSAGES: ChatMessage[] = [];

export function WorkspaceView({ docId }: { docId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: doc, isPending, error, refetch, isRefetching } = useDocument(docId);
  const hasDoc = Boolean(doc);
  const pagesQuery = usePages(docId, hasDoc);
  const { data: messages = NO_MESSAGES } = useMessages(docId, doc?.status === "ready");

  const [active, setActive] = useState<ActiveCitation | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const nonce = useRef(0);

  const clear = useMutation({
    mutationFn: () => clearMessages(docId),
    onSuccess: () => {
      queryClient.setQueryData<ChatMessage[]>(queryKeys.messages(docId), []);
      setActive(null);
    },
    onError: (caught) => toast({ title: "Couldn't start a new conversation", description: errorMessage(caught) }),
  });

  const citedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const message of messages) {
      if (message.role === "assistant") message.citations.forEach((citation) => citation && keys.add(citationKey(citation)));
    }
    return keys;
  }, [messages]);

  const onCite = (citation: Citation) => {
    nonce.current += 1;
    setActive({ citation, nonce: nonce.current });
    setMobileTab("document");
  };

  if (isPending) return <WorkspaceSkeleton />;

  if (!doc) {
    const notFound = error instanceof ApiError && (error.code === "document_not_found" || error.status === 404);
    return notFound ? (
      <CenteredState
        icon={<FileQuestion className="size-9 text-subtle-foreground" aria-hidden />}
        title="Document not found"
        body="It may have been deleted, or it belongs to another workspace."
        action={
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to documents</Link>
          </Button>
        }
      />
    ) : (
      <CenteredState
        icon={<CircleAlert className="size-9 text-destructive" aria-hidden />}
        title="This document didn't load"
        body={errorMessage(error)}
        action={
          <Button variant="secondary" onClick={() => void refetch()} disabled={isRefetching}>
            <RotateCw className={cn(isRefetching && "animate-spin")} /> Try again
          </Button>
        }
      />
    );
  }

  const ready = doc.status === "ready";
  const activeKey = active ? citationKey(active.citation) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <title>{`${doc.name} · PromptDox`}</title>
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
            {doc.pageCount > 0 && `${doc.pageCount} ${doc.pageCount === 1 ? "page" : "pages"}, `}
            {formatBytes(doc.sizeBytes)}
            {ready && `, ${doc.chunkCount} passages indexed`}
          </p>
        </div>
        {!ready && <StatusBadge doc={doc} />}
        {ready && messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => clear.mutate()} disabled={clear.isPending}>
            {clear.isPending ? <LoaderCircle className="animate-spin" /> : <RotateCcw />}
            <span className="hidden sm:inline">New conversation</span>
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
          <DocumentViewer
            doc={doc}
            pages={pagesQuery.data?.pages}
            pagesError={pagesQuery.error}
            pagesLoading={pagesQuery.isPending}
            onRetryPages={() => void pagesQuery.refetch()}
            active={active}
            citedKeys={citedKeys}
          />
        </section>
        <section aria-label="Conversation" className={cn("min-h-0 lg:block", mobileTab === "chat" ? "block" : "hidden")}>
          {ready ? (
            <ChatPanel doc={doc} pages={pagesQuery.data?.pages} messages={messages} activeKey={activeKey} onCite={onCite} />
          ) : doc.status === "failed" ? (
            <div className="flex h-full flex-col items-center justify-center bg-surface px-6 text-center">
              <CircleAlert className="size-6 text-destructive" aria-hidden />
              <h2 className="mt-4 font-semibold">We couldn&apos;t index this document</h2>
              <p className="mt-1 max-w-xs text-[15px] text-muted-foreground">{doc.error ?? "The file couldn't be read."}</p>
              <Button asChild variant="secondary" className="mt-5">
                <Link href="/dashboard">Back to documents</Link>
              </Button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-surface px-6 text-center">
              <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden />
              <h2 className="mt-4 font-semibold">Indexing this document</h2>
              <p className="mt-1 max-w-xs text-[15px] text-muted-foreground">
                Questions open up as soon as indexing finishes, usually within a minute.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
