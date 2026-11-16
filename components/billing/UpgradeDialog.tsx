"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, CircleAlert, Info, LoaderCircle } from "lucide-react";
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
import { PRICING_PLANS } from "@/content/pricing";
import { errorMessage } from "@/lib/api/errors";
import { switchPlan } from "@/lib/api/me";
import { queryKeys, useUsage } from "@/lib/queries";
import { useToast } from "@/store/toast-store";
import type { BillingCycle, Usage } from "@/types";

const PRO = PRICING_PLANS.find((plan) => plan.id === "pro")!;

const CHANGES = [
  { label: "Documents", from: "10", to: "500" },
  { label: "Questions per day", from: "100", to: "Unlimited" },
  { label: "Shared workspaces", from: "None", to: "Up to 5" },
];

interface UpgradeDialogProps {
  /** The element that opens the dialog. */
  children: React.ReactNode;
  cycle?: BillingCycle;
}

/**
 * Demo checkout: confirming calls `POST /v1/me/plan` and says plainly that no
 * payment was taken. There is deliberately no card form.
 */
export function UpgradeDialog({ children, cycle = "yearly" }: UpgradeDialogProps) {
  const queryClient = useQueryClient();
  const { data: usage } = useUsage();
  const plan = usage?.plan ?? "free";
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const upgrade = useMutation({
    mutationFn: () => switchPlan("pro"),
    onSuccess: (next) => {
      queryClient.setQueryData<Usage>(queryKeys.usage, next);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      setOpen(false);
      toast({
        title: "You're on Pro",
        description: "Checkout is turned off in this demo, so no payment was taken.",
      });
    },
  });

  const price = cycle === "yearly" ? PRO.yearlyPrice : PRO.monthlyPrice;
  const billing = cycle === "yearly" ? "per user / month, billed yearly" : "per user / month";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) upgrade.reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[440px]">
        {plan === "pro" ? (
          <>
            <DialogHeader>
              <DialogTitle>You&apos;re on Pro</DialogTitle>
              <DialogDescription>
                Pro is active on your workspace. You can switch back to Free from your profile page.
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
              Checkout is turned off in this demo. Switching changes your plan right away, and no payment is taken.
            </p>
            {upgrade.isError && (
              <p role="alert" className="mt-3 flex gap-2.5 text-[13px] leading-relaxed text-destructive">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {errorMessage(upgrade.error)}
              </p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={() => upgrade.mutate()} disabled={upgrade.isPending}>
                {upgrade.isPending && <LoaderCircle className="animate-spin" />}
                Switch to Pro {!upgrade.isPending && <ArrowRight />}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
