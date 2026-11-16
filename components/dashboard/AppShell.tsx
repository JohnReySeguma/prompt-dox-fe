"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileStack, FlaskConical, LoaderCircle, LogOut, Menu, MessagesSquare, UserRound, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSignOut } from "@/hooks/use-sign-out";
import { useDocuments, useUsage } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  match: string;
  label: string;
  icon: LucideIcon;
}

function useNavItems(): NavItem[] {
  const { data: documents } = useDocuments();
  const firstReady = documents?.find((doc) => doc.status === "ready")?.id;
  return [
    { href: "/dashboard", match: "/dashboard", label: "Documents", icon: FileStack },
    { href: firstReady ? `/workspace/${firstReady}` : "/dashboard", match: "/workspace", label: "Workspace", icon: MessagesSquare },
    { href: "/profile", match: "/profile", label: "Profile & usage", icon: UserRound },
  ];
}

function AppNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = useNavItems();
  return (
    <nav className="mt-2 space-y-0.5" aria-label="App">
      {items.map((item) => {
        const active = pathname.startsWith(item.match);
        return (
          <Link
            key={item.match}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors",
              active ? "bg-primary-soft font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NavSkeleton() {
  return (
    <div className="mt-2 space-y-1">
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useCurrentUser();
  const { data: usage } = useUsage();
  const { signOut, pending: signingOut } = useSignOut();
  const docLimit = usage?.documents.limit ?? null;

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="px-2 py-1" onClick={onNavigate} aria-label="PromptDox home">
        <Logo height={28} priority />
      </Link>

      <p className="mt-8 truncate px-3 text-xs font-medium text-subtle-foreground">{user?.workspace ?? " "}</p>
      <Suspense fallback={<NavSkeleton />}>
        <AppNav onNavigate={onNavigate} />
      </Suspense>

      <div className="mt-auto space-y-3">
        {usage ? (
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Documents</span>
              <span className="font-medium tabular-nums">
                {usage.documents.used} of {docLimit ?? "Unlimited"}
              </span>
            </div>
            <Progress value={docLimit ? (usage.documents.used / docLimit) * 100 : 0} className="mt-2" />
            {usage.plan === "free" ? (
              <UpgradeDialog>
                <button type="button" className="mt-3 text-[13px] font-medium text-primary hover:underline">
                  Upgrade for more documents
                </button>
              </UpgradeDialog>
            ) : (
              <p className="mt-3 text-[13px] text-muted-foreground">
                <span className="rounded bg-marker px-1.5 py-0.5 font-medium text-foreground">Pro</span> plan
              </p>
            )}
          </div>
        ) : (
          <Skeleton className="h-[106px] rounded-lg" />
        )}

        <div className="flex items-center gap-3 border-t border-border px-1 pt-3">
          <Link href="/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-white">
              {user?.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{user?.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon-sm" aria-label="Sign out" onClick={() => void signOut()} disabled={signingOut}>
            {signingOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Shown to demo visitors on every app page. */
function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-marker-edge/50 bg-marker-soft px-4 py-2 text-center text-[13px]">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <FlaskConical className="size-3.5" aria-hidden /> Demo workspace — resets after 24 hours.
      </span>
      <Link href="/sign-up" className="font-medium text-primary hover:underline">
        Create a free account to keep your work
      </Link>
    </div>
  );
}

/** Sends signed-out visitors to sign in, then back here. Renders nothing. */
function AuthGuard() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (status === "unauthenticated") router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);
  return null;
}

/**
 * The shell and the page always render, so every route has an instant static
 * shell. Until the session loads, data queries stay disabled and each page
 * shows its own skeleton.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useCurrentUser();

  return (
    <div className="flex min-h-screen">
      <Suspense>
        <AuthGuard />
      </Suspense>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-surface p-4 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile app bar + drawer */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Link href="/" aria-label="PromptDox home">
          <Logo height={26} priority />
        </Link>
        <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
          <Menu />
        </Button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface p-4 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X />
              </Button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Pages marked data-full-height (the workspace split view) get a fixed height; others scroll the window. */}
      <div className="flex min-w-0 flex-1 flex-col pt-14 has-[[data-full-height]]:h-dvh lg:pt-0">
        {user?.isDemo && <DemoBanner />}
        {children}
      </div>
    </div>
  );
}
