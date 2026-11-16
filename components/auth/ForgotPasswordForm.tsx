"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CircleAlert, LoaderCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError, errorMessage } from "@/lib/api/errors";

/**
 * Request a password-reset link (`POST /v1/auth/password/forgot`). The API
 * answers 204 whether or not the email has an account, so the confirmation
 * never reveals which addresses are registered.
 */
export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (sentTo) {
    return (
      <div className="w-full max-w-[380px]">
        <span className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary">
          <MailCheck className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-[28px] font-semibold tracking-[-0.025em]">Check your email</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, we&apos;ve emailed a reset
          link. It expires in 1 hour.
        </p>
        <p className="mt-6 rounded-lg bg-muted px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">
          Nothing arrived? Check your spam folder, or send the link again in a few minutes.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button variant="secondary" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
          <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Reset your password</h1>
      <p className="mt-1.5 text-[15px] text-muted-foreground">
        Enter the email you use for PromptDox and we&apos;ll send you a link to choose a new password.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
          setPending(true);
          setError(null);
          forgotPassword(email)
            .then(() => setSentTo(email))
            .catch((caught: unknown) =>
              setError(
                caught instanceof ApiError && caught.code === "validation_error"
                  ? (caught.fieldErrors.email ?? caught.message)
                  : errorMessage(caught),
              ),
            )
            .finally(() => setPending(false));
        }}
      >
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#f3c9c2] bg-[#fdf0ee] px-3 py-2.5 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">Work email</Label>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="h-11"
            autoFocus
            required
          />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" />}
          Send reset link
        </Button>
      </form>

      <Link href="/sign-in" className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to sign in
      </Link>
    </div>
  );
}
