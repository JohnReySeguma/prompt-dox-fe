import { SectionHeading } from "@/components/marketing/SectionHeading";

const STEPS = [
  {
    title: "Upload",
    body: "Drop in a PDF, Word file, Markdown or plain text. Folders work too.",
  },
  {
    title: "Index",
    body: "The document is split into passages and indexed for your workspace only. Most files are ready in under a minute.",
  },
  {
    title: "Ask",
    body: "Type a question the way you'd ask a colleague. The answer streams in as it's written.",
  },
  {
    title: "Check the source",
    body: "Click a citation to open the page with the supporting sentence highlighted.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <SectionHeading title="From upload to a checked answer" />
        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t-2 border-foreground pt-5">
              <span className="font-serif text-[40px] leading-none text-subtle-foreground tabular-nums">{index + 1}</span>
              <h3 className="mt-4 text-[17px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
