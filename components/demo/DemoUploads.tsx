"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { CircleAlert, Clock, Trash2, TriangleAlert, Upload, X } from "lucide-react";
import { FileIcon } from "@/components/dashboard/FormatBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDemoUpload, useDemoUploads } from "@/hooks/use-demo-uploads";
import { DEMO_MAX_FILE_BYTES, DEMO_MAX_UPLOADS } from "@/store/demo-store";
import { cn, formatBytes } from "@/lib/utils";
import type { DocumentItem } from "@/types";

function timeLeft(expiresAt: number): string {
  const minutes = Math.max(1, Math.round((expiresAt - Date.now()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)} h`;
}

function UploadRow({ doc, onDelete }: { doc: DocumentItem; onDelete?: () => void }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <FileIcon format={doc.format} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium" title={doc.name}>
          {doc.status === "ready" ? (
            <Link href={`/demo/${doc.id}`} className="hover:text-primary">
              {doc.name}
            </Link>
          ) : (
            doc.name
          )}
        </p>
        {doc.status === "uploading" ? (
          <Progress value={doc.progress} className="mt-1.5 h-1 max-w-48" />
        ) : doc.status === "failed" ? (
          <p className="mt-0.5 truncate text-xs text-destructive">{doc.error ?? "We couldn't read this file."}</p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">{formatBytes(doc.sizeBytes)}</p>
        )}
      </div>
      <StatusBadge doc={doc} />
      {doc.status === "ready" && (
        <Button asChild variant="secondary" size="sm">
          <Link href={`/demo/${doc.id}`}>Open</Link>
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${doc.name}`} onClick={onDelete}>
          <Trash2 />
        </Button>
      )}
    </li>
  );
}

/**
 * "Try it with your own file" on the demo page. Files go to a temporary
 * workspace that is created on the first upload and deleted after 24 hours.
 * Visitors stay signed out throughout.
 */
export function DemoUploads() {
  const { status } = useSession();
  const { hydrated, workspace, uploading, documents } = useDemoUploads();
  const { upload, remove, errors, setErrors } = useDemoUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  if (status === "authenticated") {
    return (
      <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
        <p className="text-[14px] text-muted-foreground">You&apos;re signed in, so your own files go to your workspace, where they&apos;re kept.</p>
        <Button asChild size="sm">
          <Link href="/dashboard">Upload to your workspace</Link>
        </Button>
      </section>
    );
  }

  const items = [...uploading, ...documents];
  const full = (workspace?.uploadIds.length ?? 0) + uploading.length >= DEMO_MAX_UPLOADS;

  return (
    <section aria-labelledby="demo-uploads-heading" className="mt-8 rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h2 id="demo-uploads-heading" className="text-[15px] font-semibold">
            Try it with your own file
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            Up to {DEMO_MAX_UPLOADS} files, {formatBytes(DEMO_MAX_FILE_BYTES)} each. They&apos;re private to this browser and
            deleted after 24 hours. No account needed.
          </p>
        </div>
        <div
          role="button"
          tabIndex={full ? -1 : 0}
          aria-disabled={full}
          onClick={() => !full && inputRef.current?.click()}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && !full) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!full) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!full) void upload(Array.from(event.dataTransfer.files));
          }}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-5 py-3.5 text-sm font-medium transition-colors outline-none",
            "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15",
            dragging ? "border-primary bg-primary-soft text-primary" : "border-border-strong hover:border-primary/50",
            full && "cursor-not-allowed opacity-60",
          )}
        >
          <Upload className="size-4" aria-hidden />
          {full ? "Demo upload limit reached" : dragging ? "Drop to upload" : "Upload a file"}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.md,.txt"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              void upload(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="mx-5 mb-4 flex items-start gap-3 rounded-lg border border-[#f1d9a8] bg-[#fdf6e7] p-3 text-sm text-[#6b4300]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <ul className="flex-1 space-y-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setErrors([])} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      )}

      {hydrated && items.length > 0 && (
        <>
          <ul className="divide-y divide-border border-t border-border">
            {items.map((doc) => (
              <UploadRow key={doc.id} doc={doc} onDelete={doc.status === "uploading" ? undefined : () => void remove(doc)} />
            ))}
          </ul>
          {workspace && (
            <p className="flex items-center gap-1.5 border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
              Your uploads are deleted in about {timeLeft(workspace.expiresAt)}.{" "}
              <Link href="/sign-up?callbackUrl=%2Fdashboard" className="font-medium text-primary hover:underline">
                Create a free account
              </Link>{" "}
              to keep files.
            </p>
          )}
        </>
      )}
      {hydrated && workspace && documents.length === 0 && uploading.length === 0 && workspace.uploadIds.length > 0 && (
        <p className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <CircleAlert className="size-3.5" aria-hidden /> Loading your uploads…
        </p>
      )}
    </section>
  );
}
