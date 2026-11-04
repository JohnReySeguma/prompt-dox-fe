import type { Metadata } from "next";
import { Fingerprint, KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SectionHeading } from "@/components/marketing/SectionHeading";

export const metadata: Metadata = {
  title: "Features",
  description: "Multi-format ingestion, traceable citations and instant vector search.",
};

const SECURITY = [
  { icon: Fingerprint, title: "SSO & SCIM", body: "SAML and OIDC single sign-on with automatic user provisioning." },
  { icon: KeyRound, title: "Bring your own key", body: "Encrypt every tenant index with keys you control in your KMS." },
  { icon: ScrollText, title: "Audit logs", body: "Every upload, query and export is recorded and exportable." },
  { icon: ShieldCheck, title: "Tenant isolation", body: "Separate indexes per workspace. Retrieval never crosses tenants." },
];

export default function FeaturesPage() {
  return (
    <div className="pt-36">
      <SectionHeading
        eyebrow="Features"
        title={
          <>
            Answers you can <span className="text-gradient">trace, trust and share</span>
          </>
        }
        description="PromptDox combines a production-grade retrieval pipeline with a reading experience built for verification."
        className="px-4"
      />
      <FeatureGrid showHeading={false} />
      <HowItWorks />

      <section id="security" className="scroll-mt-24 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Security"
            title="Enterprise controls from day one"
            description="Built for legal, finance and healthcare teams who can't afford to guess where an answer came from."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SECURITY.map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6">
                <item.icon className="size-6 text-violet-300" aria-hidden />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </div>
  );
}
