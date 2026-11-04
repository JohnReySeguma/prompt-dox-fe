import Link from "next/link";
import { Logo } from "@/components/branding/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Capabilities" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Demo workspace" },
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
    title: "Help",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/features#security", label: "Security" },
      { href: "/pricing#faq", label: "Questions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo height={26} />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Answers from your documents, with the paragraph that backs them up.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-[1180px] text-xs text-subtle-foreground">
        © 2026 PromptDox. Interface prototype: all documents, answers and accounts are sample data.
      </p>
    </footer>
  );
}
