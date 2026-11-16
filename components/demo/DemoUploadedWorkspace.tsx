"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CircleAlert, Clock, FileQuestion, LoaderCircle, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChatView } from "@/components/workspace/ChatView";
import { citationKey } from "@/components/workspace/CitedText";
import { DocumentViewer, type ActiveCitation } from "@/components/workspace/DocumentViewer";
import { WorkspaceSplit, type MobileTab } from "@/components/workspace/WorkspaceSplit";
import { WorkspaceSkeleton } from "@/components/workspace/WorkspaceView";
import { useChat, type ChatPhase } from "@/hooks/use-chat";
import { demoKeys, isDemoExpired, useDemoWorkspace } from "@/hooks/use-demo-uploads";
import { clearMessages, getMessages } from "@/lib/api/chat";
import { getDocument, getPages, getSuggestions } from "@/lib/api/documents";
import { errorMessage } from "@/lib/api/errors";
import { POLL_INTERVAL_MS } from "@/lib/queries";
import { useDemoStore } from "@/store/demo-store";
import { formatBytes } from "@/lib/utils";
import type { ChatMessage, Citation, DocumentItem } from "@/types";

const NO_MESSAGES: ChatMessage[] = [];

function Gone({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <FileQuestion className="size-9 text-subtle-foreground" aria-hidden />
      <h1 className="mt-4 text-xl font-semibold">{title}</h1>
      <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">{body}</p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/demo">Back to the demo</Link>
      </Button>
    </div>
  );
}

function phaseLabel(phase: ChatPhase, doc: DocumentItem): string {
  if (phase.stage === "searching") return `Searching ${(phase.passages ?? doc.chunkCount).toLocaleString("en-US")} passages`;
  return "Writing the answer";
}

function UploadedWorkspace({ docId, token }: { docId: string; token: string }) {
  const queryClient = useQueryClient();
  const reset = useDemoStore((state) => state.reset);
  const [active, setActive] = useState<ActiveCitation | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const nonce = useRef(0);

  const docQuery = useQuery({
    queryKey: demoKeys.document(token, docId),
    queryFn: () => getDocument(docId, { token }),
    refetchInterval: (q) => (q.state.data?.status === "indexing" ? POLL_INTERVAL_MS : false),
  });
  const doc = docQuery.data;
  const ready = doc?.status === "ready";
  const pagesQuery = useQuery({
    queryKey: [...demoKeys.pages(token, docId), doc?.status],
    enabled: Boolean(doc) && doc?.status !== "failed",
    queryFn: () => getPages(docId, {}, { token }),
  });
  const { data: messages = NO_MESSAGES } = useQuery({
    queryKey: demoKeys.messages(token, docId),
    enabled: ready,
    queryFn: () => getMessages(docId, token),
  });
  const { data: suggestions } = useQuery({
    queryKey: demoKeys.suggestions(token, docId),
    enabled: ready,
    queryFn: () => getSuggestions(docId, { token }),
  });
  const chat = useChat(docId, { token, messagesKey: demoKeys.messages(token, docId) });

  const clear = useMutation({
    mutationFn: () => clearMessages(docId, token),
    onSuccess: () => {
      queryClient.setQueryData<ChatMessage[]>(demoKeys.messages(token, docId), []);
      setActive(null);
    },
  });

  const expired = isDemoExpired(docQuery.error);
  useEffect(() => {
    if (expired) reset();
  }, [expired, reset]);

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

  if (docQuery.isPending) return <WorkspaceSkeleton />;
  if (!doc) {
    return expired ? (
      <Gone title="Your demo uploads expired" body="Demo files are deleted after 24 hours. Upload it again, or create a free account to keep your files." />
    ) : (
      <Gone title="This file isn't available" body={errorMessage(docQuery.error, "It may have been deleted.")} />
    );
  }

  const streamingAnswer = chat.pending.find((message) => message.role === "assistant");

  return (
    <div data-full-height className="flex min-h-0 flex-1 flex-col">
      <title>{`${doc.name} · PromptDox demo`}</title>
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-5">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to the demo">
          <Link href="/demo">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold" title={doc.name}>
            {doc.name}
          </h1>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Clock className="size-3 shrink-0" aria-hidden />
            Your upload, deleted within 24 hours · {formatBytes(doc.sizeBytes)}
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

      <WorkspaceSplit
        tab={mobileTab}
        onTabChange={setMobileTab}
        document={
          <DocumentViewer
            doc={doc}
            pages={pagesQuery.data?.pages}
            pagesError={pagesQuery.error}
            pagesLoading={pagesQuery.isPending && pagesQuery.fetchStatus !== "idle"}
            onRetryPages={() => void pagesQuery.refetch()}
            active={active}
            citedKeys={citedKeys}
          />
        }
        chat={
          ready ? (
            <ChatView
              docName={doc.name}
              pages={pagesQuery.data?.pages}
              conversation={[...messages, ...chat.pending]}
              busy={chat.busy}
              typingLabel={chat.busy && !streamingAnswer ? phaseLabel(chat.phase, doc) : null}
              error={chat.error}
              onDismissError={chat.dismissError}
              suggestions={suggestions}
              onSend={chat.send}
              onStop={chat.stop}
              activeKey={active ? citationKey(active.citation) : null}
              onCite={onCite}
              allowFeedback={false}
              footnote="Real answers from your file. The demo allows a limited number of questions per day."
            />
          ) : doc.status === "failed" ? (
            <div className="flex h-full flex-col items-center justify-center bg-surface px-6 text-center">
              <CircleAlert className="size-6 text-destructive" aria-hidden />
              <h2 className="mt-4 font-semibold">We couldn&apos;t index this file</h2>
              <p className="mt-1 max-w-xs text-[15px] text-muted-foreground">{doc.error ?? "The file couldn't be read."}</p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-surface px-6 text-center">
              <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden />
              <h2 className="mt-4 font-semibold">Indexing your file</h2>
              <p className="mt-1 max-w-xs text-[15px] text-muted-foreground">Questions open up as soon as it&apos;s ready, usually within a minute.</p>
            </div>
          )
        }
      />
    </div>
  );
}

/** A file the visitor uploaded to the demo, served from their temporary workspace. */
export function DemoUploadedWorkspace({ docId }: { docId: string }) {
  const { workspace, hydrated } = useDemoWorkspace();
  if (!hydrated) return <WorkspaceSkeleton />;
  if (!workspace || !workspace.uploadIds.includes(docId)) {
    return <Gone title="This file isn't available" body="Demo uploads are private to the browser that uploaded them and are deleted after 24 hours." />;
  }
  return <UploadedWorkspace docId={docId} token={workspace.accessToken} />;
}
