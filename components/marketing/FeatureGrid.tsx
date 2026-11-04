import { FormatBadge } from "@/components/dashboard/FormatBadge";
import { CitationBadge } from "@/components/workspace/CitedText";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import type { DocFormat } from "@/types";

const FORMATS: DocFormat[] = ["pdf", "docx", "md", "txt"];

const PASSAGES = [
  { score: "0.92", text: "Key risks include GPU supply constraints, foreign-exchange headwinds…" },
  { score: "0.81", text: "For Q4 2026, management guides revenue between $52.0M and $53.5M…" },
  { score: "0.64", text: "Gross margin improved to 78.4% following the migration of inference…" },
];

const CAPABILITIES = [
  {
    title: "Reads the files you already have",
    body: "Upload reports, contracts, specs and notes as they are. Headings, lists and tables are kept, so answers can point to the right section.",
    example: (
      <div className="flex flex-wrap gap-2">
        {FORMATS.map((format) => (
          <FormatBadge key={format} format={format} size="lg" />
        ))}
      </div>
    ),
  },
  {
    title: "Shows where every answer came from",
    body: "Each claim carries a citation to a page and paragraph. Click it and the source opens with the sentence marked, so checking takes a second.",
    example: (
      <div className="rounded-lg border border-border bg-background p-4 text-[14px] leading-relaxed">
        Net revenue retention reached 128%, a company record
        <CitationBadge citation={{ page: 1, paragraph: 3 }} active />
        <p className="mt-3 font-serif text-[15px] text-foreground/80">
          “<span className="marker marker-on">Net revenue retention reached 128%, the highest in company history</span>, with 14
          customers now exceeding $1M…”
        </p>
      </div>
    ),
  },
  {
    title: "Finds the passage, not just the file",
    body: "Search ranks individual paragraphs by meaning and keywords together, so a question about “risks” still finds a sentence about “headwinds”.",
    example: (
      <ol className="divide-y divide-border rounded-lg border border-border bg-background text-[13px]">
        {PASSAGES.map((passage) => (
          <li key={passage.score} className="flex gap-3 px-4 py-2.5">
            <span className="w-9 shrink-0 font-medium tabular-nums text-primary">{passage.score}</span>
            <span className="truncate text-muted-foreground">{passage.text}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    title: "Keeps every team's documents separate",
    body: "Each workspace has its own index and encryption keys. A question asked in one workspace can never retrieve text from another.",
  },
];

export function FeatureGrid({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="features" className="border-t border-border bg-surface px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          {showHeading && (
            <SectionHeading
              title="An assistant that cites its sources"
              description="PromptDox only answers from the documents in your workspace. If it can't find support, it says so."
            />
          )}
        </div>

        <div className="divide-y divide-border border-y border-border">
          {CAPABILITIES.map((capability) => (
            <article key={capability.title} className="grid gap-5 py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10">
              <div>
                <h3 className="text-[19px] font-semibold tracking-tight">{capability.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{capability.body}</p>
              </div>
              {capability.example && <div className="self-center">{capability.example}</div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
