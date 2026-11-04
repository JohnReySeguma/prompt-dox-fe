"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuotaMeterProps {
  label: string;
  used: number;
  limit: number;
  unit: string;
  hint: string;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function QuotaMeter({ label, used, limit, unit, hint }: QuotaMeterProps) {
  const ratio = Math.min(1, used / limit);
  const tone = ratio >= 0.9 ? "danger" : ratio >= 0.7 ? "warning" : "ok";
  const gradientId = `quota-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="glass flex items-center gap-6 rounded-2xl p-6">
      <div className="relative size-32 shrink-0">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor={tone === "danger" ? "#F43F5E" : tone === "warning" ? "#F59E0B" : "#8B5CF6"} />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - ratio) }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">{Math.round(ratio * 100)}%</span>
          <span className="text-[10px] text-muted-foreground">used</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight" aria-label={`${used} of ${limit} ${unit}`}>
          {used} <span className="text-base font-normal text-muted-foreground">/ {limit} {unit}</span>
        </p>
        <p
          className={cn(
            "mt-2 text-xs",
            tone === "danger" ? "text-rose-300" : tone === "warning" ? "text-amber-300" : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      </div>
    </div>
  );
}
