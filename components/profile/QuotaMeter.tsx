import { cn } from "@/lib/utils";

interface QuotaMeterProps {
  label: string;
  used: number;
  limit: number;
  unit: string;
  hint: string;
}

/** A segmented bar: one cell per unit when the limit is small, a continuous bar otherwise. */
export function QuotaMeter({ label, used, limit, unit, hint }: QuotaMeterProps) {
  const ratio = Math.min(1, used / limit);
  const tone = ratio >= 0.9 ? "danger" : ratio >= 0.7 ? "warning" : "ok";
  const fill = tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-[#d98a00]" : "bg-primary";
  const segmented = limit <= 20;

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-medium">{label}</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{Math.round(ratio * 100)}% used</span>
      </div>
      <p className="mt-3 tabular-nums" aria-label={`${used} of ${limit} ${unit}`}>
        <span className="text-[34px] leading-none font-semibold tracking-tight">{used}</span>
        <span className="ml-1.5 text-[15px] text-muted-foreground">
          / {limit} {unit}
        </span>
      </p>

      {segmented ? (
        <div className="mt-5 flex gap-1" aria-hidden>
          {Array.from({ length: limit }, (_, index) => (
            <span key={index} className={cn("h-2.5 flex-1 rounded-[3px]", index < used ? fill : "bg-muted")} />
          ))}
        </div>
      ) : (
        <div className="mt-5 h-2.5 overflow-hidden rounded-[3px] bg-muted" aria-hidden>
          <div className={cn("h-full rounded-[3px] transition-[width] duration-500", fill)} style={{ width: `${ratio * 100}%` }} />
        </div>
      )}

      <p className={cn("mt-3 text-[13px]", tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : "text-muted-foreground")}>
        {hint}
      </p>
    </div>
  );
}
