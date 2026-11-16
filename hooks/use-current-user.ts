"use client";

import { useSession } from "next-auth/react";
import { useMe } from "@/lib/queries";
import type { User } from "@/types";

/**
 * The signed-in user: the live `GET /v1/me` answer once loaded, otherwise the
 * copy stored in the session at sign-in (so the header never flashes empty).
 */
export function useCurrentUser(): User | null {
  const { data: session } = useSession();
  const { data: me } = useMe();
  if (me) return me;
  const user = session?.user;
  return user && "isDemo" in user ? user : null;
}
