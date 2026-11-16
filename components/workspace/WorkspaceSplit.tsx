"use client";

import { cn } from "@/lib/utils";

export type MobileTab = "document" | "chat";

interface WorkspaceSplitProps {
  document: React.ReactNode;
  chat: React.ReactNode;
  /** Which pane shows on small screens (both show side by side on large ones). */
  tab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

/** Document on the left, conversation on the right; tabs switch between them on mobile. */
export function WorkspaceSplit({ document, chat, tab, onTabChange }: WorkspaceSplitProps) {
  return (
    <>
      <div className="flex border-b border-border bg-surface lg:hidden" role="tablist" aria-label="Workspace panes">
        {(
          [
            { id: "document", label: "Document" },
            { id: "chat", label: "Conversation" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors",
              tab === item.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section
          aria-label="Document"
          className={cn("min-h-0 border-border lg:block lg:border-r", tab === "document" ? "block" : "hidden")}
        >
          {document}
        </section>
        <section aria-label="Conversation" className={cn("min-h-0 lg:block", tab === "chat" ? "block" : "hidden")}>
          {chat}
        </section>
      </div>
    </>
  );
}
