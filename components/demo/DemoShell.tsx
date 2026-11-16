"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Eye } from "lucide-react";
import { HeaderAccountActions } from "@/components/auth/AccountActions";
import { Logo } from "@/components/branding/Logo";
import { Badge } from "@/components/ui/badge";

/**
 * Frame for the public demo. No account is involved: the demo shows sample
 * documents and canned answers, and nothing is saved.
 */
export function DemoShell({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  return (
    <div className="flex min-h-dvh flex-col has-[[data-full-height]]:h-dvh">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="PromptDox home">
            <Logo height={26} priority />
          </Link>
          <Badge variant="marker">Demo</Badge>
        </div>
        <HeaderAccountActions className="flex" />
      </header>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-marker-edge/50 bg-marker-soft px-4 py-2 text-center text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Eye className="size-3.5" aria-hidden /> A read-only demo with sample documents. Nothing you do here is saved.
        </span>
        {status === "authenticated" ? (
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            Go to your documents
          </Link>
        ) : (
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Create a free account to use your own files
          </Link>
        )}
      </div>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
