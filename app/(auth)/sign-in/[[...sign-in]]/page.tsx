import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  // The form reads `callbackUrl` and sign-in errors from the query string, known only at request time.
  return (
    <Suspense fallback={<div className="h-[640px] w-full max-w-[380px]" aria-hidden />}>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
