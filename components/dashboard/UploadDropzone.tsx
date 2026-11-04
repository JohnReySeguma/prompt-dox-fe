"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloudUpload, FileUp, TriangleAlert, Wand2, X } from "lucide-react";
import { FormatBadge } from "@/components/dashboard/FormatBadge";
import { Button } from "@/components/ui/button";
import { SUPPORTED_FORMATS, useWorkspaceStore } from "@/store/workspace-store";
import { MOCK_USER } from "@/mock/site";
import { cn } from "@/lib/utils";

const SAMPLE_FILES = [
  { name: "Board-Meeting-Minutes-Oct.pdf", size: 1_204_880 },
  { name: "Security-Whitepaper-2026.pdf", size: 3_912_004 },
  { name: "sales-playbook.docx", size: 512_330 },
  { name: "release-notes-v5.md", size: 44_120 },
  { name: "interview-transcript.txt", size: 26_870 },
];

export function UploadDropzone() {
  const uploadFile = useWorkspaceStore((state) => state.uploadFile);
  const docCount = useWorkspaceStore((state) => state.documents.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const sampleIndex = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const atLimit = docCount >= MOCK_USER.documentLimit;

  const handleFiles = (files: Array<{ name: string; size: number }>) => {
    const nextErrors: string[] = [];
    for (const file of files) {
      const result = uploadFile(file);
      if (!result.ok) nextErrors.push(result.error);
    }
    setErrors(nextErrors);
  };

  const addSample = () => {
    const sample = SAMPLE_FILES[sampleIndex.current % SAMPLE_FILES.length];
    sampleIndex.current += 1;
    handleFiles([sample]);
  };

  return (
    <section aria-label="Upload documents">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={atLimit}
        onClick={() => !atLimit && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !atLimit) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (atLimit) return;
          handleFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "group relative isolate flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed px-6 py-12 text-center transition-all duration-300 outline-none",
          "focus-visible:ring-2 focus-visible:ring-cyan-400/50",
          dragging
            ? "scale-[1.01] border-cyan-300/70 bg-cyan-400/8 shadow-[0_0_60px_-15px] shadow-cyan-400/60"
            : "border-white/15 bg-white/2 hover:border-white/25 hover:bg-white/4",
          atLimit && "cursor-not-allowed opacity-60",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,oklch(0.82_0.13_205/0.18),transparent_60%)] opacity-0 transition-opacity duration-300",
            (dragging || !atLimit) && "group-hover:opacity-100",
            dragging && "opacity-100",
          )}
        />
        <motion.span
          animate={dragging ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="grid size-14 place-items-center rounded-2xl bg-linear-to-br from-cyan-400/25 to-violet-500/25 ring-1 ring-white/15"
        >
          {dragging ? <FileUp className="size-6 text-cyan-200" aria-hidden /> : <CloudUpload className="size-6 text-cyan-200" aria-hidden />}
        </motion.span>
        <p className="mt-5 text-base font-medium">
          {atLimit ? "Document limit reached" : dragging ? "Release to upload" : "Drag & drop documents here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {atLimit ? "Delete a document or upgrade to Pro to upload more." : "or click to browse · up to 50 MB per file"}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {SUPPORTED_FORMATS.map((format) => (
            <FormatBadge key={format} format={format} />
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.md,.txt"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            handleFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Files never leave your browser. This prototype simulates upload and indexing.</p>
        <Button variant="ghost" size="sm" onClick={addSample} disabled={atLimit}>
          <Wand2 /> Simulate a sample upload
        </Button>
      </div>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div role="alert" className="mt-3 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/8 p-3 text-sm text-amber-100">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
              <ul className="flex-1 space-y-1">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
              <button type="button" onClick={() => setErrors([])} aria-label="Dismiss" className="text-amber-200/70 hover:text-amber-100">
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
