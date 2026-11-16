"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
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
  const [pending, setPending] = useState(false);

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
    toast({
      title: "You're in the demo workspace",
      description: "Sample documents are ready to ask about. Nothing you do here affects anyone else.",
    });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Button type="button" onClick={() => void start()} disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && <LoaderCircle className="animate-spin" />}
      {children ?? label}
    </Button>
  );
}
