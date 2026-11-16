import { UploadCta } from "@/components/auth/AccountActions";
import { TryDemoButton } from "@/components/auth/TryDemoButton";
import { HeroDocument } from "@/components/marketing/HeroDocument";

export function Hero() {
  return (
    <section className="px-5 pt-28 pb-20 sm:px-8 lg:pt-36 lg:pb-28">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="max-w-[540px]">
          <h1 className="text-[clamp(2.6rem,5.4vw,4.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            {/* Non-breaking hyphen keeps "real-time" on one line. */}
            Turn massive documents into real{"‑"}time answers
          </h1>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-muted-foreground">
            Ask a 200-page report a plain question. PromptDox answers in seconds and marks the exact passage it
            used, so you can check it before you quote it.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <UploadCta size="lg" />
            <TryDemoButton size="lg" variant="secondary" />
          </div>
          <p className="mt-5 text-sm text-subtle-foreground">The demo opens a workspace with sample documents, no sign-up needed. Works with PDF, Word, Markdown and text.</p>
        </div>

        <HeroDocument />
      </div>
    </section>
  );
}
