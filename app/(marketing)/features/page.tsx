import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export const metadata: Metadata = {
  title: "Product",
  description: "Multi-format uploads, cited answers and passage-level search.",
};

const SECURITY = [
  { title: "Single sign-on", body: "SAML and OIDC sign-in, with automatic user provisioning through SCIM." },
  { title: "Your own keys", body: "Encrypt each workspace's index with keys held in your cloud KMS." },
  { title: "Audit log", body: "Every upload, question and export is recorded and can be exported." },
  { title: "Workspace isolation", body: "Separate indexes per workspace. Search never crosses between them." },
];

export default function FeaturesPage() {
  return (
    <div className="pt-32">
      <div className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-8">
        <SectionHeading
          as="h1"
          title="Answers you can trace back to the page"
          description="PromptDox pairs passage-level search with a reader built for checking sources."
        />
      </div>
      <FeatureGrid />
      <HowItWorks />

      <section id="security" className="scroll-mt-20 border-t border-border bg-surface px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading
            title="Ready for a security review"
            description="Built for legal, finance and healthcare teams that need to know where an answer came from."
          />
          <dl className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {SECURITY.map((item) => (
              <div key={item.title} className="border-t border-border pt-5">
                <dt className="font-semibold">{item.title}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <div className="pt-24">
        <CtaSection />
      </div>
    </div>
  );
}
