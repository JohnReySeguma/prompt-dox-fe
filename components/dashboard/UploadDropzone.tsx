"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, TriangleAlert, Upload, X } from "lucide-react";
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
          "flex cursor-pointer flex-col items-center gap-5 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-colors outline-none sm:flex-row sm:text-left",
          "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15",
          dragging ? "border-primary bg-primary-soft" : "border-border-strong bg-surface hover:border-primary/50",
          atLimit && "cursor-not-allowed opacity-60 hover:border-border-strong",
        )}
      >
        <motion.span
          animate={dragging ? { y: -4 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-lg",
            dragging ? "bg-primary text-white" : "bg-primary-soft text-primary",
          )}
        >
          {dragging ? <FileUp className="size-5" aria-hidden /> : <Upload className="size-5" aria-hidden />}
        </motion.span>
        <div className="flex-1">
          <p className="text-[15px] font-semibold">
            {atLimit ? "You've reached the 10-document limit" : dragging ? "Drop to upload" : "Drop files here, or click to choose"}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {atLimit ? "Delete a document or upgrade to Pro to add more." : "Up to 50 MB per file."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
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

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-subtle-foreground">Prototype: files stay in your browser. Upload and indexing are simulated.</p>
        <Button variant="link" size="sm" onClick={addSample} disabled={atLimit}>
          Add a sample file
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
            <div role="alert" className="mt-2 flex items-start gap-3 rounded-lg border border-[#f1d9a8] bg-[#fdf6e7] p-3 text-sm text-[#6b4300]">
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
