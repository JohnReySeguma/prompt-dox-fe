"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, FileUp, FolderOpen, LayoutGrid, List, RotateCw, Search } from "lucide-react";
import { DocumentActions } from "@/components/dashboard/DocumentActions";
import { FileIcon } from "@/components/dashboard/FormatBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useDocuments } from "@/lib/queries";
import { useUploadStore } from "@/store/upload-store";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import type { DocumentItem } from "@/types";

type Filter = "all" | "ready" | "processing";
type View = "grid" | "list";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "ready", label: "Ready" },
  { id: "processing", label: "Processing" },
];

function OpenButton({ doc }: { doc: DocumentItem }) {
  if (doc.status !== "ready") {
    return (
      <Button variant="secondary" size="sm" disabled>
        Open
      </Button>
    );
  }
  return (
    <Button asChild variant="secondary" size="sm">
      <Link href={`/workspace/${doc.id}`}>Open</Link>
    </Button>
  );
}

function DocumentCard({ doc }: { doc: DocumentItem }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-paper">
      <div className="flex items-start gap-3">
        <FileIcon format={doc.format} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold" title={doc.name}>
            {doc.status === "ready" ? (
              <Link href={`/workspace/${doc.id}`} className="hover:text-primary">
                {doc.name}
              </Link>
            ) : (
              doc.name
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatBytes(doc.sizeBytes)}, uploaded {formatDate(doc.uploadedAt)}
          </p>
        </div>
        {doc.status !== "uploading" && <DocumentActions doc={doc} />}
      </div>
      {doc.status === "failed" ? (
        <p className="mt-4 flex flex-1 items-start gap-2 text-[13.5px] leading-relaxed text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {doc.error ?? "We couldn't read this file."}
        </p>
      ) : (
        <p className="mt-4 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">{doc.summary}</p>
      )}
      {doc.status === "uploading" && <Progress value={doc.progress} className="mt-4" />}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <StatusBadge doc={doc} />
          {doc.status === "ready" && <span className="text-xs text-subtle-foreground tabular-nums">{doc.chunkCount} passages</span>}
        </div>
        <OpenButton doc={doc} />
      </div>
    </div>
  );
}

function DocumentRow({ doc }: { doc: DocumentItem }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-background md:grid-cols-[minmax(0,2.4fr)_0.8fr_1fr_1.1fr_auto]">
      <div className="flex min-w-0 items-center gap-3">
        <FileIcon format={doc.format} className="size-9" />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium" title={doc.name}>
            {doc.name}
          </p>
          <div className="mt-1 md:hidden">
            <StatusBadge doc={doc} />
          </div>
          {doc.status === "uploading" && <Progress value={doc.progress} className="mt-1.5 h-1 max-w-48" />}
          {doc.status === "failed" && (
            <p className="mt-1 truncate text-xs text-destructive" title={doc.error ?? undefined}>
              {doc.error ?? "We couldn't read this file."}
            </p>
          )}
        </div>
      </div>
      <span className="hidden text-sm text-muted-foreground tabular-nums md:block">{formatBytes(doc.sizeBytes)}</span>
      <span className="hidden text-sm text-muted-foreground md:block">{formatDate(doc.uploadedAt)}</span>
      <span className="hidden md:block">
        <StatusBadge doc={doc} />
      </span>
      <div className="flex items-center gap-1">
        <span className="hidden sm:block">
          <OpenButton doc={doc} />
        </span>
        {doc.status !== "uploading" && <DocumentActions doc={doc} />}
      </div>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading documents">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-6 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export function DocumentLibrary() {
  const { data: serverDocuments, isPending, isError, error, refetch, isRefetching } = useDocuments();
  const uploads = useUploadStore((state) => state.uploads);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("grid");

  const documents = useMemo(() => [...uploads, ...(serverDocuments ?? [])], [uploads, serverDocuments]);

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <h2 id="library-heading" className="text-lg font-semibold tracking-tight">
            Library
          </h2>
          <div className="flex gap-1" role="tablist" aria-label="Filter by status">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors",
                  filter === item.id ? "bg-foreground text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64 lg:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or summary"
              aria-label="Search documents"
              className="h-9 pl-9"
            />
          </div>
          <div className="flex rounded-lg border border-border bg-surface p-0.5" role="group" aria-label="View">
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
                  view === option.id ? "bg-muted text-foreground" : "text-subtle-foreground hover:text-foreground",
                )}
              >
                <option.icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {isPending && uploads.length === 0 ? (
        <LibrarySkeleton />
      ) : isError && !serverDocuments ? (
        <div role="alert" className="mt-5 flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-14 text-center">
          <CircleAlert className="size-7 text-destructive" aria-hidden />
          <p className="mt-3 font-medium">Your documents didn&apos;t load</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{errorMessage(error)}</p>
          <Button variant="secondary" size="sm" className="mt-5" onClick={() => void refetch()} disabled={isRefetching}>
            <RotateCw className={cn(isRefetching && "animate-spin")} /> Try again
          </Button>
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border-strong px-6 py-14 text-center">
          <FileUp className="size-7 text-subtle-foreground" aria-hidden />
          <p className="mt-3 font-medium">No documents yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload a PDF, Word, Markdown or text file above to start asking questions.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border-strong px-6 py-14 text-center">
          <FolderOpen className="size-7 text-subtle-foreground" aria-hidden />
          <p className="mt-3 font-medium">No documents match</p>
          <p className="mt-1 text-sm text-muted-foreground">Change the search or filter, or upload a file above.</p>
        </div>
      ) : view === "grid" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <DocumentCard doc={doc} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="hidden grid-cols-[minmax(0,2.4fr)_0.8fr_1fr_1.1fr_auto] gap-4 border-b border-border bg-background px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid">
            <span>Name</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span>Status</span>
            <span className="w-24" />
          </div>
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {visible.map((doc) => (
                <motion.div key={doc.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
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
