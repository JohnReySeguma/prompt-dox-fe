"use client";

import { useState } from "react";
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
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/store/toast-store";

const TEAM_SIZES = ["1–20", "21–100", "101–500", "500+"];

/** Enterprise contact form. Submitting confirms on screen; nothing is sent. */
export function SalesDialog({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[460px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const firstName = String(data.get("name") ?? "").trim().split(/\s+/)[0];
            setOpen(false);
            toast({
              title: firstName ? `Thanks, ${firstName}` : "Thanks for reaching out",
              description: "This demo doesn't send messages. In the real product, our sales team would reply within one business day.",
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>Talk to sales</DialogTitle>
            <DialogDescription>Tell us about your team and we&apos;ll set up a walkthrough of Enterprise.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sales-name">Full name</Label>
                <Input id="sales-name" name="name" autoComplete="name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sales-size">Team size</Label>
                <select
                  id="sales-size"
                  name="size"
                  defaultValue={TEAM_SIZES[1]}
                  className="h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15"
                >
                  {TEAM_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} people
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sales-email">Work email</Label>
              <Input id="sales-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sales-message">What do you need? (optional)</Label>
              <Textarea id="sales-message" name="message" rows={3} placeholder="For example: SSO, self-hosting, or a security review" />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Send request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
