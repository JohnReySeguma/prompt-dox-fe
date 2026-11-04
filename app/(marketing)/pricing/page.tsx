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
    <div className="pt-32">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <SectionHeading
          as="h1"
          title="Pay for the documents you use"
          description="Every plan includes source citations, streaming answers and all four file types."
        />
      </div>
      <PricingSection showHeading={false} />
      <Faq />
      <CtaSection />
    </div>
  );
}
