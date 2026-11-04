import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-4 py-24">
      <div className="gradient-border glass-strong relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[640px] -translate-x-1/2 rounded-full bg-cyan-400/25 blur-[100px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-96 rounded-full bg-violet-600/25 blur-[100px]" />
        <LogoMark className="relative mx-auto size-14 animate-float" decorative />
        <h2 className="relative mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Stop skimming. Start asking.
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
          Bring your first ten documents for free and get answers you can actually verify.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Create free account <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard">Explore the dashboard</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
