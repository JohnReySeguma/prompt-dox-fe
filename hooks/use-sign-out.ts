"use client";

import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useCallback, useState } from "react";

/**
 * Signs out: Auth.js revokes the refresh token on the backend
 * (`POST /v1/auth/logout`, in the `signOut` event) and clears its cookie.
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const run = useCallback(async () => {
    setPending(true);
    await signOut({ redirectTo: "/sign-in" });
    queryClient.clear();
  }, [queryClient]);
  return { signOut: run, pending };
}
