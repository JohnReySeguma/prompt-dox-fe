"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, TriangleAlert, Upload, X } from "lucide-react";
import { FormatBadge } from "@/components/dashboard/FormatBadge";
import { useUpload } from "@/hooks/use-upload";
import { useUsage } from "@/lib/queries";
import { MAX_FILE_BYTES, SUPPORTED_FORMATS, useUploadStore } from "@/store/upload-store";
import { cn, formatBytes } from "@/lib/utils";

export function UploadDropzone() {
  const upload = useUpload();
  const { data: usage } = useUsage();
  const inFlight = useUploadStore((state) => state.uploads.length);
  const errors = useUploadStore((state) => state.errors);
  const setErrors = useUploadStore((state) => state.setErrors);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const documentLimit = usage?.documents.limit ?? null;
  const plan = usage?.plan ?? "free";
  // The server enforces the limit too; this just saves a doomed upload.
  const atLimit = documentLimit !== null && (usage?.documents.used ?? 0) + inFlight >= documentLimit;
  const maxBytes = MAX_FILE_BYTES;

  const handleFiles = (files: File[]) => {
    if (files.length) upload(files);
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
            {atLimit ? `You've reached the ${documentLimit}-document limit` : dragging ? "Drop to upload" : "Drop files here, or click to choose"}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {atLimit
              ? plan === "free"
                ? "Delete a document or upgrade to Pro to add more."
                : "Delete a document to add more."
              : `Up to ${formatBytes(maxBytes)} per file.`}
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

      <p className="mt-2 text-xs text-subtle-foreground">
        Files are stored in your private workspace. Indexing usually takes under a minute.
      </p>

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
