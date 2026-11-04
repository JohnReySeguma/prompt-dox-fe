"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, MessagesSquare, Sparkles, UserRound, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MOCK_USER } from "@/mock/site";
import { useWorkspaceStore } from "@/store/workspace-store";
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
    { href: "/dashboard", match: "/dashboard", label: "Documents", icon: LayoutDashboard },
    { href: `/workspace/${firstReady ?? "q3-financial-report"}`, match: "/workspace", label: "Workspace", icon: MessagesSquare },
    { href: "/profile", match: "/profile", label: "Profile & usage", icon: UserRound },
  ];
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = useNavItems();
  const docCount = useWorkspaceStore((state) => state.documents.length);

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="px-2" onClick={onNavigate} aria-label="PromptDox home">
        <Logo />
      </Link>

      <p className="mt-8 px-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">
        {MOCK_USER.workspace}
      </p>
      <nav className="mt-2 space-y-1" aria-label="App">
        {items.map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <Link
              key={item.match}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:bg-white/4 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl bg-white/6 ring-1 ring-white/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <item.icon className={cn("size-4", active && "text-cyan-300")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Documents</span>
            <span className="font-mono text-foreground">
              {docCount}/{MOCK_USER.documentLimit}
            </span>
          </div>
          <Progress value={(docCount / MOCK_USER.documentLimit) * 100} className="mt-2" />
          <Button asChild size="sm" className="mt-4 w-full">
            <Link href="/pricing" onClick={onNavigate}>
              <Sparkles /> Upgrade to Pro
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Link href="/profile" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-cyan-400 to-violet-500 text-xs font-semibold text-white">
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
    <div className="relative flex min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-48 left-1/3 h-96 w-[640px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-96 w-[520px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/6 bg-black/20 p-4 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/6 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" aria-label="PromptDox home">
          <Logo />
        </Link>
        <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
          <Menu />
        </Button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="glass-strong fixed inset-y-0 left-0 z-50 w-72 p-4 lg:hidden"
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
