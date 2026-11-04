import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  /** Adds a soft outer glow behind the sparkle. */
  glow?: boolean;
  title?: string;
  /** Hide from assistive tech when rendered next to the wordmark. */
  decorative?: boolean;
}

/**
 * PromptDox mark: a folded-corner document whose text lines resolve
 * into a four-point AI sparkle breaking out of the lower-right edge.
 */
export function LogoMark({ className, glow = true, title = "PromptDox", decorative = false }: LogoMarkProps) {
  const uid = useId().replace(/:/g, "");
  const stroke = `pd-stroke-${uid}`;
  const fill = `pd-fill-${uid}`;
  const spark = `pd-spark-${uid}`;
  const blur = `pd-blur-${uid}`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      className={cn("size-8 shrink-0", className)}
    >
      {!decorative && <title>{title}</title>}
      <defs>
        <linearGradient id={stroke} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={fill} x1="8" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" stopOpacity="0.22" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.08" />
        </linearGradient>
        <radialGradient id={spark} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(35 35) rotate(90) scale(10)">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.45" stopColor="#A5F3FC" />
          <stop offset="1" stopColor="#A78BFA" />
        </radialGradient>
        <filter id={blur} x="20" y="20" width="30" height="30" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Document body with folded corner */}
      <path
        d="M12 4.5h15.6l9.9 9.9V40a3.5 3.5 0 0 1-3.5 3.5H12A3.5 3.5 0 0 1 8.5 40V8A3.5 3.5 0 0 1 12 4.5Z"
        fill={`url(#${fill})`}
      />
      <path
        d="M27 43.5H12A3.5 3.5 0 0 1 8.5 40V8A3.5 3.5 0 0 1 12 4.5h15.6L37.5 14.4V25"
        stroke={`url(#${stroke})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M27 5v7.5a2 2 0 0 0 2 2h8" stroke={`url(#${stroke})`} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Text lines fading into vectors */}
      <path d="M15 20h12" stroke="#E0F2FE" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 26.5h8" stroke="#E0F2FE" strokeOpacity="0.6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="15.5" cy="33" r="1.5" fill="#67E8F9" />
      <circle cx="21" cy="33" r="1.5" fill="#67E8F9" fillOpacity="0.7" />

      {/* AI sparkle */}
      {glow && <circle cx="35" cy="35" r="7" fill="#22D3EE" opacity="0.55" filter={`url(#${blur})`} />}
      <path
        d="M35 24.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5-.6-5.6-4.9-9.9-10.5-10.5 5.6-.6 9.9-4.9 10.5-10.5Z"
        fill={`url(#${spark})`}
      />
    </svg>
  );
}

interface LogoProps {
  variant?: "horizontal" | "icon";
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

export function Logo({ variant = "horizontal", className, markClassName, textClassName }: LogoProps) {
  if (variant === "icon") {
    return <LogoMark className={cn(className, markClassName)} />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} decorative />
      <span className={cn("text-lg font-semibold tracking-tight text-foreground", textClassName)}>
        Prompt
        <span className="bg-linear-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">Dox</span>
      </span>
    </span>
  );
}
