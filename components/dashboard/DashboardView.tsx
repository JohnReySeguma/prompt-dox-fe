"use client";

import { DocumentLibrary } from "@/components/dashboard/DocumentLibrary";
import { UploadDropzone } from "@/components/dashboard/UploadDropzone";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments, useUsage } from "@/lib/queries";

export function DashboardView() {
  const { data: documents } = useDocuments();
  const { data: usage } = useUsage();

  const stats =
    documents && usage
      ? [
          {
            label: "Documents",
            value:
              usage.documents.limit === null ? String(usage.documents.used) : `${usage.documents.used} of ${usage.documents.limit}`,
          },
          { label: "Ready to ask", value: String(documents.filter((doc) => doc.status === "ready").length) },
          { label: "Processing", value: String(documents.filter((doc) => doc.status !== "ready").length) },
          { label: "Passages indexed", value: usage.passagesIndexed.toLocaleString("en-US") },
          {
            label: "Questions today",
            value:
              usage.queriesToday.limit === null
                ? String(usage.queriesToday.used)
                : `${usage.queriesToday.used} of ${usage.queriesToday.limit}`,
          },
        ]
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Documents</h1>
        <p className="text-[15px] text-muted-foreground">Upload files, then open one to start asking questions.</p>
      </header>

      <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-5">
        {stats
          ? stats.map((stat) => (
              <div key={stat.label} className="bg-surface px-5 py-4 last:max-lg:col-span-2">
                <dt className="text-[13px] text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
              </div>
            ))
          : Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="bg-surface px-5 py-4 last:max-lg:col-span-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-6 w-16" />
              </div>
            ))}
      </dl>

      <div className="mt-8">
        <UploadDropzone />
      </div>

      <div className="mt-10">
        <DocumentLibrary />
      </div>
    </div>
  );
}
