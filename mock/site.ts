import type { PlanLimits, PricingPlan, SelfServePlan, UserProfile } from "@/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For trying PromptDox on personal docs.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["10 documents", "100 queries per day", "PDF, DOCX, MD & TXT", "Page-level citations", "Community support"],
    cta: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For professionals living in long documents.",
    monthlyPrice: 24,
    yearlyPrice: 19,
    features: [
      "500 documents",
      "Unlimited queries",
      "Paragraph-level citations",
      "Shared workspaces (up to 5)",
      "Priority indexing queue",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams with security & scale needs.",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      "Unlimited documents",
      "Dedicated tenant isolation",
      "SSO (SAML / OIDC) & SCIM",
      "Bring-your-own-key encryption",
      "99.95% uptime SLA",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
];

export const MOCK_USER: UserProfile = {
  name: "Avery Santos",
  email: "avery.santos@northwind.example",
  initials: "AS",
  role: "Workspace Admin",
  workspace: "Northwind Analytics",
  memberSince: "2026-03-14T00:00:00Z",
  googleConnected: true,
  queriesToday: 64,
};

export const PLAN_LIMITS: Record<SelfServePlan, PlanLimits> = {
  free: { documents: 10, dailyQueries: 100 },
  pro: { documents: 500, dailyQueries: null },
};
