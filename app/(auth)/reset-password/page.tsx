import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  // The token comes from the query string, which is only known at request time,
  // so the form renders inside Suspense (required with Cache Components).
  return (
    <Suspense fallback={<div className="h-[420px] w-full max-w-[380px]" aria-hidden />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
