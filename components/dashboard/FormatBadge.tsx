import { FileCode2, FileText, FileType2, type LucideIcon } from "lucide-react";
import type { DocFormat } from "@/types";
import { cn } from "@/lib/utils";

// Muted, file-type colours that echo the apps people associate with each format.
const FORMAT_STYLES: Record<DocFormat, { icon: LucideIcon; text: string; tile: string; label: string }> = {
  pdf: { icon: FileText, text: "text-[#b42318]", tile: "bg-[#fdecea]", label: "PDF" },
  docx: { icon: FileType2, text: "text-[#1d4fd7]", tile: "bg-[#e8eefd]", label: "Word" },
  md: { icon: FileCode2, text: "text-[#5b3cc4]", tile: "bg-[#efeafc]", label: "Markdown" },
  txt: { icon: FileText, text: "text-[#4a5160]", tile: "bg-muted", label: "Text" },
};

export function FormatBadge({ format, size = "sm", className }: { format: DocFormat; size?: "sm" | "lg"; className?: string }) {
  const style = FORMAT_STYLES[format];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-semibold tracking-wide",
        size === "sm" ? "px-1.5 py-0.5 text-[10.5px]" : "px-3 py-1.5 text-[13px]",
        style.tile,
        style.text,
        className,
      )}
    >
      .{format}
    </span>
  );
}

export function FileIcon({ format, className }: { format: DocFormat; className?: string }) {
  const style = FORMAT_STYLES[format];
  const Icon = style.icon;
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", style.tile, style.text, className)}>
      <Icon className="size-[18px]" aria-hidden />
      <span className="sr-only">{style.label} file</span>
    </span>
  );
}
