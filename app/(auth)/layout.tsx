import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { CitationBadge } from "@/components/workspace/CitedText";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col bg-surface px-6 py-6 sm:px-12">
        <Link href="/" aria-label="PromptDox home" className="w-fit">
          <Logo height={28} priority />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">{children}</div>
      </div>

      <aside aria-hidden className="hidden items-center justify-center border-l border-border bg-[#e9ebef] p-12 lg:flex">
        <figure className="w-full max-w-[520px]">
          <div className="rounded-[4px] bg-surface px-10 py-9 shadow-paper">
            <p className="text-xs text-subtle-foreground">Vendor-Master-Services-Agreement.pdf, page 2</p>
            <h2 className="mt-5 font-serif text-[22px] font-medium">Service Levels</h2>
            <p className="mt-4 font-serif text-[16px] leading-[1.75] text-foreground/80">
              <span className="marker marker-on text-foreground">
                Provider shall maintain monthly uptime of at least 99.95% for production services
              </span>
              , excluding scheduled maintenance announced 72 hours in advance.
            </p>
          </div>
          <figcaption className="mt-5 rounded-xl border border-border bg-surface p-4 text-[14px] leading-relaxed shadow-paper">
            The vendor commits to 99.95% monthly uptime, not counting maintenance announced 72 hours ahead
            <CitationBadge citation={{ page: 2, paragraph: 1 }} active />
          </figcaption>
        </figure>
      </aside>
    </main>
  );
}
