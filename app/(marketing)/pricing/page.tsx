import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/CtaSection";
import { Faq } from "@/components/marketing/Faq";
import { PricingSection } from "@/components/marketing/PricingSection";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free, Pro and Enterprise plans for PromptDox.",
};

export default function PricingPage() {
  return (
    <div className="pt-36">
      <SectionHeading
        eyebrow="Pricing"
        title={
          <>
            Pay for answers, <span className="text-gradient">not for seats you don&apos;t use</span>
          </>
        }
        description="Every plan includes source citations, streaming answers and all four document formats."
        className="px-4"
      />
      <PricingSection showHeading={false} />
      <Faq />
      <CtaSection />
    </div>
  );
}
