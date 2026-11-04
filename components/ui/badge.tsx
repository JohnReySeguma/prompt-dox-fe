import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-foreground",
        cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
        violet: "border-violet-400/25 bg-violet-500/10 text-violet-200",
        success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
        warning: "border-amber-400/25 bg-amber-400/10 text-amber-200",
        destructive: "border-red-400/25 bg-red-500/10 text-red-200",
        outline: "border-white/15 text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
