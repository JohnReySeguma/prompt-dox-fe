"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/store/toast-store";

interface TryDemoButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  label?: string;
}

/**
 * Signs the visitor into a demo workspace with sample documents.
 * Mocked for now; will call `POST /v1/auth/demo` (see API_CONTRACT.md §4.1).
 */
export function TryDemoButton({ label = "Try the demo", disabled, children, ...props }: TryDemoButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const start = () => {
    setPending(true);
    setTimeout(() => {
      toast({
        title: "You're in the demo workspace",
        description: "Seven sample documents are ready to ask about. Nothing you do here affects anyone else.",
      });
      router.push("/dashboard");
    }, 700);
  };

  return (
    <Button type="button" onClick={start} disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && <LoaderCircle className="animate-spin" />}
      {children ?? label}
    </Button>
  );
}
