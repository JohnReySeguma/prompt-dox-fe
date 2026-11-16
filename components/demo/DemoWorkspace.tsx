"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatView } from "@/components/workspace/ChatView";
import { citationKey } from "@/components/workspace/CitedText";
import { DocumentViewer, type ActiveCitation } from "@/components/workspace/DocumentViewer";
import { WorkspaceSplit, type MobileTab } from "@/components/workspace/WorkspaceSplit";
import { getDemoSuggestions } from "@/content/demo/knowledge";
import type { DemoDocument } from "@/content/demo/documents";
import { useDemoChat } from "@/hooks/use-demo-chat";
import { formatBytes } from "@/lib/utils";
import type { Citation } from "@/types";

/** The demo's document + chat view, using the same components as the real workspace. */
export function DemoWorkspace({ doc }: { doc: DemoDocument }) {
  const chat = useDemoChat(doc.id);
  const [active, setActive] = useState<ActiveCitation | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const nonce = useRef(0);

  const citedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const message of chat.messages) {
      if (message.role === "assistant") message.citations.forEach((citation) => keys.add(citationKey(citation)));
    }
    return keys;
  }, [chat.messages]);

  const onCite = (citation: Citation) => {
    nonce.current += 1;
    setActive({ citation, nonce: nonce.current });
    setMobileTab("document");
  };

  return (
    <div data-full-height className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-5">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to demo documents">
          <Link href="/demo">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold" title={doc.name}>
            {doc.name}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {doc.pageCount} pages, {formatBytes(doc.sizeBytes)}, {doc.chunkCount} passages indexed
          </p>
        </div>
        {chat.messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              chat.clear();
              setActive(null);
            }}
          >
            <RotateCcw /> <span className="hidden sm:inline">New conversation</span>
          </Button>
        )}
      </header>

      <WorkspaceSplit
        tab={mobileTab}
        onTabChange={setMobileTab}
        document={
          <DocumentViewer
            doc={doc}
            pages={doc.pages}
            pagesLoading={false}
            pagesError={null}
            onRetryPages={() => undefined}
            active={active}
            citedKeys={citedKeys}
          />
        }
        chat={
          <ChatView
            docName={doc.name}
            pages={doc.pages}
            conversation={chat.conversation}
            busy={chat.busy}
            typingLabel={chat.thinking ? `Searching ${doc.chunkCount} passages` : null}
            error={null}
            onDismissError={() => undefined}
            suggestions={getDemoSuggestions(doc.id)}
            onSend={chat.send}
            onStop={chat.stop}
            activeKey={active ? citationKey(active.citation) : null}
            onCite={onCite}
            allowFeedback={false}
            footnote="Demo answers are pre-written for these sample documents. Sign up to ask your own files anything."
          />
        }
      />
    </div>
  );
}
