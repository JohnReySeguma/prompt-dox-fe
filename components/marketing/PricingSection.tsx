"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { PRICING_PLANS } from "@/mock/site";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BillingCycle, PricingPlan } from "@/types";

function BillingToggle({ value, onChange }: { value: BillingCycle; onChange: (value: BillingCycle) => void }) {
  return (
    <div role="radiogroup" aria-label="Billing cycle" className="glass relative mx-auto inline-flex rounded-full p-1">
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
              "relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors",
              active ? "text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-cyan-500 to-violet-500"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {cycle}
            {cycle === "yearly" && (
              <span className={cn("rounded-full px-1.5 py-px text-[10px]", active ? "bg-white/20" : "bg-emerald-400/15 text-emerald-300")}>
                −20%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Price({ plan, cycle }: { plan: PricingPlan; cycle: BillingCycle }) {
  const amount = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  if (amount === null) {
    return <span className="text-4xl font-semibold tracking-tight">Custom</span>;
  }
  return (
    <span className="flex items-end gap-1.5">
      <span className="relative inline-flex h-11 items-end overflow-hidden text-4xl font-semibold tracking-tight">
        <span>$</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={amount}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {amount}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mb-1 text-sm text-muted-foreground">
        /user/mo{amount > 0 && cycle === "yearly" ? ", billed yearly" : ""}
      </span>
    </span>
  );
}

export function PricingSection({ showHeading = true }: { showHeading?: boolean }) {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {showHeading && (
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans that scale with your library"
            description="Start free. Upgrade when your documents, or your team, outgrow it."
          />
        )}
        <div className={cn("flex justify-center", showHeading ? "mt-10" : "")}>
          <BillingToggle value={cycle} onChange={setCycle} />
        </div>

        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-3xl p-7",
                plan.highlighted
                  ? "gradient-border glass-strong shadow-[0_0_60px_-20px] shadow-cyan-400/50 lg:-my-3 lg:py-10"
                  : "glass",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-linear-to-r from-cyan-400 to-violet-500 px-3 py-1 text-xs font-medium text-white">
                  <Sparkles className="size-3" aria-hidden /> Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-6">
                <Price plan={plan} cycle={cycle} />
              </div>
              <Button
                asChild
                variant={plan.highlighted ? "default" : "secondary"}
                className="mt-7 w-full"
              >
                <Link href={plan.id === "enterprise" ? "/pricing#faq" : "/sign-up"}>{plan.cta}</Link>
              </Button>
              <ul className="mt-8 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-cyan-400/15">
                      <Check className="size-3 text-cyan-300" aria-hidden />
                    </span>
                    <span className="text-foreground/85">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
