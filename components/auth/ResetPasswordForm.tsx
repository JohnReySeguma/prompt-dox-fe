"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CircleAlert, Eye, EyeOff, LinkIcon, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { resetPassword } from "@/lib/api/auth";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { useToast } from "@/store/toast-store";

const MIN_LENGTH = 8;

/**
 * Choose a new password from the emailed link (`/reset-password?token=...`)
 * via `POST /v1/auth/password/reset`. Success revokes every session, so the
 * user signs in again afterwards.
 */
export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverFieldError, setServerFieldError] = useState<string | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);

  if (!token || linkInvalid) {
    return (
      <div className="w-full max-w-[380px]">
        <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
          <LinkIcon className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-[28px] font-semibold tracking-[-0.025em]">This reset link isn&apos;t valid</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {error ?? "The link is missing its code, or it has already been used. Reset links expire after 1 hour."}
        </p>
        <Button asChild className="mt-8 h-11 w-full">
          <Link href="/forgot-password">Send a new link</Link>
        </Button>
      </div>
    );
  }

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= MIN_LENGTH && confirm === password && !pending;

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Choose a new password</h1>
      <p className="mt-1.5 text-[15px] text-muted-foreground">You&apos;ll be signed out on other devices once it&apos;s saved.</p>

      <form
        className="mt-8 space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (!canSubmit) return;
          setPending(true);
          setError(null);
          setServerFieldError(null);
          resetPassword({ token, newPassword: password })
            .then(() => {
              toast({ title: "Password updated", description: "Sign in with your new password." });
              router.push("/sign-in");
            })
            .catch((caught: unknown) => {
              setPending(false);
              if (caught instanceof ApiError && caught.code === "invalid_reset_token") {
                setError(caught.message);
                setLinkInvalid(true);
              } else if (caught instanceof ApiError && caught.code === "validation_error") {
                setServerFieldError(caught.fieldErrors.newPassword ?? caught.message);
              } else {
                setError(errorMessage(caught));
              }
            });
        }}
      >
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#f3c9c2] bg-[#fdf0ee] px-3 py-2.5 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Input
              id="new-password"
              name="newPassword"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setServerFieldError(null);
              }}
              aria-invalid={((touched || tooShort) && password.length < MIN_LENGTH) || Boolean(serverFieldError)}
              aria-describedby="new-password-hint"
              className="h-11 pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? "Hide passwords" : "Show passwords"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-subtle-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p
            id="new-password-hint"
            className={(touched || tooShort) && password.length < MIN_LENGTH ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
          >
            At least {MIN_LENGTH} characters.
          </p>
          {serverFieldError && <p className="text-xs text-destructive">{serverFieldError}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={mismatch || (touched && confirm !== password)}
            aria-describedby="confirm-password-hint"
            className="h-11"
          />
          {(mismatch || (touched && confirm !== password)) && (
            <p id="confirm-password-hint" className="text-xs text-destructive">
              The passwords don&apos;t match.
            </p>
          )}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" />}
          Save new password
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
