import Link from "next/link";
import { FooterAccountLinks } from "@/components/auth/AccountActions";
import { Logo } from "@/components/branding/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Capabilities" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  // Filled in on the client: depends on whether the visitor is signed in.
  { title: "Account", links: [] },
  {
    title: "Help",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/features#security", label: "Security" },
      { href: "/pricing#faq", label: "Questions" },
    ],
  },
];

const LINK_CLASS = "text-sm text-muted-foreground transition-colors hover:text-primary";

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
              {column.title === "Account" && <FooterAccountLinks linkClassName={LINK_CLASS} />}
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-[1180px] text-xs text-subtle-foreground">
        © 2026 PromptDox. A portfolio project. The demo workspace uses sample documents.
      </p>
    </footer>
  );
}
