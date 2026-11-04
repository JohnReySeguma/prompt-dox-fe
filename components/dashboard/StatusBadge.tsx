import { AlertTriangle, CircleCheck, CloudUpload, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentItem } from "@/types";

export function StatusBadge({ doc }: { doc: Pick<DocumentItem, "status" | "progress"> }) {
  switch (doc.status) {
    case "uploading":
      return (
        <Badge variant="violet">
          <CloudUpload aria-hidden /> Uploading {Math.round(doc.progress)}%
        </Badge>
      );
    case "indexing":
      return (
        <Badge variant="cyan" className="relative overflow-hidden">
          <span aria-hidden className="bg-shimmer absolute inset-0 animate-shimmer" />
          <LoaderCircle className="animate-spin" aria-hidden /> Indexing…
        </Badge>
      );
    case "ready":
      return (
        <Badge variant="success">
          <CircleCheck aria-hidden /> Ready
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <AlertTriangle aria-hidden /> Failed
        </Badge>
      );
  }
}
