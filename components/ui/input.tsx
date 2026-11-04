import * as React from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full rounded-xl border border-input bg-white/3 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors outline-none focus-visible:border-cyan-400/50 focus-visible:bg-white/5 focus-visible:ring-2 focus-visible:ring-cyan-400/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(fieldClasses, "h-10", className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldClasses, "min-h-20 resize-none py-2.5", className)} {...props} />;
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label data-slot="label" className={cn("text-sm font-medium text-foreground/90", className)} {...props} />;
}

export { Input, Textarea, Label };
