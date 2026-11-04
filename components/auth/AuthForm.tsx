"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { GoogleIcon } from "@/components/branding/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MOCK_USER } from "@/mock/site";

type Mode = "sign-in" | "sign-up";

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

/** Pure UI auth form: any submit "succeeds" after a short fake delay. */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [pending, setPending] = useState<"google" | "email" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fakeSignIn = (method: "google" | "email") => {
    setPending(method);
    setTimeout(() => router.push("/dashboard"), 1000);
  };

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">{copy.title}</h1>
      <p className="mt-1.5 text-[15px] text-muted-foreground">{copy.subtitle}</p>

      <Button
        type="button"
        variant="secondary"
        className="mt-8 h-11 w-full"
        disabled={pending !== null}
        onClick={() => fakeSignIn("google")}
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
          fakeSignIn("email");
        }}
      >
        {mode === "sign-up" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" className="h-11" required />
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
            defaultValue={mode === "sign-in" ? MOCK_USER.email : undefined}
            className="h-11"
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "sign-in" && (
              <button type="button" className="text-[13px] text-primary hover:underline">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              defaultValue={mode === "sign-in" ? "demo-password" : undefined}
              minLength={8}
              className="h-11 pr-10"
              required
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
          {mode === "sign-up" && <p className="text-xs text-muted-foreground">At least 8 characters.</p>}
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
      <p className="mt-8 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        Demo mode: any email and password will sign you in.
      </p>
    </div>
  );
}
