"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileStack, LogOut, Menu, MessagesSquare, UserRound, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";
import { MOCK_USER, PLAN_LIMITS } from "@/mock/site";
import { usePlanLimits, useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  match: string;
  label: string;
  icon: LucideIcon;
}

function useNavItems(): NavItem[] {
  const firstReady = useWorkspaceStore((state) => state.documents.find((doc) => doc.status === "ready")?.id);
  return [
    { href: "/dashboard", match: "/dashboard", label: "Documents", icon: FileStack },
    { href: `/workspace/${firstReady ?? "q3-financial-report"}`, match: "/workspace", label: "Workspace", icon: MessagesSquare },
    { href: "/profile", match: "/profile", label: "Profile & usage", icon: UserRound },
  ];
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = useNavItems();
  const docCount = useWorkspaceStore((state) => state.documents.length);
  const limits = usePlanLimits();

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="px-2 py-1" onClick={onNavigate} aria-label="PromptDox home">
        <Logo height={28} priority />
      </Link>

      <p className="mt-8 px-3 text-xs font-medium text-subtle-foreground">{MOCK_USER.workspace}</p>
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

      <div className="mt-auto space-y-3">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Documents</span>
            <span className="font-medium tabular-nums">
              {docCount} of {limits.documents}
            </span>
          </div>
          <Progress value={(docCount / limits.documents) * 100} className="mt-2" />
          {limits.plan === "free" ? (
            <UpgradeDialog>
              <button type="button" className="mt-3 text-[13px] font-medium text-primary hover:underline">
                Upgrade for {PLAN_LIMITS.pro.documents} documents
              </button>
            </UpgradeDialog>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">
              <span className="rounded bg-marker px-1.5 py-0.5 font-medium text-foreground">Pro</span> plan, this session
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-1 pt-3">
          <Link href="/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-white">
              {MOCK_USER.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{MOCK_USER.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{MOCK_USER.email}</span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="icon-sm" aria-label="Sign out">
            <Link href="/sign-in">
              <LogOut />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
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

      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">{children}</div>
    </div>
  );
}
