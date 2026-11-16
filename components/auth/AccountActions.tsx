"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkButtonProps = Omit<ButtonProps, "asChild" | "children">;

/**
 * "Upload a document": straight to the library when signed in, otherwise to
 * sign-up, which returns to the library afterwards.
 */
export function UploadCta(props: LinkButtonProps) {
  const { status } = useSession();
  const href = status === "authenticated" ? "/dashboard" : "/sign-up?callbackUrl=%2Fdashboard";
  return (
    <Button asChild {...props}>
      <Link href={href}>Upload a document</Link>
    </Button>
  );
}

/**
 * Header account buttons. Signed in: one button back to the app. Signed out:
 * Sign in + Start free. While the session loads, an invisible placeholder
 * keeps the header from shifting.
 */
export function HeaderAccountActions({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { status } = useSession();

  if (status === "loading") {
    return <div aria-hidden className={cn("h-9 w-[168px]", className)} />;
  }
  if (status === "authenticated") {
    return (
      <div className={className}>
        <Button asChild size="sm" className="w-full">
          <Link href="/dashboard" onClick={onNavigate}>
            Open dashboard
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button asChild variant="ghost" size="sm" className="flex-1">
        <Link href="/sign-in" onClick={onNavigate}>
          Sign in
        </Link>
      </Button>
      <Button asChild size="sm" className="flex-1">
        <Link href="/sign-up" onClick={onNavigate}>
          Start free
        </Link>
      </Button>
    </div>
  );
}

/** Footer "Account" links: sign-in and sign-up for visitors, the app for signed-in users. */
export function FooterAccountLinks({ linkClassName }: { linkClassName?: string }) {
  const { status } = useSession();
  const links =
    status === "authenticated"
      ? [
          { href: "/dashboard", label: "Your documents" },
          { href: "/profile", label: "Profile & usage" },
        ]
      : [
          { href: "/sign-in", label: "Sign in" },
          { href: "/sign-up", label: "Create account" },
        ];
  return (
    <>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={linkClassName}>
            {link.label}
          </Link>
        </li>
      ))}
    </>
  );
}
