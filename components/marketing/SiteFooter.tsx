import Link from "next/link";
import { Logo } from "@/components/branding/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Live demo" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
      { href: "/profile", label: "Profile" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/features#security", label: "Security" },
      { href: "/pricing#faq", label: "FAQ" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/6 px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Multi-tenant document intelligence. Ask anything, trace every answer back to its source.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-cyan-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col justify-between gap-2 border-t border-white/6 pt-6 text-xs text-muted-foreground sm:flex-row">
        <p>© 2026 PromptDox. UI prototype — all data is mocked.</p>
        <p>Built with Next.js, Tailwind CSS &amp; Framer Motion.</p>
      </div>
    </footer>
  );
}
