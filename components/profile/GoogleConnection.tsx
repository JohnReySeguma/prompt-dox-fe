"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { GoogleIcon } from "@/components/branding/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { errorMessage } from "@/lib/api/errors";
import { connectGoogle, disconnectGoogle } from "@/lib/api/me";
import { queryKeys } from "@/lib/queries";
import { useToast } from "@/store/toast-store";
import type { User } from "@/types";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
    };
  };
}

function loadGoogleIdentity(): Promise<GoogleIdentity> {
  const existing = (window as unknown as { google?: GoogleIdentity }).google;
  if (existing?.accounts?.id) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve((window as unknown as { google: GoogleIdentity }).google), { once: true });
    script.addEventListener("error", () => reject(new Error("Google sign-in couldn't load.")), { once: true });
  });
}

/**
 * Renders Google's own button, which returns a fresh ID token for
 * `POST /v1/me/connections/google`. (Going through Auth.js would replace the
 * current session instead of linking to it.)
 */
function GoogleButton({ onCredential }: { onCredential: (idToken: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const callback = useRef(onCredential);

  useEffect(() => {
    callback.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !container.current) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => response.credential && callback.current(response.credential),
        });
        google.accounts.id.renderButton(container.current, { theme: "outline", size: "large", text: "continue_with", width: 320 });
      })
      .catch((error: Error) => !cancelled && setLoadError(error.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) return <p className="text-sm text-destructive">{loadError}</p>;
  return <div ref={container} className="flex min-h-11 justify-center" />;
}

export function GoogleConnection({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const { update } = useSession();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const applyUser = (next: User) => {
    queryClient.setQueryData(queryKeys.me, next);
    void update({ user: next });
  };

  const connect = useMutation({
    mutationFn: connectGoogle,
    onSuccess: (next) => {
      applyUser(next);
      setOpen(false);
      toast({ title: "Google connected", description: "You can now sign in with Google." });
    },
  });

  const disconnect = useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: (next) => {
      applyUser(next);
      toast({ title: "Google disconnected", description: "Sign in with your email and password from now on." });
    },
  });

  const error = connect.error ?? disconnect.error;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <GoogleIcon className="size-5" />
          <div>
            <p className="text-sm font-medium">Google</p>
            <p className="text-xs text-muted-foreground">{user.googleConnected ? "Used for sign-in" : "Not connected"}</p>
          </div>
        </div>
        {user.googleConnected ? (
          <Button type="button" variant="secondary" size="sm" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
            {disconnect.isPending && <LoaderCircle className="animate-spin" />}
            Disconnect
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!CLIENT_ID}
            onClick={() => {
              connect.reset();
              setOpen(true);
            }}
          >
            Connect
          </Button>
        )}
      </div>
      {error && !open && (
        <p role="alert" className="mt-2 flex gap-1.5 text-xs text-destructive">
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          {errorMessage(error)}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Connect your Google account</DialogTitle>
            <DialogDescription>Choose the Google account you want to use to sign in to PromptDox.</DialogDescription>
          </DialogHeader>
          {connect.isPending ? (
            <p className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Connecting…
            </p>
          ) : (
            <GoogleButton onCredential={(idToken) => connect.mutate(idToken)} />
          )}
          {connect.isError && (
            <p role="alert" className="flex gap-1.5 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {errorMessage(connect.error)}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
