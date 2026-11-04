"use client";

import { DocumentLibrary } from "@/components/dashboard/DocumentLibrary";
import { UploadDropzone } from "@/components/dashboard/UploadDropzone";
import { MOCK_USER } from "@/mock/site";
import { useWorkspaceStore } from "@/store/workspace-store";

export function DashboardView() {
  const documents = useWorkspaceStore((state) => state.documents);
  const queriesToday = useWorkspaceStore((state) => state.queriesToday);
  const ready = documents.filter((doc) => doc.status === "ready").length;
  const processing = documents.length - ready;
  const passages = documents.reduce((total, doc) => total + doc.chunkCount, 0);

  const stats = [
    { label: "Documents", value: `${documents.length} of ${MOCK_USER.documentLimit}` },
    { label: "Ready to ask", value: String(ready) },
    { label: "Processing", value: String(processing) },
    { label: "Passages indexed", value: passages.toLocaleString("en-US") },
    { label: "Questions today", value: `${queriesToday} of ${MOCK_USER.dailyQueryLimit}` },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Documents</h1>
        <p className="text-[15px] text-muted-foreground">Upload files, then open one to start asking questions.</p>
      </header>

      <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface px-5 py-4 last:max-lg:col-span-2">
            <dt className="text-[13px] text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
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
