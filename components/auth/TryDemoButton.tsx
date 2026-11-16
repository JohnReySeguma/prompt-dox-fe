"use client";

import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLayoutEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/store/toast-store";

interface TryDemoButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  label?: string;
}

/**
 * Signs the visitor into a fresh, private demo workspace with sample documents.
 * The `demo` Auth.js provider calls `POST /v1/auth/demo` on the server.
 */
export function TryDemoButton({ label = "Try the demo", disabled, children, ...props }: TryDemoButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const { update } = useSession();
  const [pending, setPending] = useState(false);

  // Next.js keeps the previous page alive (hidden) for the back button, so a
  // finished sign-in would otherwise come back as a spinning button.
  useLayoutEffect(() => () => setPending(false), []);

  const start = async () => {
    setPending(true);
    const result = await signIn("demo", { redirect: false });
    if (!result || result.error) {
      setPending(false);
      toast({
        title: "The demo didn't open",
        // The backend's message (for example the hourly demo limit) arrives as `code`.
        description: result?.code && result.code !== "credentials" ? result.code : "Please try again in a moment.",
      });
      return;
    }
    // Load the new session into the app before it checks who is signed in.
    await update();
    toast({
      title: "You're in the demo workspace",
      description: "Sample documents are ready to ask about. Nothing you do here affects anyone else.",
    });
    router.push("/dashboard");
  };

  return (
    <Button type="button" onClick={() => void start()} disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && <LoaderCircle className="animate-spin" />}
      {children ?? label}
    </Button>
  );
}
