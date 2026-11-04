"use client";

import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PLAN_LIMITS, PRICING_PLANS } from "@/mock/site";
import { useToast } from "@/store/toast-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { BillingCycle } from "@/types";

const PRO = PRICING_PLANS.find((plan) => plan.id === "pro")!;

function formatQueries(limit: number | null): string {
  return limit === null ? "Unlimited" : String(limit);
}

const CHANGES = [
  { label: "Documents", from: String(PLAN_LIMITS.free.documents), to: String(PLAN_LIMITS.pro.documents) },
  { label: "Questions per day", from: formatQueries(PLAN_LIMITS.free.dailyQueries), to: formatQueries(PLAN_LIMITS.pro.dailyQueries) },
  { label: "Shared workspaces", from: "None", to: "Up to 5" },
];

interface UpgradeDialogProps {
  /** The element that opens the dialog. */
  children: React.ReactNode;
  cycle?: BillingCycle;
}

/**
 * Demo checkout: confirming switches the in-memory plan to Pro and says plainly
 * that no payment was taken. There is deliberately no card form.
 */
export function UpgradeDialog({ children, cycle = "yearly" }: UpgradeDialogProps) {
  const plan = useWorkspaceStore((state) => state.plan);
  const setPlan = useWorkspaceStore((state) => state.setPlan);
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const price = cycle === "yearly" ? PRO.yearlyPrice : PRO.monthlyPrice;
  const billing = cycle === "yearly" ? "per user / month, billed yearly" : "per user / month";

  const confirm = () => {
    setPlan("pro");
    setOpen(false);
    toast({
      title: "Switched to Pro for this session",
      description: "Checkout is turned off in this demo, so no payment was taken.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[440px]">
        {plan === "pro" ? (
          <>
            <DialogHeader>
              <DialogTitle>You&apos;re on Pro</DialogTitle>
              <DialogDescription>
                Pro is active for this session. You can switch back to Free from your profile page.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Upgrade to Pro</DialogTitle>
              <DialogDescription>{PRO.tagline}</DialogDescription>
            </DialogHeader>

            <p className="flex items-end gap-1.5">
              <span className="text-[34px] leading-none font-semibold tracking-tight tabular-nums">${price}</span>
              <span className="pb-0.5 text-sm text-muted-foreground">{billing}</span>
            </p>

            <table className="mt-5 w-full text-[14px]">
              <caption className="sr-only">What changes on Pro</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th scope="col" className="pb-2 font-medium">
                    What changes
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Free
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {CHANGES.map((change) => (
                  <tr key={change.label} className="border-b border-border last:border-0">
                    <th scope="row" className="py-2.5 text-left font-normal">
                      {change.label}
                    </th>
                    <td className="py-2.5 text-muted-foreground tabular-nums">{change.from}</td>
                    <td className="py-2.5 font-medium tabular-nums">{change.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-5 flex gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Checkout is turned off in this demo. Switching changes your plan for this session only, and no payment
              is taken.
            </p>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={confirm}>
                Switch to Pro <ArrowRight />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
