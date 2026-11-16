import { Suspense } from "react";
import { AppShell, ShellSkeleton } from "@/components/dashboard/AppShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // App pages need the signed-in session and the current URL, both known only at
  // request time, so the static shell is a skeleton and the app streams in.
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
