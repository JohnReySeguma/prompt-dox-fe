"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound } from "lucide-react";
import { GoogleIcon } from "@/components/branding/GoogleIcon";
import { LogoMark } from "@/components/branding/Logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MOCK_USER } from "@/mock/site";

type Mode = "sign-in" | "sign-up";

const COPY: Record<Mode, { title: string; subtitle: string; submit: string; switchText: string; switchLink: string; switchHref: string }> = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to your PromptDox workspace",
    submit: "Sign in",
    switchText: "New to PromptDox?",
    switchLink: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    title: "Create your workspace",
    subtitle: "Start with 10 documents free, no card required",
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
    setTimeout(() => router.push("/dashboard"), 1100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="gradient-border glass-strong w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-black/50"
    >
      <div className="text-center">
        <Link href="/" aria-label="PromptDox home" className="inline-block">
          <LogoMark className="mx-auto size-11" />
        </Link>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="mt-8 h-11 w-full bg-white/6"
        disabled={pending !== null}
        onClick={() => fakeSignIn("google")}
      >
        {pending === "google" ? <LoaderCircle className="animate-spin" /> : <GoogleIcon className="size-4" />}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-white/10" />
        or with email
        <span className="h-px flex-1 bg-white/10" />
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
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="name" name="name" autoComplete="name" placeholder="Avery Santos" className="h-11 pl-10" required />
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              defaultValue={mode === "sign-in" ? MOCK_USER.email : undefined}
              className="h-11 pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "sign-in" && (
              <button type="button" className="text-xs text-cyan-300 hover:underline">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="••••••••"
              defaultValue={mode === "sign-in" ? "demo-password" : undefined}
              minLength={8}
              className="h-11 pr-10 pl-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={pending !== null}>
          {pending === "email" ? <LoaderCircle className="animate-spin" /> : null}
          {copy.submit}
          {pending !== "email" && <ArrowRight />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {copy.switchText}{" "}
        <Link href={copy.switchHref} className="font-medium text-cyan-300 hover:underline">
          {copy.switchLink}
        </Link>
      </p>
      <p className="mt-4 text-center text-[11px] text-muted-foreground/70">Demo mode: any credentials will sign you in.</p>
    </motion.div>
  );
}
