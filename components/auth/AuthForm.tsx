"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { TryDemoButton } from "@/components/auth/TryDemoButton";
import { GoogleIcon } from "@/components/branding/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { register } from "@/lib/api/auth";
import { ApiError, errorMessage } from "@/lib/api/errors";

type Mode = "sign-in" | "sign-up";
type Field = "name" | "email" | "password";

const COPY: Record<Mode, { title: string; subtitle: string; submit: string; switchText: string; switchLink: string; switchHref: string }> = {
  "sign-in": {
    title: "Sign in to PromptDox",
    subtitle: "Pick up where you left off in your workspace.",
    submit: "Sign in",
    switchText: "New to PromptDox?",
    switchLink: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    title: "Create your workspace",
    subtitle: "Your first 10 documents are free. No card needed.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/sign-in",
  },
};

/** Only same-site paths, so a crafted link can't bounce users elsewhere after sign-in. */
export function safeCallbackUrl(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

/** Errors Auth.js reports back on the URL (`/sign-in?error=...`). */
function urlErrorMessage(error: string | null, code: string | null): string | null {
  if (!error) return null;
  if (error === "GoogleSignIn") {
    return code === "invalid_google_token"
      ? "Google couldn't confirm that sign-in. Please try again."
      : "We couldn't sign you in with Google. Please try again, or use your email.";
  }
  if (error === "AccessDenied") return "That sign-in was cancelled.";
  return "We couldn't sign you in. Please try again.";
}

/** Auth.js puts our backend's message in `code`; its own default is "credentials". */
function credentialsMessage(code: string | undefined): string {
  return code && code !== "credentials" ? code : "We couldn't sign you in. Please try again.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = COPY[mode];
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  const [pending, setPending] = useState<"google" | "email" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(() => urlErrorMessage(searchParams.get("error"), searchParams.get("code")));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const { data: session, status, update } = useSession();
  const isDemo = Boolean(session?.user?.isDemo);

  // Already signed in: nothing to do here. Demo visitors may stay, to sign in
  // to or create a real account.
  useEffect(() => {
    if (status === "authenticated" && !isDemo && pending === null) router.replace(callbackUrl);
  }, [status, isDemo, pending, router, callbackUrl]);

  // The page stays alive (hidden) for the back button; don't come back mid-submit.
  useLayoutEffect(
    () => () => {
      setPending(null);
      setShowPassword(false);
    },
    [],
  );

  const finish = async () => {
    // Load the new session into the app before it checks who is signed in.
    await update();
    router.replace(callbackUrl);
  };

  const signInWithGoogle = async () => {
    setPending("google");
    setFormError(null);
    // Redirects to Google; the backend exchange happens in the Auth.js `signIn` callback.
    await signIn("google", { redirectTo: callbackUrl });
  };

  const submit = async (form: FormData) => {
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPending("email");
    setFormError(null);
    setFieldErrors({});

    try {
      if (mode === "sign-up") {
        const name = String(form.get("name") ?? "").trim();
        const session = await register({ name, email, password });
        const result = await signIn("session", {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresIn: String(session.expiresIn),
          redirect: false,
        });
        if (result?.error) throw new Error(credentialsMessage(result.code));
      } else {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error(credentialsMessage(result.code));
      }
      await finish();
    } catch (error) {
      setPending(null);
      if (error instanceof ApiError && error.code === "validation_error") {
        const fields = error.fieldErrors as Partial<Record<Field, string>>;
        setFieldErrors(fields);
        if (!Object.keys(fields).length) setFormError(error.message);
        return;
      }
      setFormError(error instanceof ApiError ? errorMessage(error) : error instanceof Error ? error.message : errorMessage(error));
    }
  };

  const fieldProps = (field: Field) => ({
    "aria-invalid": Boolean(fieldErrors[field]),
    "aria-describedby": fieldErrors[field] ? `${field}-error` : undefined,
  });
  const fieldError = (field: Field) =>
    fieldErrors[field] ? (
      <p id={`${field}-error`} className="text-xs text-destructive">
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">{copy.title}</h1>
      <p className="mt-1.5 text-[15px] text-muted-foreground">{copy.subtitle}</p>

      <Button
        type="button"
        variant="secondary"
        className="mt-8 h-11 w-full"
        disabled={pending !== null}
        onClick={() => void signInWithGoogle()}
      >
        {pending === "google" ? <LoaderCircle className="animate-spin" /> : <GoogleIcon className="size-4" />}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-subtle-foreground">
        <span className="h-px flex-1 bg-border" />
        or use your email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
        }}
      >
        {formError && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#f3c9c2] bg-[#fdf0ee] px-3 py-2.5 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {formError}
          </p>
        )}
        {mode === "sign-up" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" maxLength={80} className="h-11" required {...fieldProps("name")} />
            {fieldError("name")}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="h-11"
            required
            {...fieldProps("email")}
          />
          {fieldError("email")}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "sign-in" && (
              <Link href="/forgot-password" className="text-[13px] text-primary hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              minLength={mode === "sign-up" ? 8 : undefined}
              className="h-11 pr-10"
              required
              {...fieldProps("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-subtle-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {fieldError("password") ?? (mode === "sign-up" && <p className="text-xs text-muted-foreground">At least 8 characters.</p>)}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={pending !== null}>
          {pending === "email" && <LoaderCircle className="animate-spin" />}
          {copy.submit}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {copy.switchText}{" "}
        <Link href={copy.switchHref} className="font-medium text-primary hover:underline">
          {copy.switchLink}
        </Link>
      </p>
      <div className="mt-8 flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Just looking around?</p>
          <p className="text-[13px] text-muted-foreground">Open a workspace with sample documents. No account needed.</p>
        </div>
        <TryDemoButton variant="secondary" size="sm" disabled={pending !== null} className="shrink-0" />
      </div>
    </div>
  );
}
