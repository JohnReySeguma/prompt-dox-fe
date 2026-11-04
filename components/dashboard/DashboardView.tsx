"use client";

import { motion } from "framer-motion";
import { CircleCheck, Files, LoaderCircle, MessageSquareText, type LucideIcon } from "lucide-react";
import { DocumentLibrary } from "@/components/dashboard/DocumentLibrary";
import { UploadDropzone } from "@/components/dashboard/UploadDropzone";
import { MOCK_USER } from "@/mock/site";
import { useWorkspaceStore } from "@/store/workspace-store";

function StatCard({ icon: Icon, label, value, hint, index }: { icon: LucideIcon; label: string; value: string; hint: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="size-4 text-cyan-300/80" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </motion.div>
  );
}

export function DashboardView() {
  const documents = useWorkspaceStore((state) => state.documents);
  const queriesToday = useWorkspaceStore((state) => state.queriesToday);
  const ready = documents.filter((doc) => doc.status === "ready").length;
  const processing = documents.length - ready;
  const chunks = documents.reduce((total, doc) => total + doc.chunkCount, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-10">
      <header>
        <p className="font-mono text-xs tracking-[0.18em] text-cyan-300 uppercase">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {MOCK_USER.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload documents, track indexing, and jump into a workspace to start asking questions.</p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={0} icon={Files} label="Documents" value={`${documents.length}/${MOCK_USER.documentLimit}`} hint="Free plan limit" />
        <StatCard index={1} icon={CircleCheck} label="Ready" value={String(ready)} hint={`${chunks.toLocaleString("en-US")} chunks indexed`} />
        <StatCard index={2} icon={LoaderCircle} label="Processing" value={String(processing)} hint="Uploading or indexing" />
        <StatCard index={3} icon={MessageSquareText} label="Queries today" value={String(queriesToday)} hint={`of ${MOCK_USER.dailyQueryLimit} daily`} />
      </div>

      <div className="mt-8">
        <UploadDropzone />
      </div>

      <div className="mt-10">
        <DocumentLibrary />
      </div>
    </div>
  );
}
