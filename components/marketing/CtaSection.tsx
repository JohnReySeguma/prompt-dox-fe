import { UploadCta } from "@/components/auth/AccountActions";
import { TryDemoButton } from "@/components/auth/TryDemoButton";

export function CtaSection() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8 rounded-2xl bg-foreground px-8 py-14 text-white sm:px-14 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[560px]">
          <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] leading-tight font-semibold tracking-[-0.03em]">
            Bring one document. Ask it anything.
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-white/70">
            Your first 10 documents are free, and every answer comes with its source.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <UploadCta size="lg" className="bg-white text-foreground shadow-none hover:bg-white/90" />
          <TryDemoButton size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" />
        </div>
      </div>
    </section>
  );
}
