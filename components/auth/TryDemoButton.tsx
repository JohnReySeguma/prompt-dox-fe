"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface TryDemoButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  label?: string;
}

/**
 * Opens the public demo (`/demo`): sample documents with pre-written answers.
 * No account is created. Only signed-out visitors see it; signed-in users
 * have their own workspace.
 */
export function TryDemoButton({ label = "Try the demo", children, ...props }: TryDemoButtonProps) {
  const { status } = useSession();
  if (status === "authenticated") return null;
  return (
    <Button asChild {...props}>
      <Link href="/demo">{children ?? label}</Link>
    </Button>
  );
}
