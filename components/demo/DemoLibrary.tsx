import Link from "next/link";
import { FileUp } from "lucide-react";
import { FileIcon } from "@/components/dashboard/FormatBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_DOCUMENTS } from "@/content/demo/documents";
import { formatBytes, formatDate } from "@/lib/utils";

/** The demo's document list: sample files, all ready to ask about. */
export function DemoLibrary() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Demo workspace</h1>
        <p className="text-[15px] text-muted-foreground">
          Seven sample documents, already indexed. Open one and ask it a question.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEMO_DOCUMENTS.map((doc) => (
          <div key={doc.id} className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-paper">
            <div className="flex items-start gap-3">
              <FileIcon format={doc.format} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[14px] font-semibold" title={doc.name}>
                  <Link href={`/demo/${doc.id}`} className="hover:text-primary">
                    {doc.name}
                  </Link>
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatBytes(doc.sizeBytes)}, uploaded {formatDate(doc.uploadedAt)}
                </p>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">{doc.summary}</p>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <StatusBadge doc={doc} />
                <span className="text-xs text-subtle-foreground tabular-nums">{doc.chunkCount} passages</span>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/demo/${doc.id}`}>Open</Link>
              </Button>
            </div>
          </div>
        ))}

        <div className="flex h-full flex-col items-start justify-between gap-4 rounded-xl border-2 border-dashed border-border-strong p-5">
          <div>
            <FileUp className="size-6 text-primary" aria-hidden />
            <h2 className="mt-3 text-[15px] font-semibold">Try it on your own files</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
              Create a free account to upload PDFs, Word files, Markdown and text. Your first 10 documents are free.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/sign-up?callbackUrl=%2Fdashboard">Create a free account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
