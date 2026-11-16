import Link from "next/link";
import { DemoUploads } from "@/components/demo/DemoUploads";
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
          Seven sample documents, already indexed. Open one and ask it a question, or try your own file.
        </p>
      </header>

      <DemoUploads />

      <h2 className="mt-10 text-lg font-semibold tracking-tight">Sample documents</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEMO_DOCUMENTS.map((doc) => (
          <div key={doc.id} className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-paper">
            <div className="flex items-start gap-3">
              <FileIcon format={doc.format} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-semibold" title={doc.name}>
                  <Link href={`/demo/${doc.id}`} className="hover:text-primary">
                    {doc.name}
                  </Link>
                </h3>
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
      </div>
    </div>
  );
}
