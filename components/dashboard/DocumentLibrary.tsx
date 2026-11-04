"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FolderOpen, LayoutGrid, List, Search } from "lucide-react";
import { DocumentActions } from "@/components/dashboard/DocumentActions";
import { FileIcon } from "@/components/dashboard/FormatBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import type { DocumentItem } from "@/types";

type Filter = "all" | "ready" | "processing";
type View = "grid" | "list";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "ready", label: "Ready" },
  { id: "processing", label: "Processing" },
];

function OpenButton({ doc, compact = false }: { doc: DocumentItem; compact?: boolean }) {
  if (doc.status !== "ready") {
    return (
      <Button variant="secondary" size="sm" disabled>
        {doc.status === "uploading" ? "Uploading…" : "Indexing…"}
      </Button>
    );
  }
  return (
    <Button asChild variant="secondary" size="sm" className="group/open">
      <Link href={`/workspace/${doc.id}`}>
        {compact ? "Open" : "Open workspace"}
        <ArrowRight className="transition-transform group-hover/open:translate-x-0.5" />
      </Link>
    </Button>
  );
}

function DocumentCard({ doc }: { doc: DocumentItem }) {
  return (
    <div className="glass group flex h-full flex-col rounded-2xl p-5 transition-colors hover:border-white/15">
      <div className="flex items-start gap-3">
        <FileIcon format={doc.format} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium" title={doc.name}>
            {doc.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatBytes(doc.sizeBytes)} · {formatDate(doc.uploadedAt)}
          </p>
        </div>
        <DocumentActions doc={doc} />
      </div>
      <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{doc.summary}</p>
      {doc.status === "uploading" && <Progress value={doc.progress} className="mt-4" />}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/6 pt-4">
        <div className="flex items-center gap-1.5">
          <StatusBadge doc={doc} />
          {doc.status === "ready" && <span className="font-mono text-[10px] text-muted-foreground">{doc.chunkCount} chunks</span>}
        </div>
        <OpenButton doc={doc} compact />
      </div>
    </div>
  );
}

function DocumentRow({ doc }: { doc: DocumentItem }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-white/3 md:grid-cols-[minmax(0,2.4fr)_0.8fr_1fr_1.1fr_auto]">
      <div className="flex min-w-0 items-center gap-3">
        <FileIcon format={doc.format} className="size-9 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" title={doc.name}>
            {doc.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2 md:hidden">
            <StatusBadge doc={doc} />
          </div>
          {doc.status === "uploading" && <Progress value={doc.progress} className="mt-1.5 h-1 max-w-48" />}
        </div>
      </div>
      <span className="hidden text-sm text-muted-foreground md:block">{formatBytes(doc.sizeBytes)}</span>
      <span className="hidden text-sm text-muted-foreground md:block">{formatDate(doc.uploadedAt)}</span>
      <span className="hidden md:block">
        <StatusBadge doc={doc} />
      </span>
      <div className="flex items-center gap-1">
        <span className="hidden sm:block">
          <OpenButton doc={doc} compact />
        </span>
        <DocumentActions doc={doc} />
      </div>
    </div>
  );
}

export function DocumentLibrary() {
  const documents = useWorkspaceStore((state) => state.documents);
  const resumeIndexing = useWorkspaceStore((state) => state.resumeIndexing);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("grid");

  useEffect(() => {
    resumeIndexing();
  }, [resumeIndexing]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (filter === "ready" && doc.status !== "ready") return false;
      if (filter === "processing" && doc.status === "ready") return false;
      return !q || doc.name.toLowerCase().includes(q) || doc.summary.toLowerCase().includes(q);
    });
  }, [documents, query, filter]);

  return (
    <section aria-labelledby="library-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="library-heading" className="text-lg font-semibold tracking-tight">
            Document library
          </h2>
          <p className="text-sm text-muted-foreground">
            {documents.length} documents · {documents.filter((doc) => doc.status === "ready").length} ready to query
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents"
              aria-label="Search documents"
              className="h-9 pl-9"
            />
          </div>
          <div className="glass flex rounded-lg p-0.5" role="group" aria-label="View">
            {(
              [
                { id: "grid", icon: LayoutGrid, label: "Grid view" },
                { id: "list", icon: List, label: "List view" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                aria-pressed={view === option.id}
                onClick={() => setView(option.id)}
                className={cn(
                  "grid size-8 place-items-center rounded-md transition-colors",
                  view === option.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <option.icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Filter by status">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === item.id
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass mt-5 flex flex-col items-center rounded-2xl px-6 py-14 text-center">
          <FolderOpen className="size-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 font-medium">No documents match</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or filter, or upload a new file above.</p>
        </div>
      ) : view === "grid" ? (
        <motion.div layout className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <DocumentCard doc={doc} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass mt-5 overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[minmax(0,2.4fr)_0.8fr_1fr_1.1fr_auto] gap-4 border-b border-white/6 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid">
            <span>Name</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span>Status</span>
            <span className="w-28" />
          </div>
          <div className="divide-y divide-white/6">
            <AnimatePresence initial={false}>
              {visible.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <DocumentRow doc={doc} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}
