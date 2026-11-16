"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { SessionProvider, getSession, signOut, useSession } from "next-auth/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { setAccessToken, setAuthHandlers } from "@/lib/api/session";
import { useUploadStore } from "@/store/upload-store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        // Client errors (404, 409, 403…) won't fix themselves; only retry network and server errors.
        retry: (failureCount, error) =>
          failureCount < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
      },
    },
  });
}

/**
 * Hands the Auth.js session's access token and refresh/sign-out handlers to
 * the API client. The token is set in a layout effect, which runs before any
 * child's data fetching starts.
 */
function AuthBridge() {
  const { data: session, status, update } = useSession();
  const queryClient = useQueryClient();
  const signingOut = useRef(false);
  const lastUserId = useRef<string | null | undefined>(undefined);
  const accessToken = session?.accessToken ?? null;
  const refreshFailed = session?.error === "RefreshFailed";
  const userId = status === "loading" ? undefined : (session?.user?.id ?? null);

  useLayoutEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  // A different account (sign-out, demo → new account, another tab) must never
  // see the previous one's cached documents, chats or upload messages.
  useLayoutEffect(() => {
    if (userId === undefined) return;
    if (lastUserId.current !== undefined && lastUserId.current !== userId) {
      queryClient.clear();
      useUploadStore.setState({ uploads: [], errors: [] });
    }
    lastUserId.current = userId;
    if (userId) signingOut.current = false;
  }, [userId, queryClient]);

  useLayoutEffect(() => {
    const leave = () => {
      if (signingOut.current) return;
      signingOut.current = true;
      setAccessToken(null);
      void signOut({ redirectTo: "/sign-in" });
    };
    setAuthHandlers({
      refresh: async () => {
        // Rotation happens in the Auth.js `jwt` callback, which stores the new pair.
        const next = (await update({ refresh: true })) ?? (await getSession());
        if (!next?.accessToken || next.error) return null;
        return next.accessToken;
      },
      onUnauthorized: leave,
    });
    return () => setAuthHandlers(null);
  }, [update]);

  useEffect(() => {
    if (refreshFailed && !signingOut.current) {
      signingOut.current = true;
      setAccessToken(null);
      void signOut({ redirectTo: "/sign-in" });
    }
  }, [refreshFailed]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthBridge />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
