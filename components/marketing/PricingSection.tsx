"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/mock/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { SalesDialog } from "@/components/billing/SalesDialog";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import type { BillingCycle, PricingPlan } from "@/types";

function BillingToggle({ value, onChange }: { value: BillingCycle; onChange: (value: BillingCycle) => void }) {
  return (
    <div role="radiogroup" aria-label="Billing cycle" className="inline-flex rounded-lg border border-border bg-muted p-1">
      {(["monthly", "yearly"] as const).map((cycle) => {
        const active = value === cycle;
        return (
          <button
            key={cycle}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(cycle)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {cycle === "monthly" ? "Monthly" : "Yearly, save 20%"}
          </button>
        );
      })}
    </div>
  );
}

function Price({ plan, cycle }: { plan: PricingPlan; cycle: BillingCycle }) {
  const amount = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  if (amount === null) {
    return (
      <p className="flex h-12 items-end">
        <span className="text-[34px] leading-none font-semibold tracking-tight">Custom</span>
      </p>
    );
  }
  return (
    <p className="flex h-12 items-end gap-1.5">
      <span className="text-[40px] leading-none font-semibold tracking-tight tabular-nums">${amount}</span>
      <span className="pb-1 text-sm text-muted-foreground">
        {amount === 0 ? "forever" : cycle === "yearly" ? "per user / month, billed yearly" : "per user / month"}
      </span>
    </p>
  );
}

function PlanAction({ plan, cycle }: { plan: PricingPlan; cycle: BillingCycle }) {
  const currentPlan = useWorkspaceStore((state) => state.plan);
  const variant = plan.highlighted ? "default" : "secondary";

  if (plan.id === currentPlan) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Your current plan
      </Button>
    );
  }
  if (plan.id === "pro") {
    return (
      <UpgradeDialog cycle={cycle}>
        <Button variant={variant} className="w-full">
          {plan.cta}
        </Button>
      </UpgradeDialog>
    );
  }
  if (plan.id === "enterprise") {
    return (
      <SalesDialog>
        <Button variant={variant} className="w-full">
          {plan.cta}
        </Button>
      </SalesDialog>
    );
  }
  return (
    <Button asChild variant={variant} className="w-full">
      <Link href="/sign-up">{plan.cta}</Link>
    </Button>
  );
}

export function PricingSection({ showHeading = true }: { showHeading?: boolean }) {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  return (
    <section id="pricing" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {showHeading ? (
            <SectionHeading title="Pricing" description="Start free. Pay when your library or your team grows." />
          ) : (
            <span />
          )}
          <BillingToggle value={cycle} onChange={setCycle} />
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-xl bg-surface p-7",
                plan.highlighted ? "border-2 border-foreground shadow-paper" : "border border-border",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.highlighted && <span className="rounded-md bg-marker px-2 py-0.5 text-xs font-medium">Most teams pick this</span>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-6">
                <Price plan={plan} cycle={cycle} />
              </div>
              <div className="mt-7">
                <PlanAction plan={plan} cycle={cycle} />
              </div>
              <ul className="mt-7 space-y-2.5 border-t border-border pt-6 text-[14px]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-subtle-foreground">Prototype pricing. No payment is taken.</p>
      </div>
    </section>
  );
}
