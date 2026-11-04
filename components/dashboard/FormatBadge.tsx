import { FileCode2, FileText, FileType2, type LucideIcon } from "lucide-react";
import type { DocFormat } from "@/types";
import { cn } from "@/lib/utils";

const FORMAT_STYLES: Record<DocFormat, { icon: LucideIcon; className: string; label: string }> = {
  pdf: { icon: FileText, className: "border-rose-400/25 bg-rose-500/10 text-rose-200", label: "PDF" },
  docx: { icon: FileType2, className: "border-sky-400/25 bg-sky-500/10 text-sky-200", label: "DOCX" },
  md: { icon: FileCode2, className: "border-violet-400/25 bg-violet-500/10 text-violet-200", label: "MD" },
  txt: { icon: FileText, className: "border-zinc-400/25 bg-zinc-400/10 text-zinc-200", label: "TXT" },
};

export function FormatBadge({ format, size = "sm", className }: { format: DocFormat; size?: "sm" | "lg"; className?: string }) {
  const style = FORMAT_STYLES[format];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-mono font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs",
        style.className,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />.{format}
    </span>
  );
}

export function FileIcon({ format, className }: { format: DocFormat; className?: string }) {
  const style = FORMAT_STYLES[format];
  const Icon = style.icon;
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl border", style.className, className)}>
      <Icon className="size-5" aria-hidden />
      <span className="sr-only">{style.label} file</span>
    </span>
  );
}
