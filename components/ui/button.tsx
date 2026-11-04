import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-r from-cyan-400 to-violet-500 text-white shadow-[0_0_24px_-6px] shadow-cyan-400/60 hover:shadow-[0_0_32px_-4px] hover:shadow-violet-500/70 hover:brightness-110 active:scale-[0.98]",
        secondary: "glass text-foreground hover:bg-white/8 active:scale-[0.98]",
        outline: "border border-white/12 bg-transparent text-foreground hover:border-white/25 hover:bg-white/5",
        ghost: "text-muted-foreground hover:bg-white/6 hover:text-foreground",
        destructive: "bg-destructive/90 text-white hover:bg-destructive active:scale-[0.98]",
        link: "text-cyan-300 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs",
        default: "h-10 px-4",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
