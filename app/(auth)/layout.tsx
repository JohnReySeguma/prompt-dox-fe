import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 mask-[radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]" />
        <div className="absolute top-1/4 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute right-1/4 bottom-0 h-80 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      </div>
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to site
      </Link>
      {children}
    </main>
  );
}
